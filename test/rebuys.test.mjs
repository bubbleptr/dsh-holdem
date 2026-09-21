import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_REBUYS } from '../src/table-rules.js'
import { finishHand, harness, post, seedRandom, state } from './harness.mjs'

// The table used to top every busted player back up to 2M forever, so nobody
// could ever be knocked out and a shove cost nothing. Each player now gets
// MAX_REBUYS bullets; after that they sit out, and the human running dry ends
// the session.

function checkInvariants(snap, where) {
  assert.equal(snap.maxRebuys, MAX_REBUYS)
  for (const p of snap.players) {
    assert.ok(p.rebuys <= snap.maxRebuys, where + ': ' + p.name + ' rebought ' + p.rebuys)
    if (!p.out) continue
    assert.equal(p.rebuys, snap.maxRebuys, where + ': ' + p.name + ' out before using every bullet')
    assert.equal(p.hasCards, false, where + ': ' + p.name + ' is out but was dealt cards')
    assert.equal(p.bet, 0, where + ': ' + p.name + ' is out but posted chips')
    assert.equal(p.committed, 0, where + ': ' + p.name + ' is out but has chips in the pot')
    assert.equal(p.isDealer || p.isSb || p.isBb, false, where + ': ' + p.name + ' is out but holds a seat')
  }
  if (snap.status === 'playing' || snap.status === 'hand-over') {
    const sb = snap.players.find((p) => p.isSb)
    const bb = snap.players.find((p) => p.isBb)
    assert.ok(sb && bb, where + ': blinds must be posted')
    assert.notEqual(sb.seat, bb.seat, where + ': one player cannot post both blinds')
    assert.equal(sb.out, false, where + ': an out player posted the small blind')
    assert.equal(bb.out, false, where + ': an out player posted the big blind')
    assert.equal(snap.players[snap.dealer].out, false, where + ': an out player holds the button')
  }
  if (snap.gameOver) {
    assert.equal(snap.status, 'game-over')
    assert.equal(snap.toAct, null)
  } else if (snap.status !== 'idle') {
    assert.ok(snap.players.filter((p) => !p.out).length >= 2, where + ': dealt with fewer than two players')
  }
}

test('bots run out of bullets, sit out, and never take a seat again', async () => {
  // Every bot shoves, the human folds: the bots knock each other out fast.
  const h = harness({ type: 'allin', talk: '全下' })
  try {
    let snap = await post(h, 'start')
    checkInvariants(snap, 'hand 1')
    assert.ok(snap.players.every((p) => p.rebuys === 0 && !p.out), 'a fresh table is all in')
    const seen = []
    seen.push.apply(seen, snap.log)

    for (let i = 0; i < 25; i++) {
      snap = await finishHand(h, 'fold')
      checkInvariants(snap, 'hand ' + (i + 1))
      seen.push.apply(seen, snap.log)
      if (snap.status === 'game-over') break
      snap = await post(h, 'next-hand')
      checkInvariants(snap, 'hand ' + (i + 1) + ' dealt')
      seen.push.apply(seen, snap.log)
      if (snap.status === 'game-over') break
    }

    const out = snap.players.filter((p) => p.out)
    assert.ok(out.length > 0, 'expected some bots to be eliminated: ' + snap.log.join(' | '))
    assert.ok(
      snap.players.some((p) => p.rebuys > 0),
      'a bot should have rebought at least once',
    )
    assert.equal(snap.players[0].out, false, 'the human folded every hand and must still be alive')
    // state.log is a rolling 10-line window, so look at everything seen so far.
    const log = seen.join(' | ')
    assert.ok(/重新买入 2000000/.test(log), 'the log should mention a rebuy')
    assert.ok(/买入用尽，出局/.test(log), 'the log should mention the elimination')
  } finally {
    h.dispose()
  }
})

