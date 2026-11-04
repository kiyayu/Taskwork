//src/modules/admin/admin.series.ts
// Fills days with no sign-ups with 0, oldest first. Pure, so it is tested without a database.
export const fillDays = (rows: { _id: string; n: number }[], days: number, now = new Date()) => {
  const byDay = new Map(rows.map((r) => [r._id, r.n]))
  const out: { date: string; count: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
    const date = d.toISOString().slice(0, 10)
    out.push({ date, count: byDay.get(date) ?? 0 })
  }
  return out
}