//src/features/board/task/TaskReadOnly.tsx
import { formatDate } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import type { BoardTask } from '../types/board.types'

// What a viewer sees. The server refuses edits anyway.
export function TaskReadOnly({ task }: { task: BoardTask }) {
  const { t } = useTranslation('board')

  return (
    <dl className="space-y-3 text-sm">
      <div>
        <dt className="text-xs text-muted-foreground">{t('task.title')}</dt>
        <dd className="font-medium text-foreground">{task.title}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">{t('task.description')}</dt>
        <dd className="text-foreground whitespace-pre-wrap">{task.description || t('details.noDescription')}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">{t('task.priority')}</dt>
        <dd className="text-foreground">{t(`priority.${task.priority}`)}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">{t('details.assignee')}</dt>
        <dd className="text-foreground">{task.assigneeName ?? t('unassigned')}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">{t('details.dueDate')}</dt>
        <dd className="text-foreground">{task.dueDate ? formatDate(task.dueDate) : t('details.noDueDate')}</dd>
      </div>
    </dl>
  )
}