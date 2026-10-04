// Desktop shell regression: Electron's main process proxies dsh-app://
// requests to the loopback Host, replacing the request cookie with its own and
// withholding Set-Cookie, while keeping custom headers and the URL. These tests
// drive that exact shape so a change that quietly re-depends on cookies fails.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { apply } from '../src/host.js'

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

// Exactly what the desktop proxy forwards: no cookie, no origin, no
// sec-fetch-site, the dsh-app referrer, and every custom header intact.
async function request(route, options = {}) {
  const body = options.body == null ? '' : options.body
  const req = Readable.from(body ? [Buffer.from(body)] : [])
  req.method = options.method || 'GET'
  req.url = options.url || '/dsh-holdem'
  req.headers = Object.assign({ host: '127.0.0.1:19387', referer: 'dsh-app://app/' }, options.headers || {})
  req.socket = { encrypted: false }
  const res = new TestResponse()
  await route.handler(req, res)
  let parsed = null
  try { parsed = JSON.parse(res.body.toString('utf8')) } catch (err) {}
  return { res, body: parsed }
}

test('desktop proxy shape: the session header resumes a table without cookies', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()

  const boot = await request(route)
  assert.equal(boot.res.status, 200)
  const sid = boot.res.headers['x-holdem-session']
  assert.ok(sid, 'the host must return the session id as a header, not only as a cookie')
  const csrf = boot.res.headers['x-csrf-token']
  assert.ok(csrf)

  const started = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/start',
    headers: { 'content-type': 'application/json', 'content-length': '2', 'x-holdem-session': sid, 'x-csrf-token': csrf },
    body: '{}',
  })
  assert.equal(started.res.status, 200)
  assert.equal(started.body.handNo, 1)

  const again = await request(route, { headers: { 'x-holdem-session': sid } })
  assert.equal(again.res.headers['x-holdem-session'], sid)
  assert.equal(again.body.handNo, 1, 'the header must resume the same table')

  const other = await request(route)
  assert.notEqual(other.res.headers['x-holdem-session'], sid)
  assert.equal(other.body.handNo, 0, 'a fresh browser gets its own table')
})

test('desktop proxy shape: avatars load through the media token in the URL', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()

  const boot = await request(route)
  const altman = boot.body.players.find((p) => p.id === 'altman')
  assert.match(altman.avatar.src, /[?&]t=/)

  const image = await request(route, { url: altman.avatar.src })
  assert.equal(image.res.status, 200)
  assert.match(image.res.headers['content-type'], /^image\//)
  assert.ok(image.res.body.length > 0)

  const anonymous = await request(route, { url: '/dsh-holdem/avatar/altman?v=0' })
  assert.equal(anonymous.res.status, 401)

  const forged = await request(route, { url: '/dsh-holdem/avatar/altman?t=not-a-real-token' })
  assert.equal(forged.res.status, 401)
})

test('desktop proxy shape: the media token cannot drive mutations', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()

  const boot = await request(route)
  const mediaToken = /[?&]t=([^&]+)/.exec(boot.body.players.find((p) => p.id === 'altman').avatar.src)[1]
  const csrf = boot.res.headers['x-csrf-token']

  const attempt = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/start',
    headers: { 'content-type': 'application/json', 'content-length': '2', 'x-holdem-session': mediaToken, 'x-csrf-token': csrf },
    body: '{}',
  })
  assert.equal(attempt.res.status, 401)
})

test('desktop proxy shape: an http(s) cross-origin referer is still rejected', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()

  const boot = await request(route)
  const sid = boot.res.headers['x-holdem-session']
  const csrf = boot.res.headers['x-csrf-token']

  const hostile = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/reset',
    headers: {
      'content-type': 'application/json',
      'content-length': '2',
      'x-holdem-session': sid,
      'x-csrf-token': csrf,
      referer: 'https://attacker.test/',
    },
    body: '{}',
  })
  assert.equal(hostile.res.status, 403)
})
