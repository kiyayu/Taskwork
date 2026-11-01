//src/features/board/components/ListDialog.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { translateMessage } from '@/lib/i18n/translate'
import { listSchema, type ListForm } from '../schemas/board.schema'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  error?: unknown
  onSubmit: (name: string) => void
}

export function ListDialog({ open, onOpenChange, isPending, error, onSubmit }: Props) {
  const { t } = useTranslation('board')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ListForm>({
    resolver: zodResolver(listSchema),
    defaultValues: { name: '' },
  })

  useEffect(() => { if (open) reset({ name: '' }) }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-base font-semibold text-foreground">{t('list.createTitle')}</DialogTitle>
        <form className="space-y-4" onSubmit={handleSubmit((d) => onSubmit(d.name))} noValidate>
          {error != null && (
            <p role="alert" className="px-3 py-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">
              {getErrorMessage(error)}
            </p>
          )}
          <Input label={t('list.name')} placeholder={t('list.namePlaceholder')} autoComplete="off"
            {...register('name')} error={translateMessage(t, errors.name?.message)} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('status.saving', { ns: 'common' }) : t('list.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}