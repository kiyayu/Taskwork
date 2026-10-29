//src/modules/task/task.order.ts
const STEP = 1024

// above / below are the `order` of the neighbors in the target column (if they exist).
export const computeOrder = (above?: number | null, below?: number | null): number => {
  if (above != null && below != null) return (above + below) / 2 // between two tasks
  if (above != null) return above + STEP // dropped at the bottom
  if (below != null) return below - STEP // dropped at the top
  return STEP // empty column
}