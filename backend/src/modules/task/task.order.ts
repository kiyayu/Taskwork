//src/modules/task/task.order.ts
const STEP = 1024

export const computeOrder = (above?: number | null, below?: number | null): number => {
  const hasAbove = above !== undefined && above !== null
  const hasBelow = below !== undefined && below !== null

  if (hasAbove && hasBelow) return (above + below) / 2 // between two tasks
  if (hasAbove) return above + STEP // dropped at the bottom
  if (hasBelow) return below - STEP // dropped at the top
  return STEP // empty column
}