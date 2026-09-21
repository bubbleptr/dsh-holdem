#!/usr/bin/env node
// WCAG contrast audit for the hk-* palette.
//
// The palette lives as CSS custom properties in src/client-css.cjs, so this
// script reads that file, extracts the light and dark values, and checks a
// declarative table of foreground/background pairs at the sizes the CSS
// actually uses. Re-run it after any palette or typography change:
//
//   pnpm check:contrast
//
// Exits non-zero when a theme drops below WCAG AA.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(join(root, 'src/client-css.cjs'), 'utf8')

/** Parse `--hk-name:value` pairs out of a CSS block into short-name keys. */
function palette(block) {
  const out = {}
  for (const m of block.matchAll(/--(hk-[\w-]+):([^;}]+)/g)) out[m[1].replace(/^hk-/, '')] = m[2].trim()
  return out
}

const css = source.slice(source.indexOf('`') + 1, source.lastIndexOf('`'))

/** Declarations of the first rule whose selector matches `re`. */
function block(re) {
  const match = re.exec(css)
  if (!match) throw new Error(`cannot find palette block matching ${re}`)
  return match[1]
}

// The palette selectors also carry `.hk-mini`, because the floating window sits
// outside `.hk-root` and reads the same custom properties.
const LIGHT = palette(block(/\.hk-root[^{]*\{([^}]*)\}/))
const DARK = { ...LIGHT, ...palette(block(/body\[data-ds-dark-theme\][^{]*\{([^}]*)\}/)) }

const parseColor = (value) => {
  const text = String(value).trim()
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(text)
  if (short) {
    const [r, g, b] = [short[1], short[2], short[3]].map((d) => parseInt(d + d, 16))
    return { r, g, b, a: 1 }
  }
  const full = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(text)
  if (full) {
    return { r: parseInt(full[1], 16), g: parseInt(full[2], 16), b: parseInt(full[3], 16), a: 1 }
  }
  const nums = text.match(/[0-9]*\.?[0-9]+/g)
  if (!nums || nums.length < 3) throw new Error(`cannot parse color: ${value}`)
  return { r: +nums[0], g: +nums[1], b: +nums[2], a: nums.length > 3 ? +nums[3] : 1 }
}
const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
})
const channel = (v) => {
  v /= 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}
const luminance = (c) => 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b)
const contrast = (a, b) => {
  const l1 = luminance(a)
  const l2 = luminance(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}
const hex = (c) =>
  '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

// [label, foreground var, background var, background behind an alpha bg, px, weight]
const PAIRS = [
  ['tab title', 'text', 'bg', null, 13, 650],
  ['meta line', 'text-dim', 'bg', null, 12, 400],
  ['rail tab (active)', 'text', 'subtle', null, 12, 650],
  ['rail hint', 'text-dim', 'subtle', null, 11, 400],
  ['timeline hand header', 'text-faint', 'subtle', null, 10, 400],
  ['timeline name', 'text', 'subtle', null, 12, 650],
  ['timeline action', 'text-3', 'subtle', null, 11, 400],
  ['timeline talk bubble', 'text', 'surface', null, 12, 400],
  ['seat name', 'text', 'surface', null, 12, 650],
  ['seat stack', 'text-dim', 'surface', null, 11, 400],
  ['dealer chip', 'primary-fg', 'primary-bg', null, 9, 750],
  ['board card rank', 'card-text', 'card-bg', null, 16, 750],
  ['board card red suit', 'card-red', 'card-bg', null, 20, 750],
  ['hero card red suit', 'card-red', 'card-bg', null, 13, 750],
  ['pot label', 'text-3', 'surface', null, 12, 600],
  ['raise preset', 'text-2', 'muted', null, 12, 650],
  ['raise preset (active)', 'text', 'surface', null, 12, 650],
  ['raise amount', 'text-3', 'muted', null, 12, 650],
  ['action button', 'text', 'surface', null, 15, 700],
  ['primary button', 'primary-fg', 'primary-bg', null, 15, 700],
  ['turn badge', 'accent-fg', 'accent-bg', 'subtle', 11, 600],
  ['bet badge', 'bet-fg', 'bet-bg', 'subtle', 10, 650],
  ['winner banner', 'win-fg', 'win-bg', 'subtle', 13, 700],
  ['winner banner sub', 'win-sub', 'win-bg', 'subtle', 11, 600],
]

// 24px+, or 18.66px+ when bold, only needs 3:1 under WCAG AA
const threshold = (px, weight) => (px >= 24 || (weight >= 700 && px >= 18.66) ? 3.0 : 4.5)

// Low-contrast pairs inherited from the upstream light palette. Reported as
// KNOWN instead of FAIL so the check stays useful for the dark theme (whose
// palette this fork introduced) without pretending the light issues are gone.
const KNOWN_LIGHT = new Set([
  'meta line',
  'rail hint',
  'timeline hand header',
  'seat stack',
  'turn badge',
])

function audit(theme, vars) {
  const rows = []
  for (const [label, fgVar, bgVar, behindVar, px, weight] of PAIRS) {
    const bg = parseColor(vars[bgVar])
    const solidBg = bg.a < 1 && behindVar ? over(bg, parseColor(vars[behindVar])) : bg
    const fgRaw = parseColor(vars[fgVar])
    const fg = fgRaw.a < 1 ? over(fgRaw, solidBg) : fgRaw
    const ratio = contrast(fg, solidBg)
    const need = threshold(px, weight)
    rows.push({ label, ratio, need, ok: ratio >= need, fg: hex(fg), bg: hex(solidBg), px, weight })
  }
  return rows
}

let failed = 0
let known = 0
for (const [theme, vars] of [
  ['light', LIGHT],
  ['dark', DARK],
]) {
  const rows = audit(theme, vars)
  console.log(`\n===== ${theme.toUpperCase()} =====`)
  console.log('pair'.padEnd(24) + 'ratio'.padStart(7) + '  need  verdict')
  for (const r of rows) {
    const isKnown = theme === 'light' && KNOWN_LIGHT.has(r.label) && !r.ok
    if (isKnown) known++
    else if (!r.ok) failed++
    const verdict = r.ok ? 'PASS' : isKnown ? 'KNOWN' : 'FAIL'
    console.log(
      r.label.padEnd(24) +
        r.ratio.toFixed(2).padStart(7) +
        r.need.toFixed(1).padStart(6) +
        '  ' + verdict.padEnd(6) +
        ` ${r.fg} on ${r.bg} (${r.px}px/${r.weight})`,
    )
  }
}

console.log(`\n${failed} new failure(s); ${known} known upstream light-mode issue(s)`)
if (known > 0) {
  console.log('Known issues are pre-existing in the upstream light palette; see README notes.')
}
process.exit(failed === 0 ? 0 : 1)
