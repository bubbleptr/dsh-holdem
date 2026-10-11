import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'

let moduleId = 0

async function setup(t, extraOrigins) {
  const previous = process.env.DSH_HOLDEM_EXTRA_ORIGINS
  let apply
  try {
    if (extraOrigins === undefined) delete process.env.DSH_HOLDEM_EXTRA_ORIGINS
    else process.env.DSH_HOLDEM_EXTRA_ORIGINS = extraOrigins
    apply = (await import('../src/host.js?origin-test=' + ++moduleId)).apply
  } finally {
    if (previous === undefined) delete process.env.DSH_HOLDEM_EXTRA_ORIGINS
    else process.env.DSH_HOLDEM_EXTRA_ORIGINS = previous
  }

  let route
  const cleanups = []
  apply({
    effect(fn) {
      const cleanup = fn()
      if (typeof cleanup === 'function') cleanups.push(cleanup)
      return cleanup
    },
    timeout() { return function () {} },
    get() { return undefined },
    webServer: {
      register(next) {
        route = next
        return function () { route = null }
      },
    },
  })
  const server = createServer(route.handler)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(async () => {
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
    for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]()
  })
  const url = 'http://127.0.0.1:' + server.address().port
  return {
    origin: url,
    async request(path = '/dsh-holdem', options = {}) {
      const response = await fetch(url + path, options)
      return { status: response.status, headers: response.headers, body: await response.json() }
    },
  }
}

function sessionHeaders(response, extra = {}) {
  return {
    'content-type': 'application/json',
    'x-holdem-session': response.headers.get('x-holdem-session'),
    'x-csrf-token': response.headers.get('x-csrf-token'),
    ...extra,
  }
}

test('a reverse-proxy origin matches a configured hostname and default port', async (t) => {
  const { request } = await setup(t, 'https://PUBLIC.test:443/')
  const boot = await request('/dsh-holdem', { headers: { origin: 'https://public.test' } })
  assert.equal(boot.status, 200)

  const started = await request('/dsh-holdem/start', {
    method: 'POST',
    headers: sessionHeaders(boot, { origin: 'https://public.test' }),
    body: '{}',
  })
  assert.equal(started.status, 200)
  assert.equal(started.body.handNo, 1)
})

test('an unset or empty allowlist keeps unknown origins from allocating tables', async (t) => {
  for (const extraOrigins of [undefined, '']) {
    const { request, origin } = await setup(t, extraOrigins)
    const rejected = await request('/dsh-holdem', { headers: { origin: 'https://public.test' } })
    assert.equal(rejected.status, 403)
    assert.equal(rejected.headers.get('x-holdem-session'), null)

    const local = await request('/dsh-holdem', { headers: { origin } })
    assert.equal(local.status, 200)
  }
})

test('comma-separated origins accept surrounding whitespace and trailing slashes', async (t) => {
  const { request } = await setup(t, ' , \n https://one.test/ ,\t http://two.test:8080///, ')
  for (const origin of ['https://one.test', 'http://two.test:8080']) {
    const boot = await request('/dsh-holdem', { headers: { origin } })
    assert.equal(boot.status, 200)
  }

  const rejected = await request('/dsh-holdem', { headers: { origin: 'https://unknown.test' } })
  assert.equal(rejected.status, 403)
})

test('a configured origin also authorizes requests carrying only a Referer', async (t) => {
  const { request } = await setup(t, 'https://public.test')
  const referer = 'https://public.test/poker?table=1'
  const boot = await request('/dsh-holdem', { headers: { referer } })
  assert.equal(boot.status, 200)

  const started = await request('/dsh-holdem/start', {
    method: 'POST',
    headers: sessionHeaders(boot, { referer }),
    body: '{}',
  })
  assert.equal(started.status, 200)
  assert.equal(started.body.handNo, 1)
})

test('an allowed origin cannot mutate a table without its CSRF token', async (t) => {
  const { request } = await setup(t, 'https://public.test')
  const origin = 'https://public.test'
  const boot = await request('/dsh-holdem', { headers: { origin } })
  assert.equal(boot.status, 200)

  for (const token of ['', 'forged-token']) {
    const rejected = await request('/dsh-holdem/start', {
      method: 'POST',
      headers: sessionHeaders(boot, { origin, 'x-csrf-token': token }),
      body: '{}',
    })
    assert.equal(rejected.status, 403)
  }

  const unchanged = await request('/dsh-holdem', { headers: sessionHeaders(boot, { origin }) })
  assert.equal(unchanged.body.handNo, 0)
})

test('an allowed origin cannot bypass cross-site Fetch Metadata rejection', async (t) => {
  const { request } = await setup(t, 'https://public.test')
  const origin = 'https://public.test'
  const crossSite = { origin, 'sec-fetch-site': 'cross-site' }
  const rejectedRead = await request('/dsh-holdem', { headers: crossSite })
  assert.equal(rejectedRead.status, 403)
  assert.equal(rejectedRead.headers.get('x-holdem-session'), null)

  const boot = await request('/dsh-holdem', { headers: { origin } })
  assert.equal(boot.status, 200)
  const rejectedStart = await request('/dsh-holdem/start', {
    method: 'POST',
    headers: sessionHeaders(boot, crossSite),
    body: '{}',
  })
  assert.equal(rejectedStart.status, 403)

  const unchanged = await request('/dsh-holdem', { headers: sessionHeaders(boot, { origin }) })
  assert.equal(unchanged.body.handNo, 0)
})

test('invalid and non-HTTP configuration entries grant no origin access', async (t) => {
  const { request } = await setup(t, 'not-a-url,ftp://files.test,dsh-app://app/,null,https://public.test')
  for (const origin of ['null', 'ftp://files.test', 'https://unknown.test']) {
    const rejected = await request('/dsh-holdem', { headers: { origin } })
    assert.equal(rejected.status, 403)
  }

  const valid = await request('/dsh-holdem', { headers: { origin: 'https://public.test' } })
  assert.equal(valid.status, 200)
})
