import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apply } from '../src/host.js'

// The reported defect: a bot put its entire 2M stack in on every hand ("他们
// 怎么一直 allin 啊"). The engine is driven here with a stubbed llm service so
// the whole AI path runs offline: prompt -> tool call -> normalise ->
// applyAction. Seat 0 is the human, and start() picks a random dealer, so the
// helper folds the human away when they happen to act first.

function harness(reply, opts) {
  const single = !!(opts && opts.single)
  const prompts = []
  const cleanups = []
  let asked = 0
  let handler = null
  const ctx = {
    get(name) {
      if (name === 'llm') {
        return {
          stream(options) {
            asked++
            prompts.push(options.messages[0].content[0].text)
            // With single:true every call after the first one never yields, so
            // the AI loop stops right after the first bot action and the log
            // can be asserted exactly.
            if (single && asked > 1) {
              return (async function* () {
                await new Promise(function () {})
              })()
            }
            return (async function* () {
              yield { type: 'tool-call-delta', argumentsDelta: JSON.stringify(reply) }
              yield { type: 'finish', reason: { kind: 'stop' } }
            })()
          },
        }
      }
      if (name === 'agentDefaultModel') {
        return { currentSelection: () => ({ provider: 'test', model: 'stub' }) }
      }
      return undefined
    },
    // ctx.timeout returns a cancellation function, like the real timer service.
    timeout: (fn) => {
      const t = setTimeout(fn, 0)
      return () => clearTimeout(t)
    },
    webServer: {
      register(spec) {
        handler = spec.handler
        return () => {}
      },
    },
    effect(fn) {
      const d = fn()
      cleanups.push(() => { if (typeof d === 'function') d() })
      return () => {}
    },
  }
  apply(ctx)
  return {
    handler,
    prompts,
    dispose() { cleanups.forEach((fn) => fn()) },
  }
}

function fakeReq(method, url, body) {
  const listeners = {}
  const req = {
    method,
    url,
    on(ev, fn) {
      ;(listeners[ev] = listeners[ev] || []).push(fn)
      return req
    },
  }
  setTimeout(() => {
    if (body) (listeners.data || []).forEach((fn) => fn(Buffer.from(body)))
    ;(listeners.end || []).forEach((fn) => fn())
  }, 0)
  return req
}

function fakeRes() {
  return {
    code: 0,
    body: '',
    writeHead(code) { this.code = code },
    end(data) { if (data) this.body += String(data) },
  }
}

async function call(handler, method, url, body) {
  const res = fakeRes()
  await handler(fakeReq(method, url, body), res)
  return res.body ? JSON.parse(res.body) : null
}

const ACTION = /加注至|全下|跟注|弃牌|下注/
// The human's log lines start with their display name, which is literally
// "you" — they must not count as bot actions.
const botActions = (snap) => snap.log.filter((l) => ACTION.test(l) && !/^you /.test(l)).length

async function playBots(h, want) {
  await call(h.handler, 'POST', '/dsh-holdem/start', '')
  for (let i = 0; i < 800; i++) {
    const snap = await call(h.handler, 'GET', '/dsh-holdem', '')
    if (snap.status !== 'playing' || botActions(snap) >= want) return snap
    if (snap.toAct === 0) {
      await call(h.handler, 'POST', '/dsh-holdem/act', JSON.stringify({ type: 'fold' }))
      continue
    }
    await new Promise((r) => setTimeout(r, 5))
  }
  throw new Error('the bots never acted')
}

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
  const h = harness({ type: 'allin', talk: '全下' })
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
    // The human is literally named "you", so the list must not read as two selves.
    assert.match(first, /- seat 0 the human: /)
    assert.match(first, /- seat \d+ YOU: /)
    // The whole stack must never read as the top of the raise range.
    assert.ok(!/to 2000000 \(about/.test(first), 'the stack top must not be the raise range')
  } finally {
    h.dispose()
  }
})
