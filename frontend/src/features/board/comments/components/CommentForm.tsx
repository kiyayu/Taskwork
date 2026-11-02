//src/features/board/comments/components/CommentForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { translateMessage } from '@/lib/i18n/translate'
import { useMembers } from '@/features/members'
import { useAddComment } from '../hooks/useComments'
import { commentSchema, type CommentFormValues } from '../schemas/comment.schema'
import { insertMention, resolveMentions } from '../utils/mentions'

type Props = { projectId: string; taskId: string; currentUserId: string }

export function CommentForm({ projectId, taskId, currentUserId }: Props) {
  const { t } = useTranslation('board')
  const members = useMembers(projectId)
  const add = useAddComment(projectId, taskId)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  })
  const text = watch('text')

  // you cannot mention yourself (the server ignores it anyway)
  const candidates = (members.data ?? []).filter((m) => m.userId !== currentUserId)

  const onSubmit = (values: CommentFormValues) =>
    add.mutate(
      { text: values.text, mentions: resolveMentions(values.text, candidates) },
      {
        onSuccess: () => reset({ text: '' }),
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    )

  return (
    <form className="space-y-2" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Textarea rows={3} aria-label={t('comments.placeholder')} placeholder={t('comments.placeholder')} {...register('text')} />
      {errors.text && (
        <p className="text-xs font-medium text-destructive">{translateMessage(t, errors.text.message)}</p>
      )}

      {candidates.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={t('comments.mention')}>
          <span className="text-xs text-muted-foreground">{t('comments.mention')}</span>
          {candidates.map((m) => (
            <Button key={m.userId} type="button" variant="outline" size="sm" className="h-7 px-2"
              onClick={() => setValue('text', insertMention(text, m.name), { shouldDirty: true })}>
              @{m.name}
            </Button>
          ))}
        </div>
      )}

      <Button type="submit" size="sm" disabled={add.isPending}>
        {add.isPending ? t('status.saving', { ns: 'common' }) : t('comments.submit')}
      </Button>
    </form>
  )
}