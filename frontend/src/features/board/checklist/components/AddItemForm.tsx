//src/features/board/checklist/components/AddItemForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/lib/i18n'
import { translateMessage } from '@/lib/i18n/translate'
import { checklistItemSchema, type ChecklistItemForm } from '../schemas/checklist.schema'

type Props = {
  placeholder: string
  submitLabel: string
  isPending: boolean
  autoFocus?: boolean
  // onDone clears the field; the parent calls it only after the server accepted the item
  onSubmit: (title: string, onDone: () => void) => void
  onCancel?: () => void
}

export function AddItemForm({ placeholder, submitLabel, isPending, autoFocus, onSubmit, onCancel }: Props) {
  const { t } = useTranslation('board')
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChecklistItemForm>({
    resolver: zodResolver(checklistItemSchema),
    defaultValues: { title: '' },
  })

  return (
    <form className="flex items-start gap-2" noValidate onSubmit={handleSubmit((d) => onSubmit(d.title, () => reset()))}>
      <div className="flex-1">
        <Input aria-label={placeholder} placeholder={placeholder} autoComplete="off" autoFocus={autoFocus}
          inputSize="sm" {...register('title')} error={translateMessage(t, errors.title?.message)} />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>{submitLabel}</Button>
      {onCancel && (
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>{t('checklist.cancel')}</Button>
      )}
    </form>
  )
}