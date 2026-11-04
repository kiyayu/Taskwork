//src/features/board/task/TaskPanel.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Archive, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { sessionQueryOptions } from '@/features/auth'
import type { ProjectRole } from '@/features/projects'
import { Attachments } from '../attachments/components/Attachments'
import { Checklist } from '../checklist/components/Checklist'
import { Comments } from '../comments/components/Comments'
import { useArchiveTask, useDeleteTask } from '../hooks/useBoard'
import type { BoardTask } from '../types/board.types'
import { TaskDetailsForm } from './TaskDetailsForm'
import { TaskReadOnly } from './TaskReadOnly'

type Props = { projectId: string; task: BoardTask; role: ProjectRole; onClose: () => void }

const h3 = 'text-sm font-semibold text-foreground'

export function TaskPanel({ projectId, task, role, onClose }: Props) {
  const { t } = useTranslation('board')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { data: user } = useQuery(sessionQueryOptions)
  const archive = useArchiveTask(projectId)
  const remove = useDeleteTask(projectId)

  const canEdit = role !== 'viewer'
  const isOwner = role === 'owner'
  const currentUserId = user?.id ?? ''

  return (
    <>
      {/* a wide, centered dialog: about 95% of the screen on phones, up to 72rem on desktop */}
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[90vh] p-0 overflow-y-auto">
          <div className="px-6 pt-6">
            <DialogTitle className="text-lg font-semibold text-foreground break-words">{task.title}</DialogTitle>
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[3fr_2fr]">
            {/* left: what the task IS */}
            <div className="space-y-8 min-w-0">
              <section className="space-y-3" aria-labelledby="panel-details">
                <h3 id="panel-details" className={h3}>{t('panel.details')}</h3>
                {canEdit ? <TaskDetailsForm key={task.id} projectId={projectId} task={task} /> : <TaskReadOnly task={task} />}
              </section>

              <section className="space-y-3" aria-labelledby="panel-checklist">
                <h3 id="panel-checklist" className={h3}>{t('panel.checklist')}</h3>
                <Checklist projectId={projectId} taskId={task.id} canEdit={canEdit} />
              </section>

              {canEdit && (
                <section className="space-y-3" aria-labelledby="panel-actions">
                  <h3 id="panel-actions" className={h3}>{t('panel.actions')}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" icon={<Archive />} disabled={archive.isPending}
                      onClick={() =>
                        archive.mutate(task.id, {
                          onSuccess: () => { toast.success(t('panel.archived')); onClose() },
                          onError: (e) => toast.error(getErrorMessage(e)),
                        })
                      }>
                      {t('panel.archive')}
                    </Button>
                    <Button variant="destructive" icon={<Trash2 />} onClick={() => setConfirmDelete(true)}>
                      {t('panel.delete')}
                    </Button>
                  </div>
                </section>
              )}
            </div>

            {/* right: the conversation around it */}
            <div className="space-y-8 min-w-0">
              <section className="space-y-3" aria-labelledby="panel-attachments">
                <h3 id="panel-attachments" className={h3}>{t('attachments.title')}</h3>
                <Attachments projectId={projectId} taskId={task.id} canEdit={canEdit} isOwner={isOwner} currentUserId={currentUserId} />
              </section>

              <section className="space-y-3" aria-labelledby="panel-comments">
                <h3 id="panel-comments" className={h3}>{t('comments.title')}</h3>
                <Comments projectId={projectId} taskId={task.id} canEdit={canEdit} isOwner={isOwner} currentUserId={currentUserId} />
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(o) => { if (!o) { setConfirmDelete(false); remove.reset() } }}
        title={t('panel.deleteTitle')}
        description={t('panel.deleteDescription')}
        confirmLabel={t('panel.delete')}
        isPending={remove.isPending}
        error={remove.error ? getErrorMessage(remove.error) : undefined}
        onConfirm={() =>
          remove.mutate(task.id, {
            onSuccess: () => { toast.success(t('panel.deleted')); setConfirmDelete(false); onClose() },
          })
        }
      />
    </>
  )
}