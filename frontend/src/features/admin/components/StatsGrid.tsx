//src/features/admin/components/StatsGrid.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'
import { useAdminStats } from '../hooks/useAdmin'

export function StatsGrid() {
  const { t } = useTranslation('admin')
  const query = useAdminStats()

  if (query.isPending) return <Skeleton className="w-full h-48" />
  if (query.isError && !query.data) return <p className="text-sm text-destructive">{t('loadFailed')}</p>

  const s = query.data!
  const cards = [
    [t('stats.users'), s.users.total], [t('stats.verified'), s.users.verified], [t('stats.active'), s.users.active],
    [t('stats.newWeek'), s.users.newThisWeek], [t('stats.projects'), s.projects], [t('stats.tasks'), s.tasks.active],
    [t('stats.archived'), s.tasks.archived], [t('stats.comments'), s.comments], [t('stats.files'), s.attachments],
  ] as const

  const max = Math.max(1, ...s.signups.map((d) => d.count))
  const total = s.signups.reduce((n, d) => n + d.count, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map(([label, value]) => (
          <div key={label} className="p-4 space-y-1 bg-card border border-border rounded-xl shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="p-4 space-y-3 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">{t('stats.plans')}</h2>
          <ul className="space-y-1 text-sm">
            {(['free', 'pro'] as const).map((p) => (
              <li key={p} className="flex justify-between">
                <span className="text-muted-foreground">{t(`users.${p}`)}</span>
                <span className="font-medium text-foreground">{s.users.byPlan[p]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 space-y-3 bg-card border border-border rounded-xl shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">{t('stats.signups')}</h2>
          {/* bars are decorative; the numbers are in each bar's title and the total in the label */}
          <div role="img" aria-label={`${t('stats.signups')}: ${total}`} className="flex items-end h-24 gap-1">
            {s.signups.map((d) => (
              <div key={d.date} title={`${d.date}: ${d.count}`} className="flex-1 rounded-t bg-primary/70"
                style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}