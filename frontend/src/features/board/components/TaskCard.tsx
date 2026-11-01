//src/features/board/components/TaskCard.tsx
import { CalendarDays, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { BoardTask } from '../types/board.types'

// Priority is shown by words AND a dot, never by color alone.
const priorityStyle: Record<BoardTask['priority'], string> = {
  1: 'bg-destructive',
  2: 'bg-warning',
  3: 'bg-info',
}

// Purely visual: also used inside the drag overlay.
export function TaskCard({ task, className }: { task: BoardTask; className?: string }) {
  const { t } = useTranslation('board')
  const { progress } = task

  return (
    <div className={cn('p-3 space-y-3 bg-card border border-border rounded-lg shadow-sm', className)}>
      <p className="text-sm font-medium text-foreground break-words">{task.title}</p>

      {progress.total > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar"
            aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}
            aria-label={t('progress', { done: progress.done, total: progress.total })}>
            <div className="h-full bg-primary" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{t('progress', { done: progress.done, total: progress.total })}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className={cn('size-2 rounded-full', priorityStyle[task.priority])} aria-hidden />
          {t(`priority.${task.priority}`)}
        </span>
        {task.dueDate && (
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" aria-hidden />
            {t('due', { date: formatDate(task.dueDate) })}
          </span>
        )}
        {task.commentCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" aria-hidden />
            {task.commentCount}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground truncate">{task.assigneeName ?? t('unassigned')}</p>
    </div>
  )
}