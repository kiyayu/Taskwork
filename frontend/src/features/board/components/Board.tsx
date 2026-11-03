//src/features/board/components/Board.tsx  (complete)
import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor,
  closestCorners, useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ArrowLeft, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { paths } from '@/config/paths'
import { useTranslation } from '@/lib/i18n'
import { useProject } from '@/features/projects'
import { useCreateList, useCreateTask, useLists, useMoveTask, useTasks } from '../hooks/useBoard'
import { TaskPanel } from '../task/TaskPanel'
import { computeDrop } from '../utils/computeDrop'
import { groupTasksByList } from '../utils/groupTasks'
import { ListColumn } from './ListColumn'
import { ListDialog } from './ListDialog'
import { TaskCard } from './TaskCard'
import { TaskDialog } from './TaskDialog'
import { useQuery } from '@tanstack/react-query'
import { sessionQueryOptions } from '@/features/auth'
import { useProjectLive } from '@/features/live'
type DialogState = { type: 'none' } | { type: 'list' } | { type: 'task'; listId: string }

export function Board({ projectId }: { projectId: string }) {
  const { data: me } = useQuery(sessionQueryOptions)
useProjectLive(projectId, me?.id)
  const { t } = useTranslation('board')
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const close = () => setDialog({ type: 'none' })

  const project = useProject(projectId)
  const lists = useLists(projectId)
  const tasks = useTasks(projectId)
  const createList = useCreateList(projectId)
  const createTask = useCreateTask(projectId)
  const move = useMoveTask(projectId)

  // The open task is part of the URL: refresh keeps it, Back closes it, the link can be shared.
  const taskId = searchParams.get('task')
  const openTask = taskId ? tasks.data?.find((task) => task.id === taskId && !task.archived) : undefined

  const closeTask = useCallback(() => {
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.delete('task'); return next }, { replace: true })
  }, [setSearchParams])
  const openTaskById = (id: string) =>
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('task', id); return next })

  // a stale or foreign ?task= (deleted, archived, other project) is removed instead of showing nothing
  useEffect(() => {
    if (taskId && tasks.isSuccess && !openTask) closeTask()
  }, [taskId, tasks.isSuccess, openTask, closeTask])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const back = (
    <Button asChild variant="ghost" size="sm" className="self-start">
      <Link to={paths.app.projects}><ArrowLeft className="size-4" />{t('backToProjects')}</Link>
    </Button>
  )

  if (project.isError) {
    return (
      <div className="space-y-4">
        {back}
        <p className="text-sm text-muted-foreground">{t('notFound')}</p>
      </div>
    )
  }

  if (project.isPending || lists.isPending || tasks.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-48 h-8" />
        <div className="flex gap-4"><Skeleton className="w-72 h-64" /><Skeleton className="w-72 h-64" /><Skeleton className="w-72 h-64" /></div>
      </div>
    )
  }

  if ((lists.isError && !lists.data) || (tasks.isError && !tasks.data)) {
    return <p className="text-sm text-destructive">{t('loadFailed')}</p>
  }

  const canEdit = project.data.role !== 'viewer'
  const columns = groupTasksByList(lists.data ?? [], tasks.data ?? [])
  const activeTask = activeId ? (tasks.data ?? []).find((task) => task.id === activeId) : undefined

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    if (!canEdit || !e.over) return
    const drop = computeDrop(columns, String(e.active.id), String(e.over.id))
    if (!drop) return
    move.mutate(drop, { onError: () => toast.error(t('move.failed')) })
  }

  return (
    <div className="space-y-4">
      {back}
      <PageHeader
        title={project.data.name}
        actions={canEdit && (
          <Button variant="outline" onClick={() => setDialog({ type: 'list' })} icon={<Plus />}>
            {t('addList')}
          </Button>
        )}
      />

      {columns.length === 0 && <p className="text-sm text-muted-foreground">{t('noLists')}</p>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex items-start gap-4 pb-2 overflow-x-auto">
          {columns.map((column) => (
            <ListColumn key={column.list.id} column={column} canEdit={canEdit}
              onAddTask={(listId) => setDialog({ type: 'task', listId })}
              onOpenTask={openTaskById} />
          ))}
        </div>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} className="shadow-lg" /> : null}</DragOverlay>
      </DndContext>

{openTask && <TaskPanel projectId={projectId} task={openTask} role={project.data.role} onClose={closeTask} />}
      <ListDialog
        open={dialog.type === 'list'}
        onOpenChange={(o) => { if (!o) { close(); createList.reset() } }}
        isPending={createList.isPending}
        error={createList.error}
        onSubmit={(name) => createList.mutate(name, { onSuccess: () => { toast.success(t('list.created')); close() } })}
      />

      <TaskDialog
        open={dialog.type === 'task'}
        onOpenChange={(o) => { if (!o) { close(); createTask.reset() } }}
        isPending={createTask.isPending}
        error={createTask.error}
        onSubmit={(input) => {
          if (dialog.type !== 'task') return
          createTask.mutate({ ...input, listId: dialog.listId }, {
            onSuccess: () => { toast.success(t('task.created')); close() },
          })
        }}
      />
    </div>
  )
}