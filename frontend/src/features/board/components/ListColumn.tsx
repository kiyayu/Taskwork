//src/features/board/components/ListColumn.tsx  (complete)
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { listDropId } from '../utils/computeDrop'
import type { Column } from '../utils/groupTasks'
import { SortableTaskCard } from './SortableTaskCard'

type Props = {
  column: Column
  canEdit: boolean
  onAddTask: (listId: string) => void
  onOpenTask: (taskId: string) => void
}

export function ListColumn({ column, canEdit, onAddTask, onOpenTask }: Props) {
  const { t } = useTranslation('board')
  const { list, tasks } = column
  const { setNodeRef, isOver } = useDroppable({ id: listDropId(list.id), disabled: !canEdit })

  return (
    <section aria-label={list.name} className="flex flex-col w-72 max-h-full gap-3 p-3 shrink-0 bg-muted/50 border border-border rounded-xl">
      <header className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-sm font-semibold text-foreground truncate">{list.name}</h2>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </header>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className={cn('flex-1 min-h-10 space-y-2 overflow-y-auto rounded-lg', isOver && 'bg-primary/5')}>
          {tasks.length === 0 && <li className="px-1 text-xs text-muted-foreground">{t('emptyList')}</li>}
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} disabled={!canEdit} onOpen={onOpenTask} />
          ))}
        </ul>
      </SortableContext>

      {canEdit && (
        <Button variant="ghost" size="sm" className="justify-start" onClick={() => onAddTask(list.id)} icon={<Plus />}>
          {t('addTask')}
        </Button>
      )}
    </section>
  )
}