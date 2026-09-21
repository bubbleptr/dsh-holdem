// Raise-to sizing for the action bar. Pure: no DOM, no table state.

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

const DEFAULT_PCTS = [25, 33, 75, 133]

// Pot-relative raise-to (currentBet + pot * pct). If that already shoves,
// fall back to the same fraction of remaining chips so a 25% chip is never
// a silent all-in.
export function raiseSizeForPct(pct, opts) {
  const pot = Number(opts.pot) || 0
  const currentBet = Number(opts.currentBet) || 0
  const minR = Number(opts.minR) || 0
  const maxR = Number(opts.maxR) || 0
  if (maxR <= 0) return 0
  let raw = Math.floor(currentBet + pot * (pct / 100))
  if (raw >= maxR) raw = Math.floor(maxR * (pct / 100))
  return clamp(raw, minR, maxR)
}

export function raisePresets(opts) {
  const pcts = opts.pcts || DEFAULT_PCTS
  const maxR = Number(opts.maxR) || 0
  const seen = Object.create(null)
  const out = []
  for (let i = 0; i < pcts.length; i++) {
    const pct = pcts[i]
    const v = raiseSizeForPct(pct, opts)
    if (v <= 0 || v >= maxR) continue
    if (seen[v]) continue
    seen[v] = true
    out.push({ label: pct + '%', v: v })
  }
  return out
}

// The AI has the same failure mode as the 25% chip above: opts.maxR is the
// bot's whole stack, so a model that simply picks a number from the legal
// range lands on an all-in. A raise that was not asked for as an all-in is
// therefore capped at a few times the pot; going all-in stays available as an
// explicit choice.
export function raiseCeiling(opts) {
  const pot = Number(opts.pot) || 0
  const currentBet = Number(opts.currentBet) || 0
  const bb = Number(opts.bb) || 0
  const minR = Number(opts.minR) || 0
  const maxR = Number(opts.maxR) || 0
  if (maxR <= 0) return 0
  const cap = currentBet + Math.max(3 * Math.max(pot, bb), 4 * bb)
  return Math.max(minR, Math.min(maxR, Math.floor(cap)))
}

export function clampRaise(amount, opts) {
  const minR = Number(opts.minR) || 0
  const maxR = Number(opts.maxR) || 0
  if (maxR <= 0) return 0
  const v = typeof amount === 'number' && isFinite(amount) ? Math.floor(amount) : 0
  if (!(v > 0)) return Math.max(0, Math.min(minR, maxR))
  return clamp(v, minR, raiseCeiling(opts))
}
