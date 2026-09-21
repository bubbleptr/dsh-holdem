import { test } from 'node:test'
import assert from 'node:assert/strict'
import { harness, playBots } from './harness.mjs'

// The reported defect: a bot put its entire 2M stack in on every hand ("他们
// 怎么一直 allin 啊"). The engine is driven with a stubbed llm service, so the
// whole AI path runs offline. Seat 0 is the human and start() picks a random
// dealer, so playBots folds the human away when they happen to act first.

test('the first bot raise is capped, not the whole stack it asked for', async () => {
  const h = harness({ type: 'raise', amount: 2000000, talk: '压上去' }, { single: true })
  try {
    const snap = await playBots(h, 1)
    const raises = snap.log.filter((l) => /加注至/.test(l))
    assert.equal(raises.length, 1, 'expected one raise, got: ' + snap.log.join(' | '))
    // The model asked for 2000000. The capped ceiling for a 30000 pot and a
    // 20000 bet is 20000 + max(3 x 30000, 4 x 20000) = 110000.
    assert.match(raises[0], /加注至 110000$/, 'first raise should be the capped size, got: ' + raises[0])
    assert.equal(snap.log.filter((l) => /全下/.test(l)).length, 0, 'no accidental all-in: ' + snap.log.join(' | '))
    assert.ok(snap.players.every((p) => !p.allIn), 'no bot should be all-in')
  } finally {
    h.dispose()
  }
})

test('an explicit all-in is still an all-in', async () => {
  const h = harness({ type: 'allin', talk: '全下' }, { single: true })
  try {
    const snap = await playBots(h, 1)
    const shover = snap.players.find((p) => /全下/.test(p.lastAction || ''))
    assert.ok(shover, 'expected an all-in: ' + snap.log.join(' | '))
    assert.equal(shover.allIn, true)
    assert.equal(shover.stack, 0)
    assert.equal(shover.bet, 2000000)
  } finally {
    h.dispose()
  }
})

test('the prompt shows a pot-relative raise range and a separate all-in', async () => {
  const h = harness({ type: 'call' }, { single: true })
  try {
    await playBots(h, 1)
    const first = h.prompts[0]
    assert.ok(first, 'the model should have been asked at least once')
    // Preflop, blinds 10K/20K, 2M stacks: ceiling is
    // currentBet(20000) + max(3 x pot(30000), 4 x BB) = 110000.
    assert.match(first, /raise: amount = the raise-to total, from 40000 to 110000/)
    assert.match(first, /about 1\.3–3\.7× the 30000 token pot/)
    assert.match(first, /allin: 2000000 \(your entire stack\)/)
    assert.match(first, /Your stack 2000000 tokens \(about 100 big blinds\)/)
    // The whole stack must never read as the top of the raise range.
    assert.ok(!/to 2000000 \(about/.test(first), 'the stack top must not be the raise range')
    // The human is literally named "you", so the list must not read as two selves.
    assert.match(first, /- seat 0 the human: /)
    assert.match(first, /- seat \d+ YOU: /)
  } finally {
    h.dispose()
  }
})
