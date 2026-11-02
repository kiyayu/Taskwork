//src/features/board/task/TaskDetailsForm.tsx
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormSelect } from '@/components/ui/form-select'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { translateMessage } from '@/lib/i18n/translate'
import { useMembers } from '@/features/members'
import { useUpdateTask } from '../hooks/useBoard'
import { taskDetailsSchema, type TaskDetailsFormValues } from '../schemas/board.schema'
import type { BoardTask } from '../types/board.types'
import { NO_ASSIGNEE, toForm, toUpdateInput } from '../utils/taskForm'

type Props = { projectId: string; task: BoardTask }

export function TaskDetailsForm({ projectId, task }: Props) {
  const { t } = useTranslation('board')
  const descriptionId = useId()
  const members = useMembers(projectId)
  const update = useUpdateTask(projectId)

  const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<TaskDetailsFormValues>({
    resolver: zodResolver(taskDetailsSchema),
    defaultValues: toForm(task),
  })

  const priorityOptions = (['1', '2', '3'] as const).map((v) => ({ value: v, label: t(`priority.${v}`) }))
  const assigneeOptions = [
    { value: NO_ASSIGNEE, label: t('unassigned') },
    ...(members.data ?? []).map((m) => ({ value: m.userId, label: m.name })),
  ]

  const onSubmit = (values: TaskDetailsFormValues) =>
    update.mutate(
      { taskId: task.id, ...toUpdateInput(values) },
      {
        onSuccess: () => {
          toast.success(t('panel.saved'))
          reset(values) // the saved values become the new "clean" state
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    )

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Input label={t('task.title')} autoComplete="off"
        {...register('title')} error={translateMessage(t, errors.title?.message)} />

      <div className="w-full space-y-1.5">
        <label htmlFor={descriptionId} className="text-sm font-medium leading-none text-foreground">
          {t('task.description')}
        </label>
        <Textarea id={descriptionId} rows={5} {...register('description')} />
        {errors.description && (
          <p className="text-xs font-medium text-destructive">{translateMessage(t, errors.description.message)}</p>
        )}
      </div>

      <FormSelect name="priority" control={control} label={t('task.priority')} options={priorityOptions} />
      <FormSelect name="assigneeId" control={control} label={t('details.assignee')} options={assigneeOptions} />
      <Input label={t('details.dueDate')} type="date" {...register('dueDate')} />

      <Button type="submit" disabled={!isDirty || update.isPending}>
        {update.isPending ? t('status.saving', { ns: 'common' }) : t('panel.save')}
      </Button>
    </form>
  )
}