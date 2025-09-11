export const formatPriceJPY = (amount?: number | null) => {
  const value = amount ?? 0
  return `¥${value.toLocaleString()}`
}

export const formatDurationMMSS = (seconds?: number | null) => {
  const s = seconds ?? 0
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

