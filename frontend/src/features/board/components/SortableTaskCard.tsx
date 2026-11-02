//src/features/board/components/SortableTaskCard.tsx  (complete)
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { BoardTask } from '../types/board.types'
import { TaskCard } from './TaskCard'

type Props = { task: BoardTask; disabled: boolean; onOpen: (taskId: string) => void }

export function SortableTaskCard({ task, disabled, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled, // viewers cannot drag (the server also refuses)
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', isDragging && 'opacity-40')}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onOpen={onOpen} />
    </li>
  )
}