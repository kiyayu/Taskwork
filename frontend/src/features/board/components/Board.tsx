//src/features/board/components/Board.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { paths } from '@/config/paths'
import { useTranslation } from '@/lib/i18n'
import { useProject } from '@/features/projects'
import { useCreateList, useCreateTask, useLists, useTasks } from '../hooks/useBoard'
import { groupTasksByList } from '../utils/groupTasks'
import { ListColumn } from './ListColumn'
import { ListDialog } from './ListDialog'
import { TaskDialog } from './TaskDialog'

// One state value says which dialog is open; the task dialog remembers WHICH list it is for.
type DialogState = { type: 'none' } | { type: 'list' } | { type: 'task'; listId: string }

export function Board({ projectId }: { projectId: string }) {
  const { t } = useTranslation('board')
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const close = () => setDialog({ type: 'none' })

  const project = useProject(projectId)
  const lists = useLists(projectId)
  const tasks = useTasks(projectId)
  const createList = useCreateList(projectId)
  const createTask = useCreateTask(projectId)

  const back = (
    <Button asChild variant="ghost" size="sm" className="self-start">
      <Link to={paths.app.projects}><ArrowLeft className="size-4" />{t('backToProjects')}</Link>
    </Button>
  )

  // the backend answers 404 for strangers and missing projects alike
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

      <div className="flex items-start gap-4 pb-2 overflow-x-auto">
        {columns.map((column) => (
          <ListColumn key={column.list.id} column={column} canEdit={canEdit}
            onAddTask={(listId) => setDialog({ type: 'task', listId })} />
        ))}
      </div>

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