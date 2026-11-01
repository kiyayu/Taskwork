//src/features/board/components/ListColumn.tsx
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'
import type { Column } from '../utils/groupTasks'
import { TaskCard } from './TaskCard'

type Props = {
  column: Column
  canEdit: boolean
  onAddTask: (listId: string) => void
}

export function ListColumn({ column, canEdit, onAddTask }: Props) {
  const { t } = useTranslation('board')
  const { list, tasks } = column

  return (
    <section aria-label={list.name} className="flex flex-col w-72 max-h-full gap-3 p-3 shrink-0 bg-muted/50 border border-border rounded-xl">
      <header className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-sm font-semibold text-foreground truncate">{list.name}</h2>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </header>

      <ul className="flex-1 space-y-2 overflow-y-auto">
        {tasks.length === 0 && <li className="px-1 text-xs text-muted-foreground">{t('emptyList')}</li>}
        {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
      </ul>

      {canEdit && (
        <Button variant="ghost" size="sm" className="justify-start" onClick={() => onAddTask(list.id)} icon={<Plus />}>
          {t('addTask')}
        </Button>
      )}
    </section>
  )
}