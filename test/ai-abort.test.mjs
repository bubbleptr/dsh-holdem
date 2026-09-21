import { test } from 'node:test'
import assert from 'node:assert/strict'
import { harness, playBots, post, state, botActions } from './harness.mjs'

// Waits until the second bot's llm.stream() call has actually started (it
// then hangs forever, per `single: true`), so we have a genuinely in-flight
// request to abort rather than the first bot's already-finished one. The
// human (seat 0) may be next to act before that second bot's turn comes up —
// like playBots, fold them out of the way rather than sit blocked on it.
async function waitForSecondCall(h) {
  for (let i = 0; i < 800; i++) {
    if (h.streamOptions.length >= 2) return
    const snap = await state(h)
    if (snap.status === 'playing' && snap.toAct === 0) {
      await post(h, 'act', { type: 'fold' })
      continue
    }
    await new Promise((r) => setTimeout(r, 3))
  }
  throw new Error('the second bot never started its request')
}

// dsh 0.1.6 adds runtime plugin unload; in-flight LLM requests must be
// aborted on cleanup instead of running to completion in the background.
// `single: true` makes the harness's llm.stream() hang forever from the
// second call onward, so after the first bot acts, the next bot's request is
// still "in flight" when we tear the table down.

test('disposing the table aborts the in-flight AI request', async () => {
  const h = harness({ type: 'call', talk: '跟一手' }, { single: true })
  try {
    const before = await playBots(h, 1)
    assert.equal(botActions(before), 1, 'one bot should have acted: ' + before.log.join(' | '))
    await waitForSecondCall(h)

    // The second bot's askAgent() call is now hung mid-stream.
    const inFlight = h.streamOptions[h.streamOptions.length - 1]
    assert.ok(inFlight.signal, 'llm.stream should receive an AbortSignal')
    assert.equal(inFlight.signal.aborted, false)

    h.dispose()
    assert.equal(inFlight.signal.aborted, true, 'dispose() must abort the in-flight request')
  } finally {
    h.dispose()
  }
})

test('an in-flight request aborted by reset never commits a bot action', async () => {
  const h = harness({ type: 'call', talk: '跟一手' }, { single: true })
  try {
    await playBots(h, 1)
    await waitForSecondCall(h)

    const idx = h.streamOptions.length - 1
    const inFlight = h.streamOptions[idx]
    const settled = h.streamSettled[idx]

    await post(h, 'reset')
    assert.equal(inFlight.signal.aborted, true, 'reset() must abort the in-flight request')

    // The stub only yields its `finish: aborted` chunk once the signal
    // actually fires, so awaiting `settled` waits for askAgent to have seen
    // that abort and rejected — a real completion, not a guessed duration.
    await settled
    // One more microtask/timer turn for the rejection to reach runAi's
    // .catch, which is attached via .then()/.catch() on askAgent's promise.
    await new Promise((r) => setTimeout(r, 0))

    const afterReset = await state(h)
    assert.equal(afterReset.status, 'idle')
    assert.equal(botActions(afterReset), 0, 'the discarded request must not have committed anything')

    // A wiped, reset log would read as "no bot actions" even if the guard
    // were broken. Prove the discard, not the reset: start a fresh hand and
    // confirm the aborted request's late result still never lands, there
    // either (handNo/toAct will have moved on, so the stale-seq guard in
    // runAi must be what's keeping it out).
    await post(h, 'start')
    const fresh = await state(h)
    assert.equal(botActions(fresh), 0, 'the aborted request must not leak an action into the next hand')
  } finally {
    h.dispose()
  }
})
