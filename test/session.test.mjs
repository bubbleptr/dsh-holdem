// Session identity and the capacity guard. The behaviour under test is the
// failure mode a cookie-less shell hits: a stable client id must keep one
// table across polls, and hitting the session cap must never lock the plugin
// out for everyone else.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { apply } from '../src/host.js'

const MAX_SESSIONS = 32

class TestResponse {
  constructor() {
    this.status = 0
    this.headers = {}
    this.body = Buffer.alloc(0)
    this.headersSent = false
    this.destroyed = false
  }

  writeHead(status, headers) {
    this.status = status
    this.headers = headers
    this.headersSent = true
  }

  end(body) {
    this.body = body == null ? Buffer.alloc(0) : Buffer.from(body)
  }

  destroy() {
    this.destroyed = true
  }
}

function setup() {
  let route
  const cleanups = []
  const ctx = {
    effect(fn) {
      const cleanup = fn()
      if (typeof cleanup === 'function') cleanups.push(cleanup)
      return cleanup
    },
    timeout() {
      return function () {}
    },
    get() {
      return undefined
    },
    webServer: {
      register(next) {
        route = next
        return function () { route = null }
      },
    },
  }
  apply(ctx)
  return {
    route() {
      assert.ok(route)
      return route
    },
    dispose() {
      for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]()
    },
  }
}

async function request(route, options = {}) {
  const body = options.body == null ? '' : options.body
  const req = Readable.from(body ? [Buffer.from(body)] : [])
  req.method = options.method || 'GET'
  req.url = options.url || '/dsh-holdem'
  req.headers = Object.assign({ host: 'holdem.test' }, options.headers || {})
  req.socket = { encrypted: false }
  const res = new TestResponse()
  await route.handler(req, res)
  let parsed = null
  try { parsed = JSON.parse(res.body.toString('utf8')) } catch (err) {}
  return { res, body: parsed }
}

// A client that never keeps the cookie: only the client id travels along.
function sidHeaders(sid, extra = {}) {
  return Object.assign({ 'x-holdem-sid': sid }, extra)
}

function postHeaders(sid, csrf, extra = {}) {
  return Object.assign({
    'content-type': 'application/json',
    'content-length': '2',
    'x-holdem-sid': sid,
    'x-csrf-token': csrf,
    origin: 'http://holdem.test',
  }, extra)
}

test('a client id keeps one table even when the session cookie never comes back', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()
  const sid = 'a'.repeat(24)

  const boot = await request(route, { headers: sidHeaders(sid) })
  assert.equal(boot.res.status, 200)
  assert.equal(boot.body.handNo, 0)
  const csrf = boot.res.headers['x-csrf-token']
  assert.ok(csrf)

  const started = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/start',
    headers: postHeaders(sid, csrf),
    body: '{}',
  })
  assert.equal(started.res.status, 200)
  assert.equal(started.body.handNo, 1)

  // Same id, still no cookie: the same table, so the hand is still live.
  const again = await request(route, { headers: sidHeaders(sid) })
  assert.equal(again.body.handNo, 1)
  assert.equal(again.body.status, 'playing')

  // A different client id stays a different table.
  const other = await request(route, { headers: sidHeaders('b'.repeat(24)) })
  assert.equal(other.body.handNo, 0)
  assert.equal(other.body.status, 'idle')
})

test('avatar URLs carry the client id so image fetches reach the same table', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()
  const sid = 'c'.repeat(24)

  const boot = await request(route, { headers: sidHeaders(sid) })
  const agent = boot.body.players[1]
  assert.ok(agent.avatar.src, 'bundled avatars are expected in the repo')
  assert.ok(agent.avatar.src.indexOf('sid=' + sid) !== -1)

  const image = await request(route, {
    url: agent.avatar.src,
    headers: { host: 'holdem.test' },
  })
  assert.equal(image.res.status, 200)
  assert.match(image.res.headers['content-type'], /^image\//)
})

test('the session cap evicts the oldest table instead of refusing new clients', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()
  const oldest = 'd'.repeat(24)

  const boot = await request(route, { headers: sidHeaders(oldest) })
  const started = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/start',
    headers: postHeaders(oldest, boot.res.headers['x-csrf-token']),
    body: '{}',
  })
  assert.equal(started.body.handNo, 1)

  const statuses = []
  for (let i = 0; i < MAX_SESSIONS; i++) {
    const sid = (i.toString(16).padStart(8, '0') + 'e'.repeat(16))
    const res = await request(route, { headers: sidHeaders(sid) })
    statuses.push(res.res.status)
  }
  assert.deepEqual(statuses.filter((s) => s !== 200), [], 'no client is refused at the cap')

  // The oldest table is the one that made room; it starts over, not 503.
  const recycled = await request(route, { headers: sidHeaders(oldest) })
  assert.equal(recycled.res.status, 200)
  assert.equal(recycled.body.status, 'idle')
  assert.equal(recycled.body.handNo, 0)
})

test('a malformed client id is ignored and the cookie path still works', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()

  const boot = await request(route, { headers: { 'x-holdem-sid': 'not an id!' } })
  assert.equal(boot.res.status, 200)
  assert.ok(boot.res.headers['set-cookie'], 'falls back to minting a cookie session')

  const cookie = boot.res.headers['set-cookie'][0].split(';', 1)[0]
  const reused = await request(route, { headers: { cookie: cookie } })
  assert.equal(reused.body.handNo, 0)
  assert.equal(reused.res.headers['set-cookie'], undefined, 'an existing session is not re-issued')
})
