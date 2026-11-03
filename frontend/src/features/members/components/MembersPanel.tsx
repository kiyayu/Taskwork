//src/features/members/components/MembersPanel.tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { paths } from '@/config/paths'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { sessionQueryOptions } from '@/features/auth'
import { useProject } from '@/features/projects'
import { useMembers, useRemoveMember, useUpdateRole } from '../hooks/useMembers'
import type { Member } from '../types/member.types'
import { memberActions } from '../utils/permissions'
import { InvitesSection } from './InvitesSection'
import { MemberRow } from './MemberRow'

// One state value says which confirmation is open.
type Confirm = { type: 'none' } | { type: 'remove'; member: Member } | { type: 'leave' }

export function MembersPanel({ projectId }: { projectId: string }) {
  const { t } = useTranslation('members')
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState<Confirm>({ type: 'none' })
  const closeConfirm = () => setConfirm({ type: 'none' })

  const { data: me } = useQuery(sessionQueryOptions)
  const project = useProject(projectId)
  const members = useMembers(projectId)
  const updateRole = useUpdateRole(projectId)
  const remove = useRemoveMember(projectId)

  const back = (
    <Button asChild variant="ghost" size="sm" className="self-start">
      <Link to={paths.app.projectBoard(projectId)}><ArrowLeft className="size-4" />{t('back')}</Link>
    </Button>
  )

  if (project.isError) {
    return <div className="space-y-4">{back}<p className="text-sm text-muted-foreground">{t('notFound')}</p></div>
  }
  if (project.isPending || members.isPending) return <Skeleton className="w-full h-48" />
  if (members.isError && !members.data) return <p className="text-sm text-destructive">{t('loadFailed')}</p>

  const myRole = project.data.role
  const myId = me?.id ?? ''
  const busy = updateRole.isPending || remove.isPending

  const confirmRemove = () => {
    const target = confirm.type === 'remove' ? confirm.member.userId : myId
    const leaving = confirm.type === 'leave'
    remove.mutate(target, {
      onSuccess: () => {
        toast.success(t(leaving ? 'left' : 'removed'))
        closeConfirm()
        if (leaving) navigate(paths.app.projects, { replace: true }) // I no longer have access to this project
      },
    })
  }

  return (
    <div className="space-y-8">
      {back}
      <PageHeader title={t('title')} description={t('description')} />

      <ul className="space-y-2">
        {(members.data ?? []).map((m) => {
          const a = memberActions(myRole, myId, m)
          return (
            <MemberRow
              key={m.userId}
              member={m}
              isMe={m.userId === myId}
              busy={busy}
              {...a}
              onChangeRole={(role) =>
                updateRole.mutate({ userId: m.userId, role }, {
                  onSuccess: () => toast.success(t('roleChanged')),
                  onError: (e) => toast.error(getErrorMessage(e)),
                })
              }
              onRemove={() => setConfirm({ type: 'remove', member: m })}
              onLeave={() => setConfirm({ type: 'leave' })}
            />
          )
        })}
      </ul>

      {myRole === 'owner' && <InvitesSection projectId={projectId} />}

      <ConfirmDialog
        open={confirm.type !== 'none'}
        onOpenChange={(o) => { if (!o) { closeConfirm(); remove.reset() } }}
        title={t(confirm.type === 'leave' ? 'leaveTitle' : 'removeTitle')}
        description={t(confirm.type === 'leave' ? 'leaveDescription' : 'removeDescription')}
        confirmLabel={t(confirm.type === 'leave' ? 'leaveConfirm' : 'removeConfirm')}
        isPending={remove.isPending}
        error={remove.error ? getErrorMessage(remove.error) : undefined}
        onConfirm={confirmRemove}
      />
    </div>
  )
}