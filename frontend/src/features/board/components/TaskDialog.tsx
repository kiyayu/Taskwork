//src/features/board/components/TaskDialog.tsx
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormSelect } from '@/components/ui/form-select'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { translateMessage } from '@/lib/i18n/translate'
import { taskSchema, type TaskForm } from '../schemas/board.schema'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending: boolean
  error?: unknown
  onSubmit: (input: { title: string; description: string; priority: 1 | 2 | 3 }) => void
}

const EMPTY: TaskForm = { title: '', description: '', priority: '2' }

export function TaskDialog({ open, onOpenChange, isPending, error, onSubmit }: Props) {
  const { t } = useTranslation('board')
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => { if (open) reset(EMPTY) }, [open, reset])

  const priorityOptions = (['1', '2', '3'] as const).map((v) => ({ value: v, label: t(`priority.${v}`) }))

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-base font-semibold text-foreground">{t('task.createTitle')}</DialogTitle>
        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit((d) =>
            onSubmit({ title: d.title, description: d.description, priority: Number(d.priority) as 1 | 2 | 3 })
          )}
        >
          {error != null && (
            <p role="alert" className="px-3 py-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">
              {getErrorMessage(error)}
            </p>
          )}
          <Input label={t('task.title')} autoComplete="off"
            {...register('title')} error={translateMessage(t, errors.title?.message)} />

          <div className="w-full space-y-1.5">
            <label htmlFor="task-description" className="text-sm font-medium leading-none text-foreground">
              {t('task.description')}
            </label>
            <Textarea id="task-description" rows={4} {...register('description')} />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">{translateMessage(t, errors.description.message)}</p>
            )}
          </div>

          <FormSelect name="priority" control={control} label={t('task.priority')} options={priorityOptions} />

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
              {t('actions.cancel', { ns: 'common' })}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('status.saving', { ns: 'common' }) : t('task.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}