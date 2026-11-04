//src/features/admin/components/UsersTable.tsx
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import { useAdminUsers, useUpdateUser } from '../hooks/useAdmin'
import type { AdminUser, Plan } from '../types'

type Confirm = { type: 'none' } | { type: 'deactivate'; user: AdminUser }

export function UsersTable() {
  const { t } = useTranslation('admin')
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState<Confirm>({ type: 'none' })

  // wait for a pause in typing before asking the server
  useEffect(() => {
    const id = window.setTimeout(() => { setTerm(search.trim()); setPage(1) }, 300)
    return () => window.clearTimeout(id)
  }, [search])

  const query = useAdminUsers({ page, search: term })
  const update = useUpdateUser()
  const fail = (e: unknown) => toast.error(getErrorMessage(e))

  const rows = query.data?.items ?? []
  const pagination = query.data?.pagination

  return (
    <section className="space-y-4" aria-labelledby="users-title">
      <h2 id="users-title" className="text-base font-semibold text-foreground">{t('users.title')}</h2>
      <Input aria-label={t('users.search')} placeholder={t('users.search')} value={search}
        onChange={(e) => setSearch(e.target.value)} autoComplete="off" />

      {query.isPending && <Skeleton className="w-full h-48" />}
      {query.isError && !query.data && <p className="text-sm text-destructive">{t('loadFailed')}</p>}
      {query.data && rows.length === 0 && <p className="text-sm text-muted-foreground">{t('users.empty')}</p>}

      {rows.length > 0 && (
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground bg-muted/50">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">{t('users.name')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('users.plan')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('users.status')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('users.projects')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('users.joined')}</th>
                <th scope="col" className="px-3 py-2 font-medium">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((u) => {
                const locked = u.role === 'admin' // the server refuses these too
                return (
                  <tr key={u.id}>
                    <td className="px-3 py-2">
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        aria-label={t('users.changePlan', { name: u.name })}
                        value={u.plan}
                        disabled={locked || update.isPending}
                        onChange={(e) =>
                          update.mutate({ userId: u.id, plan: e.target.value as Plan }, {
                            onSuccess: () => toast.success(t('users.updated')), onError: fail,
                          })
                        }
                        className="h-9 px-2 text-foreground bg-card border border-input rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                      >
                        <option value="free">{t('users.free')}</option>
                        <option value="pro">{t('users.pro')}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      {locked ? t('users.admin') : u.isActive ? t('users.active') : t('users.inactive')}
                    </td>
                    <td className="px-3 py-2">{u.projectsOwned}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-3 py-2">
                      {!locked && (u.isActive ? (
                        <Button variant="outline" size="sm" disabled={update.isPending}
                          onClick={() => setConfirm({ type: 'deactivate', user: u })}>{t('users.deactivate')}</Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled={update.isPending}
                          onClick={() => update.mutate({ userId: u.id, isActive: true }, {
                            onSuccess: () => toast.success(t('users.updated')), onError: fail,
                          })}>{t('users.activate')}</Button>
                      ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPage > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>{t('users.previous')}</Button>
          <span className="text-xs text-muted-foreground">{t('users.pageOf', { current: pagination.currentPage, total: pagination.totalPage })}</span>
          <Button variant="outline" size="sm" disabled={page >= pagination.totalPage} onClick={() => setPage((p) => p + 1)}>{t('users.next')}</Button>
        </div>
      )}

      <ConfirmDialog
        open={confirm.type === 'deactivate'}
        onOpenChange={(o) => { if (!o) { setConfirm({ type: 'none' }); update.reset() } }}
        title={t('users.deactivateTitle')}
        description={t('users.deactivateDescription')}
        confirmLabel={t('users.deactivate')}
        isPending={update.isPending}
        error={update.error ? getErrorMessage(update.error) : undefined}
        onConfirm={() => {
          if (confirm.type !== 'deactivate') return
          update.mutate({ userId: confirm.user.id, isActive: false }, {
            onSuccess: () => { toast.success(t('users.updated')); setConfirm({ type: 'none' }) },
          })
        }}
      />
    </section>
  )
}