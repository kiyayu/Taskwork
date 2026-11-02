//src/features/board/comments/components/Comments.tsx
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/errors'
import { formatDateTime } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import { useMembers } from '@/features/members'
import { useComments, useRemoveComment } from '../hooks/useComments'
import { splitMentions } from '../utils/mentions'
import { CommentForm } from './CommentForm'

type Props = { projectId: string; taskId: string; canEdit: boolean; isOwner: boolean; currentUserId: string }

export function Comments({ projectId, taskId, canEdit, isOwner, currentUserId }: Props) {
  const { t } = useTranslation('board')
  const query = useComments(projectId, taskId)
  const members = useMembers(projectId)
  const remove = useRemoveComment(projectId, taskId)

  if (query.isPending) return <Skeleton className="w-full h-20" />
  if (query.isError && !query.data) return <p className="text-sm text-destructive">{t('comments.loadFailed')}</p>

  const names = (members.data ?? []).map((m) => m.name)
  const comments = query.data ?? []

  return (
    <div className="space-y-4">
      {comments.length === 0 && <p className="text-sm text-muted-foreground">{t('comments.empty')}</p>}

      <ul className="space-y-3">
        {comments.map((c) => {
          const canDelete = c.authorId === currentUserId || isOwner
          return (
            <li key={c.id} className="p-3 space-y-1 border border-border rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{c.authorName}</span> · {formatDateTime(c.createdAt)}
                </p>
                {canDelete && (
                  <Button variant="ghost" size="icon" className="size-7" aria-label={t('comments.delete')} icon={<Trash2 />}
                    disabled={remove.isPending}
                    onClick={() =>
                      remove.mutate(c.id, {
                        onSuccess: () => toast.success(t('comments.deleted')),
                        onError: (e) => toast.error(getErrorMessage(e)),
                      })
                    } />
                )}
              </div>
              {/* React text nodes only: comment text is user content and is never injected as HTML */}
              <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                {splitMentions(c.text, names).map((part, i) =>
                  part.mention ? (
                    <span key={i} className="font-medium text-primary">{part.text}</span>
                  ) : (
                    <span key={i}>{part.text}</span>
                  )
                )}
              </p>
            </li>
          )
        })}
      </ul>

      {canEdit && <CommentForm projectId={projectId} taskId={taskId} currentUserId={currentUserId} />}
    </div>
  )
}