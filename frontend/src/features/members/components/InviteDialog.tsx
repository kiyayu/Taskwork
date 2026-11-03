//src/features/members/components/InviteDialog.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormSelect } from '@/components/ui/form-select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { useCreateInvite } from '../hooks/useMembers'
import { inviteSchema, type InviteFormValues } from '../schemas/invite.schema'
import type { CreatedInvite } from '../types/member.types'
import { buildInviteLink } from '../utils/inviteLink'

type Props = { projectId: string; open: boolean; onOpenChange: (open: boolean) => void }

const DEFAULTS: InviteFormValues = { role: 'editor', expiresInDays: '7', maxUses: '10' }

export function InviteDialog({ projectId, open, onOpenChange }: Props) {
  const { t } = useTranslation('members')
  const create = useCreateInvite(projectId)
  // the raw token lives ONLY in this state; closing the dialog discards it for good
  const [created, setCreated] = useState<CreatedInvite | null>(null)

  const { handleSubmit, reset, control } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: DEFAULTS,
  })

   
  const [prevOpen, setPrevOpen] = useState(open)
  if (open && !prevOpen) {
    reset(DEFAULTS)
    setCreated(null)
    create.reset()
  }
  if (open !== prevOpen) {
    setPrevOpen(open)
  }

  const roleOptions = (['editor', 'viewer'] as const).map((v) => ({ value: v, label: t(`role.${v}`) }))
  const dayOptions = (['1', '7', '30'] as const).map((v) => ({ value: v, label: t(`days.${v}`) }))
  const useOptions = (['1', '5', '10', '50'] as const).map((v) => ({ value: v, label: t(`uses.${v}`) }))

  const link = created ? buildInviteLink(created.token, window.location.origin) : ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success(t('dialog.copied'))
    } catch {
      toast.error(t('dialog.copyFailed')) // clipboard needs a secure context and permission
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !create.isPending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-base font-semibold text-foreground">
          {created ? t('dialog.createdTitle') : t('dialog.title')}
        </DialogTitle>

        {created ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('dialog.warning', { role: t(`role.${created.role}`) })}</p>
            <Input label={t('dialog.linkLabel')} readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t('dialog.done')}</Button>
              <Button onClick={copy}>{t('dialog.copy')}</Button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            noValidate
            onSubmit={handleSubmit((v) =>
              create.mutate(
                { role: v.role, expiresInDays: Number(v.expiresInDays), maxUses: Number(v.maxUses) },
                { onSuccess: setCreated }
              )
            )}
          >
            {create.error != null && (
              <p role="alert" className="px-3 py-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">
                {getErrorMessage(create.error)}
              </p>
            )}
            <FormSelect name="role" control={control} label={t('dialog.role')} options={roleOptions} />
            <p className="text-xs text-muted-foreground">{t('roleHint.editor')} · {t('roleHint.viewer')}</p>
            <FormSelect name="expiresInDays" control={control} label={t('dialog.expires')} options={dayOptions} />
            <FormSelect name="maxUses" control={control} label={t('dialog.maxUses')} options={useOptions} />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" disabled={create.isPending} onClick={() => onOpenChange(false)}>
                {t('actions.cancel', { ns: 'common' })}
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? t('status.saving', { ns: 'common' }) : t('dialog.submit')}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}