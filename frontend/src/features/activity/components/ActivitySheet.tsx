//src/features/activity/components/ActivitySheet.tsx
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatDateTime } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import { useActivity } from '../hooks/useActivity'

type Props = { projectId: string; open: boolean; onOpenChange: (open: boolean) => void }

function Feed({ projectId }: { projectId: string }) {
  const { t } = useTranslation('activity')
  const query = useActivity(projectId)

  if (query.isPending) return <Skeleton className="w-full h-24" />
  if (query.isError && !query.data) return <p className="text-sm text-destructive">{t('loadFailed')}</p>

  const items = query.data?.pages.flatMap((p) => p.items) ?? []
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{t('empty')}</p>

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id} className="space-y-0.5">
            {/* the sentence is built from facts (type + meta) and rendered as plain text */}
            <p className="text-sm text-foreground break-words">
              {t(`type.${a.type}`, {
                actor: a.actorName,
                task: a.meta.taskTitle ?? t('unknownTask'),
                list: a.meta.listName ?? '',
                target: a.meta.targetName ?? '',
              })}
            </p>
            <p className="text-xs text-muted-foreground">{formatDateTime(a.createdAt)}</p>
          </li>
        ))}
      </ul>
      {query.hasNextPage && (
        <Button variant="outline" size="sm" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
          {t('loadMore')}
        </Button>
      )}
    </div>
  )
}

export function ActivitySheet({ projectId, open, onOpenChange }: Props) {
  const { t } = useTranslation('activity')
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6 space-y-3">
          <p className="text-sm text-muted-foreground">{t('description')}</p>
          {/* mounted only while open, so it fetches fresh data every time */}
          {open && <Feed projectId={projectId} />}
        </div>
      </SheetContent>
    </Sheet>
  )
}