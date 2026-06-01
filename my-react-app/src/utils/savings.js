// Recommended savings as a % of income, scaled by income bracket.
// Higher earners can comfortably save a larger share of their income.
export const SAVINGS_BRACKETS = [
  { label: '< ₹15,000', max: 15000, minPct: 0, maxPct: 5 },
  { label: '₹15,000 – ₹30,000', max: 30000, minPct: 5, maxPct: 10 },
  { label: '₹30,000 – ₹50,000', max: 50000, minPct: 10, maxPct: 15 },
  { label: '₹50,000 – ₹1,00,000', max: 100000, minPct: 15, maxPct: 20 },
  { label: '> ₹1,00,000', max: Infinity, minPct: 20, maxPct: 30 },
]

export function getBracket(income) {
  return SAVINGS_BRACKETS.find((b) => income < b.max) || SAVINGS_BRACKETS.at(-1)
}

// Returns the recommended savings range + how the user is tracking against it.
export function getSavingsRecommendation(income, actualSavings) {
  const bracket = getBracket(income)
  const recMin = Math.round((income * bracket.minPct) / 100)
  const recMax = Math.round((income * bracket.maxPct) / 100)

  let status = 'below' // below | ontrack | ahead | overspending
  if (actualSavings < 0) {
    status = 'overspending'
  } else if (actualSavings >= recMax && recMax > 0) {
    status = 'ahead'
  } else if (actualSavings >= recMin) {
    status = 'ontrack'
  }

  // Progress toward the upper end of the recommended range (0–100).
  const progress = recMax > 0 ? Math.min(100, Math.max(0, (actualSavings / recMax) * 100)) : 0

  return {
    bracket,
    recMin,
    recMax,
    minPct: bracket.minPct,
    maxPct: bracket.maxPct,
    status,
    progress,
  }
}

export const STATUS_META = {
  overspending: { label: 'Overspending', icon: '❌', className: 'status-bad' },
  below: { label: 'Below target', icon: '⚠️', className: 'status-warn' },
  ontrack: { label: 'On track', icon: '✅', className: 'status-good' },
  ahead: { label: 'Ahead of target', icon: '🚀', className: 'status-good' },
}
