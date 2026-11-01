//src/features/board/utils/order.ts
// Mirrors the backend's computeOrder so the optimistic position matches what the server will compute.
const STEP = 1024

export const computeOrder = (above?: number | null, below?: number | null): number => {
  if (above != null && below != null) return (above + below) / 2
  if (above != null) return above + STEP
  if (below != null) return below - STEP
  return STEP
}