test('the human runs out of bullets and the table ends until Reset', async () => {
  // Every bot calls, the human shoves. An unseeded table is a coin flip per
  // hand (the human usually busts first, but sometimes wins the whole table),
  // so seed the shuffle: seed 4 busts the human on all four bullets within four
  // hands, which makes this a deterministic check of the human-specific ending.
  const real = Math.random
  Math.random = seedRandom(4)
  const h = harness({ type: 'call', talk: '跟' })
  try {
    let snap = await post(h, 'start')
    checkInvariants(snap, 'dealt')
    for (let i = 0; i < 6; i++) {
      snap = await finishHand(h, 'allin')
      checkInvariants(snap, 'hand ' + (i + 1))
      if (snap.status === 'game-over') break
      snap = await post(h, 'next-hand')
      checkInvariants(snap, 'hand ' + (i + 1) + ' dealt')
      if (snap.status === 'game-over') break
    }

    assert.equal(snap.status, 'game-over', 'the human should be out of bullets: ' + snap.log.join(' | '))
    assert.equal(snap.gameOver, true)
    const hero = snap.players[0]
    assert.equal(hero.out, true)
    assert.equal(hero.rebuys, MAX_REBUYS)
    assert.equal(hero.stack, 0)
    assert.equal(hero.hasCards, false)
    assert.match(snap.log.join(' | '), /你的 3 次买入已经用完，本局结束/)

    // Once the table has ended, 下一手 must not silently deal a new hand.
    const again = await post(h, 'next-hand')
    assert.equal(again.status, 'game-over')
    assert.equal(again.players[0].rebuys, MAX_REBUYS)

    // Reset hands out the bullets again.
    const fresh = await post(h, 'reset')
    assert.equal(fresh.status, 'idle')
    assert.equal(fresh.gameOver, false)
    assert.ok(fresh.players.every((p) => p.rebuys === 0 && !p.out && p.stack === 2000000))

    // A fresh Start deals a full table again.
    const restarted = await post(h, 'start')
    assert.equal(restarted.status, 'playing')
    assert.equal(restarted.players[0].out, false)
    assert.equal(restarted.handNo, 1)
    checkInvariants(restarted, 'restarted')
  } finally {
    h.dispose()
    Math.random = real
  }
})

test('budgets are visible in the snapshot and the log names the buyer', async () => {
  const h = harness({ type: 'allin', talk: '全下' })
  try {
    let snap = await post(h, 'start')
    assert.ok(snap.players.every((p) => p.rebuys === 0 && !p.out))
    // A fresh table holds exactly six starting stacks, blinds included.
    assert.equal(
      snap.players.reduce((s, p) => s + p.stack + p.committed, 0),
      6 * 2000000,
      'chips must be conserved while dealing',
    )
    const seen = []
    seen.push.apply(seen, snap.log)
    for (let i = 0; i < 6; i++) {
      snap = await finishHand(h, 'fold')
      seen.push.apply(seen, snap.log)
      if (snap.status === 'game-over') break
      snap = await post(h, 'next-hand')
      seen.push.apply(seen, snap.log)
      if (snap.status === 'game-over') break
    }
    const rebuys = snap.players.filter((p) => p.rebuys > 0)
    assert.ok(rebuys.length > 0, 'someone should have rebought: ' + snap.log.join(' | '))
    const log = seen.join(' | ')
    for (const p of rebuys) {
      assert.match(log, new RegExp(p.name + ' 重新买入 2000000'), 'missing rebuy line for ' + p.name)
    }
    // Every rebuy is announced with its bullet number, so a player can never
    // silently exceed the budget in the log.
    for (const line of seen.filter((l) => /重新买入/.test(l))) {
      assert.match(line, /（第 [1-3]\/3 次）$/, 'unexpected rebuy line: ' + line)
    }
    const fresh = await state(h)
    assert.deepEqual(fresh.players.map((p) => [p.rebuys, p.out]), snap.players.map((p) => [p.rebuys, p.out]))
  } finally {
    h.dispose()
  }
})
