// Shared test harness: drives the real engine with a stubbed llm service, so
// the whole AI path (prompt -> tool call -> normalise -> applyAction) runs
// offline. Nothing here touches the network or the user's running server.
import { apply } from '../src/host.js'

// reply: the tool call every bot returns. opts.single: after the first stream
// every further call never yields, which freezes the AI loop so a hand can be
// inspected with exactly one bot action applied.
export function harness(reply, opts) {
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

export async function call(handler, method, url, body) {
  const res = fakeRes()
  await handler(fakeReq(method, url, body), res)
  return res.body ? JSON.parse(res.body) : null
}

export const ACTION = /加注至|全下|跟注|弃牌|下注|过牌/
// The human's log lines start with their display name, which is literally
// "you" — they must not count as bot actions.
export const botActions = (snap) => snap.log.filter((l) => ACTION.test(l) && !/^you /.test(l)).length

export const post = (h, method, args) =>
  call(h.handler, 'POST', '/dsh-holdem/' + method, args ? JSON.stringify(args) : '')

export const state = (h) => call(h.handler, 'GET', '/dsh-holdem', '')

// Deterministic Math.random replacement (mulberry32): shuffle() and the dealer
// pick both draw from it, so a seeded table is fully reproducible. Assign it in
// a test and always restore the real one in a finally block.
export function seedRandom(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Plays the current hand to the end. The human folds or shoves (heroAction)
// whenever it is their turn; bots act on their own through the stub.
export async function finishHand(h, heroAction, maxSteps) {
  const steps = maxSteps || 400
  for (let i = 0; i < steps; i++) {
    const snap = await state(h)
    if (snap.status !== 'playing') return snap
    if (snap.toAct === 0) {
      await post(h, 'act', { type: heroAction || 'fold' })
      continue
    }
    await new Promise((r) => setTimeout(r, 3))
  }
  throw new Error('the hand never finished')
}

// Waits until at least `want` bot actions have landed in the current hand.
export async function playBots(h, want) {
  await post(h, 'start')
  for (let i = 0; i < 800; i++) {
    const snap = await state(h)
    if (snap.status !== 'playing' || botActions(snap) >= want) return snap
    if (snap.toAct === 0) {
      await post(h, 'act', { type: 'fold' })
      continue
    }
    await new Promise((r) => setTimeout(r, 3))
  }
  throw new Error('the bots never acted')
}
