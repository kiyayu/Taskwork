//src/features/live/hooks/useProjectLive.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { API_BASE_URL } from '@/lib/axios'
import { authApi } from '@/features/auth'
import { keysForEvent, parseEvent, uniqueKeys } from '../utils/events'

const BATCH_MS = 150
const MAX_RETRIES = 5

export function useProjectLive(projectId: string, myUserId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!projectId || !myUserId) return

    let source: EventSource | null = null
    let closed = false
    let retries = 0
    let retryTimer: number | undefined
    let batchTimer: number | undefined
    let pending: (readonly unknown[])[] = []

    const flush = () => {
      batchTimer = undefined
      for (const key of uniqueKeys(pending)) queryClient.invalidateQueries({ queryKey: key })
      pending = []
    }

    const connect = () => {
      if (closed) return
      source = new EventSource(`${API_BASE_URL}projects/${projectId}/stream`, { withCredentials: true })

      source.onopen = () => { retries = 0 }

      source.onmessage = (msg) => {
        const event = parseEvent(msg.data)
        if (!event || event.projectId !== projectId) return
        if (event.actorId === myUserId) return // my own change already updated my cache
        pending.push(...keysForEvent(event))
        if (pending.length && batchTimer === undefined) batchTimer = window.setTimeout(flush, BATCH_MS)
      }

      source.onerror = () => {
        // The browser retries by itself while readyState is CONNECTING. CLOSED means it gave up
        // (usually a 401 after the access cookie expired), so we refresh the session and reconnect.
        if (!source || source.readyState !== EventSource.CLOSED || closed) return
        source.close()
        if (retries >= MAX_RETRIES) return
        retries += 1
        retryTimer = window.setTimeout(async () => {
          try { await authApi.getProfile() } catch { /* the axios flow already handled an expired session */ }
          connect()
        }, Math.min(1000 * 2 ** retries, 30_000))
      }
    }

    connect()

    return () => {
      closed = true
      source?.close()
      window.clearTimeout(retryTimer)
      window.clearTimeout(batchTimer)
    }
  }, [projectId, myUserId, queryClient])
}