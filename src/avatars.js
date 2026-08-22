import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PLAYER_IDS = ['hero', 'altman', 'dario', 'musk', 'liang', 'jensen']
export const AGENT_IDS = ['altman', 'dario', 'musk', 'liang', 'jensen']
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const BUNDLED_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

export function isPlayerId(id) {
  return PLAYER_IDS.indexOf(id) !== -1
}

export function avatarDataDir() {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  return join(home, 'dsh-holdem', 'avatars')
}

export function bundledAvatarDir() {
  const here = dirname(fileURLToPath(import.meta.url))
  const fromSrc = join(here, '..', 'assets', 'avatars')
  if (existsSync(fromSrc)) return fromSrc
  return join(here, 'avatars')
}

function sniffMime(bytes) {
  if (!bytes || bytes.length < 12) return ''
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'image/webp'
  return ''
}

export function decodeAvatar(args) {
  args = args || {}
  let bytes = args.bytes
  if (typeof args.image === 'string') {
    const raw = args.image.replace(/\s/g, '')
    const m = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i.exec(raw)
    if (m) bytes = Buffer.from(m[2], 'base64')
    else bytes = Buffer.from(raw, 'base64')
  }
  if (typeof bytes === 'string') bytes = Buffer.from(bytes, 'base64')
  if (!Buffer.isBuffer(bytes) || bytes.length === 0 || bytes.length > MAX_AVATAR_BYTES) return null
  const mime = sniffMime(bytes)
  if (!mime) return null
  return { bytes: bytes, mime: mime }
}

export function readOverride(dir, id) {
  if (!isPlayerId(id)) return null
  const file = join(dir, id)
  if (!existsSync(file)) return null
  const bytes = readFileSync(file)
  const mime = sniffMime(bytes)
  if (!mime) return null
  let rev = 0
  try { rev = Math.floor(statSync(file).mtimeMs) } catch (e) { rev = Date.now() }
  return { bytes: bytes, mime: mime, rev: rev }
}

export function loadOverrides(dir) {
  const out = {}
  if (!dir || !existsSync(dir)) return out
  for (let i = 0; i < PLAYER_IDS.length; i++) {
    const rec = readOverride(dir, PLAYER_IDS[i])
    if (rec) out[PLAYER_IDS[i]] = rec
  }
  return out
}

export function writeOverride(dir, id, rec) {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, id), rec.bytes)
  const st = statSync(join(dir, id))
  return { bytes: rec.bytes, mime: rec.mime, rev: Math.floor(st.mtimeMs) }
}

export function removeOverride(dir, id) {
  if (!isPlayerId(id)) return
  const file = join(dir, id)
  if (existsSync(file)) unlinkSync(file)
}

export function readBundled(dir, id) {
  if (id === 'hero' || !isPlayerId(id) || !dir || !existsSync(dir)) return null
  for (let i = 0; i < BUNDLED_EXTS.length; i++) {
    const file = join(dir, id + BUNDLED_EXTS[i])
    if (!existsSync(file)) continue
    const bytes = readFileSync(file)
    const mime = sniffMime(bytes)
    if (!mime) continue
    let rev = 0
    try { rev = Math.floor(statSync(file).mtimeMs) } catch (e) { rev = Date.now() }
    return { bytes: bytes, mime: mime, rev: rev }
  }
  return null
}

export function loadBundled(dir) {
  const out = {}
  const root = dir || bundledAvatarDir()
  if (!root || !existsSync(root)) return out
  for (let i = 0; i < AGENT_IDS.length; i++) {
    const rec = readBundled(root, AGENT_IDS[i])
    if (rec) out[AGENT_IDS[i]] = rec
  }
  return out
}

export function avatarView(id, overrides, bundled) {
  const rec = overrides && overrides[id]
  if (rec) {
    return {
      kind: 'override',
      seed: id,
      src: '/dsh-holdem/avatar/' + id + '?v=' + rec.rev,
    }
  }
  const pack = bundled && bundled[id]
  if (pack) {
    return {
      kind: 'default',
      seed: id,
      src: '/dsh-holdem/avatar/' + id + '?v=' + pack.rev,
    }
  }
  return { kind: 'identicon', seed: id, src: '' }
}
