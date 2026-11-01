//src/features/board/utils/groupTasks.ts
import type { BoardList, BoardTask } from '../types/board.types'

export type Column = { list: BoardList; tasks: BoardTask[] }

// Lists in their order, each with its own tasks in order. Tasks pointing at an unknown list are dropped.
export const groupTasksByList = (lists: BoardList[], tasks: BoardTask[]): Column[] =>
  [...lists]
    .sort((a, b) => a.order - b.order)
    .map((list) => ({
      list,
      tasks: tasks.filter((t) => t.listId === list.id && !t.archived).sort((a, b) => a.order - b.order),
    }))