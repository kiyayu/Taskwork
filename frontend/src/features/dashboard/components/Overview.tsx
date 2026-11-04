//src/features/dashboard/components/Overview.tsx
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/config/paths'
import { formatDate } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { sessionQueryOptions } from '@/features/auth'
import { useOverview } from '../hooks/useOverview'

const priorityDot = { 1: 'bg-destructive', 2: 'bg-warning', 3: 'bg-info' } as const

export function Overview() {
  const { t } = useTranslation(['dashboard', 'board'])
  const { data: user } = useQuery(sessionQueryOptions)
  const query = useOverview()

  if (query.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-64 h-8" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
        <Skeleton className="w-full h-48" />
      </div>
    )
  }
  if (query.isError && !query.data) return <p className="text-sm text-destructive">{t('dashboard:loadFailed')}</p>

  const o = query.data!
  const cards = [
    { label: t('dashboard:cards.projects'), value: o.projects, tone: '' },
    { label: t('dashboard:cards.assigned'), value: o.assigned, tone: '' },
    { label: t('dashboard:cards.dueSoon'), value: o.dueSoon, tone: '' },
    { label: t('dashboard:cards.overdue'), value: o.overdue, tone: o.overdue > 0 ? 'text-destructive' : '' },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">{t('dashboard:greeting', { name: user?.name ?? '' })}</h1>
        <p className="text-sm text-muted-foreground">{t('dashboard:description')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="p-4 space-y-1 bg-card border border-border rounded-xl shadow-sm">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className={cn('text-2xl font-semibold text-foreground', c.tone)}>{c.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3" aria-labelledby="my-tasks">
        <div className="flex items-center justify-between gap-2">
          <h2 id="my-tasks" className="text-base font-semibold text-foreground">{t('dashboard:tasks.title')}</h2>
          <Button asChild variant="outline" size="sm"><Link to={paths.app.projects}>{t('dashboard:goProjects')}</Link></Button>
        </div>

        {o.tasks.length === 0 && <p className="text-sm text-muted-foreground">{t('dashboard:tasks.empty')}</p>}

        <ul className="space-y-2">
          {o.tasks.map((task) => (
            <li key={task.id}>
              {/* the task opens straight in its board: the dialog state lives in the URL */}
              <Link to={`${paths.app.projectBoard(task.projectId)}?task=${task.id}`}
                className="flex flex-wrap items-center justify-between gap-2 p-3 bg-card border border-border rounded-lg transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{t('dashboard:tasks.inProject', { name: task.projectName })}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className={cn('size-2 rounded-full', priorityDot[task.priority])} aria-hidden />
                    {t(`board:priority.${task.priority}`)}
                  </span>
                  <span>{task.dueDate ? t('dashboard:tasks.due', { date: formatDate(task.dueDate) }) : t('dashboard:tasks.noDue')}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}