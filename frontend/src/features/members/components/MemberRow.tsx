//src/features/members/components/MemberRow.tsx
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import type { InviteRole, Member } from '../types/member.types'

type Props = {
  member: Member
  isMe: boolean
  canChangeRole: boolean
  canRemove: boolean
  canLeave: boolean
  busy: boolean
  onChangeRole: (role: InviteRole) => void
  onRemove: () => void
  onLeave: () => void
}

export function MemberRow({ member, isMe, canChangeRole, canRemove, canLeave, busy, onChangeRole, onRemove, onLeave }: Props) {
  const { t } = useTranslation('members')

  return (
    <li className="flex flex-col gap-3 p-3 border border-border rounded-lg sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {member.name} {isMe && <span className="text-muted-foreground">{t('you')}</span>}
        </p>
        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
      </div>

      <div className="flex items-center gap-2">
        {canChangeRole ? (
          // a native select: accessible by default, and the value set is tiny
          <select
            aria-label={t('changeRole', { name: member.name })}
            value={member.role}
            disabled={busy}
            onChange={(e) => onChangeRole(e.target.value as InviteRole)}
            className="h-9 px-2 text-sm text-foreground bg-card border border-input rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="editor">{t('role.editor')}</option>
            <option value="viewer">{t('role.viewer')}</option>
          </select>
        ) : (
          <span className="px-2 py-1 text-xs text-primary bg-primary/10 rounded-lg">{t(`role.${member.role}`)}</span>
        )}

        {canRemove && (
          <Button variant="ghost" size="icon" className="size-9" disabled={busy}
            aria-label={t('remove', { name: member.name })} icon={<Trash2 />} onClick={onRemove} />
        )}
        {canLeave && (
          <Button variant="outline" size="sm" disabled={busy} onClick={onLeave}>{t('leave')}</Button>
        )}
      </div>
    </li>
  )
}