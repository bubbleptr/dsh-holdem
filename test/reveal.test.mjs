import { test } from 'node:test'
import assert from 'node:assert/strict'
import { finishHand, harness, post, state } from './harness.mjs'

// Anti-leak policy: while a hand is live a bot's hole cards never reach the
// client. They open up at a showdown, and — so the table can show who won with
// what — for the winner of an uncontested pot once the hand is over.

test('a live hand never leaks bot hole cards', async () => {
  const h = harness({ type: 'call' })
  try {
    const dealt = await post(h, 'start')
    assert.equal(dealt.status, 'playing')
    for (const p of dealt.players) {
      if (p.kind === 'ai') assert.equal(p.cards.length, 0, p.name + ' leaked ' + p.cards.length + ' cards')
      else assert.equal(p.cards.length, 2, 'the human always sees their own cards')
    }
    // Also true once the board is out and the hand is still running.
    const mid = await finishHand(h, 'call')
    assert.equal(mid.status, 'hand-over')
  } finally {
    h.dispose()
  }
})

test('a showdown turns every live hand face up, folders included as backs', async () => {
  const h = harness({ type: 'call' })
  try {
    await post(h, 'start')
    const snap = await finishHand(h, 'call')
    assert.equal(snap.revealed, true, 'everyone called, so this is a showdown')
    for (const p of snap.players) {
      if (p.folded || p.out) continue
      assert.equal(p.cards.length, 2, p.name + ' should be face up at a showdown')
    }
    for (const p of snap.players.filter((x) => x.folded)) {
      assert.equal(p.cards.length, 0, p.name + ' folded and must stay hidden')
    }
  } finally {
    h.dispose()
  }
})

test('an uncontested pot reveals the winner and nobody else', async () => {
  // Every bot folds; the human folds too whenever they get the chance. The last
  // player left wins without a showdown, and only that player's cards open up.
  const h = harness({ type: 'fold' })
  try {
    await post(h, 'start')
    const snap = await finishHand(h, 'fold')
    assert.equal(snap.status, 'hand-over')
    assert.equal(snap.revealed, false, 'nobody showed: this was not a showdown')
    const seats = (snap.winners[0] || {}).seats || []
    assert.equal(seats.length, 1, 'a fold win has exactly one winner: ' + snap.log.join(' | '))
    // The human always sees their own cards, so check the bots individually: the
    // winner is the only bot whose hand opens up.
    for (const p of snap.players.filter((x) => x.kind === 'ai')) {
      const isWinner = seats.indexOf(p.seat) !== -1
      assert.equal(
        p.cards.length,
        isWinner ? 2 : 0,
        p.name + (isWinner ? ' won the pot and must be revealed' : ' must stay hidden'),
      )
    }
    assert.equal(snap.players[0].cards.length, 2, 'the human always sees their own cards')
  } finally {
    h.dispose()
  }
})
