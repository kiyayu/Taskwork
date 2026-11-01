//src/features/projects/components/ProjectNameDialog.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { translateMessage } from '@/lib/i18n/translate'
import { projectNameSchema, type ProjectNameForm } from '../schemas/project.schema'

// One dialog for both "create" and "rename": the caller passes the title, button label and handler.
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  submitLabel: string
  initialName?: string
  isPending: boolean
  error?: unknown
  onSubmit: (name: string) => void
}

export function ProjectNameDialog({
  open, onOpenChange, title, submitLabel, initialName = '', isPending, error, onSubmit,
}: Props) {
  const { t } = useTranslation('projects')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectNameForm>({
    resolver: zodResolver(projectNameSchema),
    defaultValues: { name: initialName },
  })

  // a fresh form every time the dialog opens
  useEffect(() => {
    if (open) reset({ name: initialName })
  }, [open, initialName, reset])

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-base font-semibold text-foreground">{title}</DialogTitle>
        <form className="space-y-4" onSubmit={handleSubmit((d) => onSubmit(d.name))} noValidate>
          {error != null && (
            <p role="alert" className="px-3 py-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">
              {getErrorMessage(error)}
            </p>
          )}
          <Input
            label={t('form.name')}
            placeholder={t('form.namePlaceholder')}
            autoComplete="off"
            {...register('name')}
            error={translateMessage(t, errors.name?.message)}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('status.saving', { ns: 'common' }) : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}