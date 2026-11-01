//src/features/projects/components/ProjectList.tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import {
  useCreateProject, useDeleteProject, useProjects, useRenameProject,
} from '../hooks/useProjects'
import type { Project } from '../types/project.types'
import { ProjectCard } from './ProjectCard'
import { ProjectNameDialog } from './ProjectNameDialog'

// One state value says which dialog is open: impossible combinations cannot exist.
type DialogState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'rename'; project: Project }
  | { type: 'delete'; project: Project }

export function ProjectList() {
  const { t } = useTranslation('projects')
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const close = () => setDialog({ type: 'none' })

  const { data: projects, isPending, isError, refetch } = useProjects()
  const create = useCreateProject()
  const rename = useRenameProject()
  const remove = useDeleteProject()

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Button onClick={() => setDialog({ type: 'create' })} icon={<Plus />}>
            {t('create')}
          </Button>
        }
      />

      {isPending && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
      )}

      {isError && !projects && (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{t('loadFailed')}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t('actions.tryAgain', { ns: 'common' })}
          </Button>
        </div>
      )}

      {projects && projects.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      )}

      {projects && projects.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onRename={(project) => setDialog({ type: 'rename', project })}
              onDelete={(project) => setDialog({ type: 'delete', project })}
            />
          ))}
        </ul>
      )}

      <ProjectNameDialog
        open={dialog.type === 'create'}
        onOpenChange={(o) => { if (!o) { close(); create.reset() } }}
        title={t('form.createTitle')}
        submitLabel={t('form.createSubmit')}
        isPending={create.isPending}
        error={create.error}
        onSubmit={(name) =>
          create.mutate(name, { onSuccess: () => { toast.success(t('toast.created')); close() } })
        }
      />

      <ProjectNameDialog
        open={dialog.type === 'rename'}
        onOpenChange={(o) => { if (!o) { close(); rename.reset() } }}
        title={t('form.renameTitle')}
        submitLabel={t('form.renameSubmit')}
        initialName={dialog.type === 'rename' ? dialog.project.name : ''}
        isPending={rename.isPending}
        error={rename.error}
        onSubmit={(name) => {
          if (dialog.type !== 'rename') return
          rename.mutate(
            { id: dialog.project.id, name },
            { onSuccess: () => { toast.success(t('toast.renamed')); close() } }
          )
        }}
      />

      <ConfirmDialog
        open={dialog.type === 'delete'}
        onOpenChange={(o) => { if (!o) { close(); remove.reset() } }}
        title={t('delete.title')}
        description={t('delete.description')}
        confirmLabel={t('delete.confirm')}
        confirmText={t('delete.word')}
        isPending={remove.isPending}
        error={remove.error ? getErrorMessage(remove.error) : undefined}
        onConfirm={() => {
          if (dialog.type !== 'delete') return
          remove.mutate(dialog.project.id, {
            onSuccess: () => { toast.success(t('toast.deleted')); close() },
          })
        }}
      />
    </>
  )
}