import { test } from 'node:test'
import assert from 'node:assert/strict'
import { identiconModel } from '../src/identicon.js'

test('same player id yields the same identicon', () => {
  const a = identiconModel('altman')
  const b = identiconModel('altman')
  assert.deepEqual(a.fill, b.fill)
  assert.deepEqual(a.on, b.on)
  assert.deepEqual(a.density, b.density)
})

test('different player ids yield different identicons', () => {
  const a = identiconModel('altman')
  const b = identiconModel('hero')
  assert.notDeepEqual(a.on, b.on)
})

test('identicon is an 8×8 cell grid with an rgb fill', () => {
  const m = identiconModel('liang')
  assert.equal(m.on.length, 64)
  assert.equal(m.density.length, 64)
  assert.equal(m.fill.length, 3)
  for (const n of m.fill) {
    assert.equal(typeof n, 'number')
    assert.ok(n >= 0 && n <= 255)
  }
})
