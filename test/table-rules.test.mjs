import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_REBUYS, blindSeats, rebuyDecision } from '../src/table-rules.js'

const OPTS = { max: MAX_REBUYS, start: 2000000 }

test('a player with chips keeps them and never rebuys', () => {
  assert.deepEqual(rebuyDecision({ stack: 1, rebuys: 0, out: false }, OPTS), { action: 'keep' })
  assert.deepEqual(rebuyDecision({ stack: 2000000, rebuys: 2, out: false }, OPTS), { action: 'keep' })
})

test('a busted player rebuys until the bullets are gone, then is out', () => {
  let p = { stack: 0, rebuys: 0, out: false }
  for (let i = 1; i <= MAX_REBUYS; i++) {
    const d = rebuyDecision(p, OPTS)
    assert.deepEqual(d, { action: 'rebuy', rebuys: i, stack: 2000000 })
    p = { stack: d.stack, rebuys: d.rebuys, out: false }
    p.stack = 0
  }
  assert.deepEqual(rebuyDecision(p, OPTS), { action: 'out' })
})

test('a player who is already out stays out', () => {
  assert.deepEqual(rebuyDecision({ stack: 2000000, rebuys: 1, out: true }, OPTS), { action: 'out' })
  assert.deepEqual(rebuyDecision({ stack: 0, rebuys: 3, out: true }, OPTS), { action: 'out' })
  assert.deepEqual(rebuyDecision(null, OPTS), { action: 'out' })
})

test('six players: the blinds sit next to the button', () => {
  // Seats 0..5, play moves to decreasing index, so the button's neighbours are
  // dealer-1 (SB) and dealer-2 (BB).
  assert.deepEqual(blindSeats(6, [0, 1, 2, 3, 4, 5], 4), { sb: 3, bb: 2 })
  assert.deepEqual(blindSeats(6, [0, 1, 2, 3, 4, 5], 0), { sb: 5, bb: 4 })
})

test('an out seat is skipped by the blinds', () => {
  // Seat 3 is out, so the button at 4 posts against 2 and 1.
  assert.deepEqual(blindSeats(6, [0, 1, 2, 4, 5], 4), { sb: 2, bb: 1 })
  // Button at 0, and the blind that would be seat 5 is out as well.
  assert.deepEqual(blindSeats(6, [0, 1, 2, 3, 4], 0), { sb: 4, bb: 3 })
  // Three-handed: button 2 -> SB 1 -> BB 0.
  assert.deepEqual(blindSeats(6, [0, 1, 2], 2), { sb: 1, bb: 0 })
})

test('heads-up: the button posts the small blind', () => {
  assert.deepEqual(blindSeats(6, [0, 4], 4), { sb: 4, bb: 0 })
  assert.deepEqual(blindSeats(6, [1, 5], 1), { sb: 1, bb: 5 })
  // A stale button (already out) still yields two distinct live seats.
  assert.deepEqual(blindSeats(6, [2, 5], 3), { sb: 2, bb: 5 })
})

test('fewer than two players has no blinds to post', () => {
  assert.equal(blindSeats(6, [0], 0), null)
  assert.equal(blindSeats(6, [], 0), null)
})
