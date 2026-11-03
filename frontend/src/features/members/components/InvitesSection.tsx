//src/features/members/components/InvitesSection.tsx
import { useState } from 'react'
import { Link2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import { useInvites, useRevokeInvite } from '../hooks/useMembers'
import { InviteDialog } from './InviteDialog'

// Rendered for the owner only.
export function InvitesSection({ projectId }: { projectId: string }) {
  const { t } = useTranslation('members')
  const [open, setOpen] = useState(false)
  const invites = useInvites(projectId, true)
  const revoke = useRevokeInvite(projectId)

  return (
    <section className="space-y-3" aria-labelledby="invites-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 id="invites-title" className="text-base font-semibold text-foreground">{t('invites.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('invites.description')}</p>
        </div>
        <Button onClick={() => setOpen(true)} icon={<Link2 />}>{t('invites.create')}</Button>
      </div>

      {invites.isPending && <Skeleton className="w-full h-16" />}
      {invites.isError && !invites.data && <p className="text-sm text-destructive">{t('invites.loadFailed')}</p>}
      {invites.data?.length === 0 && <p className="text-sm text-muted-foreground">{t('invites.empty')}</p>}

      <ul className="space-y-2">
        {invites.data?.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 p-3 border border-border rounded-lg">
            <div className="min-w-0 text-sm">
              <p className="font-medium text-foreground">{t(`role.${i.role}`)}</p>
              <p className="text-xs text-muted-foreground">
                {t('invites.usesOf', { uses: i.uses, max: i.maxUses })} · {t('invites.expires', { date: formatDate(i.expiresAt) })}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="size-9" aria-label={t('invites.revoke')} icon={<Trash2 />}
              disabled={revoke.isPending}
              onClick={() =>
                revoke.mutate(i.id, {
                  onSuccess: () => toast.success(t('invites.revoked')),
                  onError: (e) => toast.error(getErrorMessage(e)),
                })
              } />
          </li>
        ))}
      </ul>

      <InviteDialog projectId={projectId} open={open} onOpenChange={setOpen} />
    </section>
  )
}