//src/features/board/checklist/components/Checklist.tsx
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/errors'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useAddItem, useChecklist, useRemoveItem, useToggleItem } from '../hooks/useChecklist'
import { buildChecklistTree } from '../utils/tree'
import type { ChecklistItem } from '../types'
import { AddItemForm } from './AddItemForm'

type Props = { projectId: string; taskId: string; canEdit: boolean }

export function Checklist({ projectId, taskId, canEdit }: Props) {
  const { t } = useTranslation('board')
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null)

  const query = useChecklist(projectId, taskId)
  const add = useAddItem(projectId, taskId)
  const toggle = useToggleItem(projectId, taskId)
  const remove = useRemoveItem(projectId, taskId)
  const busy = add.isPending || toggle.isPending || remove.isPending

  if (query.isPending) return <Skeleton className="w-full h-24" />
  if (query.isError && !query.data) {
    return <p className="text-sm text-destructive">{t('checklist.loadFailed')}</p>
  }

  const { items, progress } = query.data!
  const tree = buildChecklistTree(items)
  const fail = (e: unknown) => toast.error(getErrorMessage(e)) // e.g. "Complete all sub-items first"

  const row = (item: ChecklistItem, child: boolean) => (
    <div className={cn('flex items-center gap-2', child && 'ml-7')}>
      <Checkbox
        checked={item.completed}
        disabled={!canEdit || busy}
        aria-label={item.title}
        onCheckedChange={(checked) =>
          toggle.mutate({ itemId: item.id, completed: checked === true }, { onError: fail })
        }
      />
      <span className={cn('flex-1 text-sm break-words', item.completed ? 'text-muted-foreground line-through' : 'text-foreground')}>
        {item.title}
      </span>
      {canEdit && (
        <Button variant="ghost" size="icon" className="size-8" disabled={busy}
          aria-label={t('checklist.delete')} icon={<Trash2 />}
          onClick={() => remove.mutate(item.id, { onError: fail })} />
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {progress.total > 0 && (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar"
            aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}
            aria-label={t('progress', { done: progress.done, total: progress.total })}>
            <div className="h-full transition-all bg-primary" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{t('progress', { done: progress.done, total: progress.total })}</p>
        </div>
      )}

      {tree.length === 0 && <p className="text-sm text-muted-foreground">{t('checklist.empty')}</p>}

      <ul className="space-y-3">
        {tree.map(({ item, children }) => (
          <li key={item.id} className="space-y-2">
            {row(item, false)}
            {children.map((c) => <div key={c.id}>{row(c, true)}</div>)}

            {canEdit && addingSubFor === item.id && (
              <div className="ml-7">
                <AddItemForm
                  autoFocus
                  placeholder={t('checklist.subPlaceholder')}
                  submitLabel={t('checklist.add')}
                  isPending={add.isPending}
                  onCancel={() => setAddingSubFor(null)}
                  onSubmit={(title, done) =>
                    add.mutate({ title, parentId: item.id }, { onSuccess: done, onError: fail })
                  }
                />
              </div>
            )}
            {canEdit && addingSubFor !== item.id && (
              <Button variant="ghost" size="sm" className="ml-7" onClick={() => setAddingSubFor(item.id)}>
                {t('checklist.addSub')}
              </Button>
            )}
          </li>
        ))}
      </ul>

      {canEdit && (
        <AddItemForm
          placeholder={t('checklist.addPlaceholder')}
          submitLabel={t('checklist.add')}
          isPending={add.isPending}
          onSubmit={(title, done) => add.mutate({ title, parentId: null }, { onSuccess: done, onError: fail })}
        />
      )}
    </div>
  )
}