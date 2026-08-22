// Default-avatar identicon. Algorithm matches dither-kit's DitherAvatar
// (MIT, Boring-Software-Inc/dither-kit): FNV-1a + xorshift32 → 8×8 mirrored
// Bayer-dithered glyph. Vendored so we never call tripwire.sh or pull Tailwind.

const GRID = 8
const CELL_PX = 4
const BG = '#111111'

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map(function (row) {
  return row.map(function (v) { return (v + 0.5) / 16 })
})

function fnv1a(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function xorshift32(seed) {
  let s = seed || 0x9e3779b9
  return function () {
    s ^= s << 13
    s >>>= 0
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 0x100000000
  }
}

function hueFill(hue) {
  const h = ((hue % 360) + 360) % 360
  const s = 0.85
  const l = 0.58
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r
  let g
  let b
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}

export function identiconModel(seed) {
  const name = String(seed || '')
  const rand = xorshift32(fnv1a(name))
  const bits = []
  for (let i = 0; i < 32; i++) bits.push(rand() < 0.5)
  const vertical = rand() < 0.5
  const hue = Math.floor(rand() * 180) * 2
  const halfDensity = []
  for (let i = 0; i < 32; i++) halfDensity.push(0.55 + rand() * 0.45)

  const on = new Array(GRID * GRID)
  const density = new Array(GRID * GRID)
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const i = vertical
        ? Math.min(r, GRID - 1 - r) * GRID + c
        : r * (GRID / 2) + Math.min(c, GRID - 1 - c)
      on[r * GRID + c] = bits[i]
      density[r * GRID + c] = halfDensity[i]
    }
  }
  return { on: on, density: density, fill: hueFill(hue) }
}

function rgba(fill, alpha) {
  return 'rgba(' + fill[0] + ',' + fill[1] + ',' + fill[2] + ',' + alpha + ')'
}

export function paintIdenticon(canvas, seed) {
  if (!canvas || !canvas.getContext) return
  const model = identiconModel(seed)
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const px = GRID * CELL_PX
  canvas.width = px
  canvas.height = px
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, px, px)
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (!model.on[r * GRID + c]) continue
      const dens = model.density[r * GRID + c]
      const base = 0.35 + 0.65 * dens
      for (let py = 0; py < CELL_PX; py++) {
        for (let pxi = 0; pxi < CELL_PX; pxi++) {
          const gx = c * CELL_PX + pxi
          const gy = r * CELL_PX + py
          const lit = dens > BAYER4[gy & 3][gx & 3]
          const alpha = lit ? base : base * 0.35
          ctx.fillStyle = rgba(model.fill, alpha)
          ctx.fillRect(gx, gy, 1, 1)
        }
      }
    }
  }
}

export const IDENTICON_PX = GRID * CELL_PX
