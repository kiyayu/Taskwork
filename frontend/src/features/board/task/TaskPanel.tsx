//src/features/board/task/TaskPanel.tsx
import { useState } from 'react'
import { Archive, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/layout/ConfirmDialog'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { Checklist } from '../checklist/components/Checklist'
import { useArchiveTask, useDeleteTask } from '../hooks/useBoard'
import type { BoardTask } from '../types/board.types'
import { TaskDetailsForm } from './TaskDetailsForm'
import { TaskReadOnly } from './TaskReadOnly'

type Props = { projectId: string; task: BoardTask; canEdit: boolean; onClose: () => void }

export function TaskPanel({ projectId, task, canEdit, onClose }: Props) {
  const { t } = useTranslation('board')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const archive = useArchiveTask(projectId)
  const remove = useDeleteTask(projectId)

  return (
    <>
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{t('panel.title')}</SheetTitle>
          </SheetHeader>

          <div className="px-4 pb-6 space-y-8">
            <section className="space-y-3" aria-labelledby="panel-details">
              <h3 id="panel-details" className="text-sm font-semibold text-foreground">{t('panel.details')}</h3>
              {canEdit ? <TaskDetailsForm key={task.id} projectId={projectId} task={task} /> : <TaskReadOnly task={task} />}
            </section>

            <section className="space-y-3" aria-labelledby="panel-checklist">
              <h3 id="panel-checklist" className="text-sm font-semibold text-foreground">{t('panel.checklist')}</h3>
              <Checklist projectId={projectId} taskId={task.id} canEdit={canEdit} />
            </section>

            {canEdit && (
              <section className="space-y-3" aria-labelledby="panel-actions">
                <h3 id="panel-actions" className="text-sm font-semibold text-foreground">{t('panel.actions')}</h3>
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
        </SheetContent>
      </Sheet>

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