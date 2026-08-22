import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createTable } from '../src/host.js'

function stubCtx() {
  return {
    effect(fn) { fn() },
    timeout() { return function () {} },
    get() { return undefined },
  }
}

// 1×1 transparent PNG
const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

function withHome(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'holdem-avatars-'))
  const prev = process.env.DSH_HOME
  process.env.DSH_HOME = dir
  try {
    return fn(dir)
  } finally {
    if (prev === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = prev
    rmSync(dir, { recursive: true, force: true })
  }
}

const AGENTS = ['altman', 'dario', 'musk', 'liang', 'jensen']

test('you defaults to an identicon; agents default to shipped portraits', () => {
  withHome(function () {
    const table = createTable(stubCtx())
    const snap = table.snapshot()
    assert.equal(snap.players.length, 6)
    const hero = snap.players.find(function (p) { return p.id === 'hero' })
    assert.equal(hero.avatar.kind, 'identicon')
    assert.equal(hero.avatar.seed, 'hero')
    assert.equal(hero.avatar.src, '')
    for (const id of AGENTS) {
      const p = snap.players.find(function (row) { return row.id === id })
      assert.equal(p.avatar.kind, 'default')
      assert.equal(p.avatar.seed, id)
      assert.match(p.avatar.src, new RegExp('/dsh-holdem/avatar/' + id))
      const file = table.avatarFile(id)
      assert.ok(file && file.bytes && file.bytes.length > 0)
      assert.ok(['image/jpeg', 'image/png', 'image/webp'].includes(file.mime))
    }
  })
})

test('setting an override avatar is visible on that player', () => {
  withHome(function () {
    const table = createTable(stubCtx())
    const snap = table.setAvatar({ id: 'hero', bytes: PNG_1x1, mime: 'image/png' })
    const hero = snap.players.find(function (p) { return p.id === 'hero' })
    assert.equal(hero.avatar.kind, 'override')
    assert.match(hero.avatar.src, /\/dsh-holdem\/avatar\/hero/)
    const altman = snap.players.find(function (p) { return p.id === 'altman' })
    assert.equal(altman.avatar.kind, 'default')
  })
})

test('table reset does not clear override avatars', () => {
  withHome(function () {
    const table = createTable(stubCtx())
    table.setAvatar({ id: 'musk', bytes: PNG_1x1, mime: 'image/png' })
    table.start()
    const snap = table.reset()
    const musk = snap.players.find(function (p) { return p.id === 'musk' })
    assert.equal(musk.avatar.kind, 'override')
    assert.equal(snap.status, 'idle')
  })
})

test('override avatars reload from the data directory', () => {
  withHome(function () {
    createTable(stubCtx()).setAvatar({ id: 'liang', bytes: PNG_1x1, mime: 'image/png' })
    const snap = createTable(stubCtx()).snapshot()
    const liang = snap.players.find(function (p) { return p.id === 'liang' })
    assert.equal(liang.avatar.kind, 'override')
  })
})

test('clearing an agent override restores the shipped portrait', () => {
  withHome(function () {
    const table = createTable(stubCtx())
    table.setAvatar({ id: 'jensen', bytes: PNG_1x1, mime: 'image/png' })
    const snap = table.clearAvatar({ id: 'jensen' })
    const jensen = snap.players.find(function (p) { return p.id === 'jensen' })
    assert.equal(jensen.avatar.kind, 'default')
    assert.match(jensen.avatar.src, /\/dsh-holdem\/avatar\/jensen/)
  })
})

test('clearing the hero override restores the identicon', () => {
  withHome(function () {
    const table = createTable(stubCtx())
    table.setAvatar({ id: 'hero', bytes: PNG_1x1, mime: 'image/png' })
    const snap = table.clearAvatar({ id: 'hero' })
    const hero = snap.players.find(function (p) { return p.id === 'hero' })
    assert.equal(hero.avatar.kind, 'identicon')
    assert.equal(hero.avatar.src, '')
  })
})

test('unknown player id is rejected', () => {
  withHome(function () {
    const table = createTable(stubCtx())
    assert.throws(function () {
      table.setAvatar({ id: '../etc', bytes: PNG_1x1, mime: 'image/png' })
    }, /unknown player/)
  })
})
