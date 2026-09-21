import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clampRaise, raiseCeiling, raisePresets, raiseSizeForPct } from '../src/bets.js'

// Screenshot: check-available, 1.11M behind, a built pot. 25% of pot is
// already more than the stack, so a naive clamp turns every chip into all-in.

test('25% of a large pot is a quarter of remaining chips, not a silent all-in', () => {
  const v = raiseSizeForPct(25, {
    pot: 4500000,
    currentBet: 0,
    minR: 20000,
    maxR: 1110000,
  })
  assert.equal(v, 277500)
  assert.ok(v < 1110000)
})

test('25% of a small pot stays pot-relative', () => {
  const v = raiseSizeForPct(25, {
    pot: 800000,
    currentBet: 0,
    minR: 20000,
    maxR: 2000000,
  })
  assert.equal(v, 200000)
})

test('sizes below the min raise bump to min, not to all-in', () => {
  const v = raiseSizeForPct(25, {
    pot: 40000,
    currentBet: 0,
    minR: 20000,
    maxR: 2000000,
  })
  assert.equal(v, 20000)
})

test('percent chips that would still be all-in are omitted', () => {
  const chips = raisePresets({
    pot: 4500000,
    currentBet: 0,
    minR: 20000,
    maxR: 1110000,
  })
  assert.deepEqual(chips.map((c) => c.label), ['25%', '33%', '75%'])
  assert.deepEqual(chips.map((c) => c.v), [277500, 366300, 832500])
  assert.ok(chips.every((c) => c.v < 1110000))
})

test('all four chips stay when every pot fraction fits', () => {
  const chips = raisePresets({
    pot: 400000,
    currentBet: 0,
    minR: 20000,
    maxR: 2000000,
  })
  assert.deepEqual(
    chips.map((c) => [c.label, c.v]),
    [
      ['25%', 100000],
      ['33%', 132000],
      ['75%', 300000],
      ['133%', 532000],
    ],
  )
})

// The AI path has the same defect class: maxR is the bot's whole stack, so a
// model that picks a big number out of the legal range silently shoves.

test('an AI raise that asks for the whole stack is capped, not an all-in', () => {
  // 马斯克's live hand: 60K bet, 90K pot, 20K BB, 2M stack.
  const opts = { pot: 90000, currentBet: 60000, bb: 20000, minR: 100000, maxR: 2000000 }
  assert.equal(raiseCeiling(opts), 330000)
  assert.equal(clampRaise(2000000, opts), 330000)
  assert.ok(clampRaise(2000000, opts) < opts.maxR)
})

test('the cap never binds once the pot is already large', () => {
  const opts = { pot: 5000000, currentBet: 200000, bb: 20000, minR: 400000, maxR: 2000000 }
  assert.equal(raiseCeiling(opts), 2000000)
  assert.equal(clampRaise(2000000, opts), 2000000)
})

test('facing a shove there is nothing to cap: the only raise is all-in', () => {
  const opts = { pot: 4000000, currentBet: 2000000, bb: 20000, minR: 2000000, maxR: 2000000 }
  assert.equal(raiseCeiling(opts), 2000000)
  assert.equal(clampRaise(2000000, opts), 2000000)
})

test('a missing or tiny amount bumps up to the minimum raise', () => {
  const opts = { pot: 30000, currentBet: 20000, bb: 20000, minR: 40000, maxR: 2000000 }
  assert.equal(clampRaise(1, opts), 40000)
  assert.equal(clampRaise(0, opts), 40000)
  assert.equal(clampRaise(undefined, opts), 40000)
  assert.equal(clampRaise(60000, opts), 60000)
})
