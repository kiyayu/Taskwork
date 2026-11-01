//src/features/board/components/SortableTaskCard.tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { BoardTask } from '../types/board.types'
import { TaskCard } from './TaskCard'

export function SortableTaskCard({ task, disabled }: { task: BoardTask; disabled: boolean }) {
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
      <TaskCard task={task} />
    </li>
  )
}