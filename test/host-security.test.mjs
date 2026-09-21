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

function cookie(response) {
  const value = response.res.headers['set-cookie']
  assert.ok(value && value.length === 1)
  return value[0].split(';', 1)[0]
}

function postHeaders(session, extra = {}) {
  return Object.assign({
    'content-type': 'application/json',
    'content-length': '2',
    cookie: session.cookie,
    'x-csrf-token': session.csrf,
    origin: 'http://holdem.test',
  }, extra)
}

test('HTTP sessions isolate tables and issue CSRF-protected cookies', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()

  const first = await request(route)
  const firstSession = {
    cookie: cookie(first),
    csrf: first.res.headers['x-csrf-token'],
  }
  assert.equal(first.res.status, 200)
  assert.match(first.res.headers['set-cookie'][0], /HttpOnly/)
  assert.match(first.res.headers['set-cookie'][0], /SameSite=Strict/)
  assert.match(first.res.headers['set-cookie'][0], /Path=\/dsh-holdem/)
  assert.ok(firstSession.csrf)

  const second = await request(route)
  assert.equal(second.res.status, 200)
  assert.equal(second.body.handNo, 0)
  const started = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/start',
    headers: postHeaders(firstSession),
    body: '{}',
  })
  assert.equal(started.res.status, 200)
  assert.equal(started.body.handNo, 1)

  const firstState = await request(route, {
    headers: { cookie: firstSession.cookie },
  })
  assert.equal(firstState.body.handNo, 1)
  const secondState = await request(route, {
    headers: { cookie: cookie(second) },
  })
  assert.equal(secondState.body.handNo, 0)
})

test('mutations reject missing session, CSRF, wrong origin, and wrong content type', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()
  const boot = await request(route)
  const session = { cookie: cookie(boot), csrf: boot.res.headers['x-csrf-token'] }

  const missingSession = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/reset',
    headers: { 'content-type': 'application/json', 'content-length': '2', origin: 'http://holdem.test' },
    body: '{}',
  })
  assert.equal(missingSession.res.status, 401)

  const missingCsrf = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/reset',
    headers: postHeaders(session, { 'x-csrf-token': '' }),
    body: '{}',
  })
  assert.equal(missingCsrf.res.status, 403)

  const wrongOrigin = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/reset',
    headers: postHeaders(session, { origin: 'https://attacker.test' }),
    body: '{}',
  })
  assert.equal(wrongOrigin.res.status, 403)

  const wrongContentType = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/reset',
    headers: postHeaders(session, { 'content-type': 'text/plain' }),
    body: '{}',
  })
  assert.equal(wrongContentType.res.status, 415)
})

test('request bodies are bounded before and during streaming', async (t) => {
  const server = setup()
  t.after(() => server.dispose())
  const route = server.route()
  const boot = await request(route)
  const session = { cookie: cookie(boot), csrf: boot.res.headers['x-csrf-token'] }

  const declaredTooLarge = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/reset',
    headers: postHeaders(session, { 'content-length': String(4 * 1024 * 1024 + 1) }),
    body: '{}',
  })
  assert.equal(declaredTooLarge.res.status, 413)

  const streamedTooLarge = await request(route, {
    method: 'POST',
    url: '/dsh-holdem/reset',
    headers: postHeaders(session, { 'content-length': '' }),
    body: 'x'.repeat(4 * 1024 * 1024 + 1),
  })
  assert.equal(streamedTooLarge.res.status, 413)
})
