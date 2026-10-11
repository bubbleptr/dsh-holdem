import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import vm from 'node:vm'
import { build } from 'esbuild'
import { apply } from '../src/host.js'
import { wrapClient } from '../scripts/wrap-client.mjs'

const bundle = await build({
  entryPoints: [new URL('../src/client.cjs', import.meta.url).pathname],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  external: ['react'],
})

function deferred() {
  let resolve
  let reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

// Complete the current promise chains without advancing the polling clock.
const settled = () => new Promise((resolve) => setImmediate(resolve))

function text(node) {
  if (node == null || typeof node === 'boolean') return ''
  if (Array.isArray(node)) return node.map(text).join(' ')
  if (typeof node !== 'object') return String(node)
  return text(node.props.children)
}

function findButton(node, label) {
  if (node == null || typeof node !== 'object') return null
  if (Array.isArray(node)) return node.map((child) => findButton(child, label)).find(Boolean)
  if (node.type === 'button' && text(node) === label) return node
  return findButton(node.props.children, label)
}

function renderer() {
  let current
  let root
  let tree
  let rendering = false
  let dirty = false
  let effects = []
  const instances = new Map()
  const nextHook = () => {
    const index = current.index++
    return current.hooks[index] || (current.hooks[index] = {})
  }
  const changed = (old, next) => !old || next.some((value, i) => !Object.is(value, old[i]))
  const React = {
    createElement(type, props, ...children) { return { type, props: { ...props, children } } },
    useState(initial) {
      const hook = nextHook()
      if (!('value' in hook)) hook.value = typeof initial === 'function' ? initial() : initial
      return [hook.value, (next) => {
        const value = typeof next === 'function' ? next(hook.value) : next
        if (Object.is(value, hook.value)) return
        hook.value = value
        render()
      }]
    },
    useRef(initial) {
      const hook = nextHook()
      return hook.ref || (hook.ref = { current: initial })
    },
    useMemo(fn, deps) {
      const hook = nextHook()
      if (changed(hook.deps, deps)) { hook.value = fn(); hook.deps = deps }
      return hook.value
    },
    useEffect(fn, deps) {
      const hook = nextHook()
      if (changed(hook.deps, deps)) {
        hook.deps = deps
        effects.push(() => { hook.cleanup?.(); hook.cleanup = fn() })
      }
    },
  }
  function visit(node, path) {
    if (node == null || typeof node !== 'object') return node
    if (Array.isArray(node)) return node.map((child, i) => visit(child, path + '/' + i))
    if (typeof node.type === 'function') {
      let instance = instances.get(path)
      if (!instance || instance.type !== node.type) {
        instance = { type: node.type, hooks: [], index: 0 }
        instances.set(path, instance)
      }
      current = instance
      instance.index = 0
      const child = node.type(node.props)
      return visit(child, path + '/component')
    }
    return { ...node, props: { ...node.props, children: visit(node.props.children, path + '/children') } }
  }
  function render() {
    if (!root) return
    if (rendering) { dirty = true; return }
    rendering = true
    do {
      dirty = false
      effects = []
      tree = visit(React.createElement(root, { t: (key) => key }), 'root')
      for (const effect of effects) effect()
    } while (dirty)
    rendering = false
  }
  function unmount() {
    root = null
    for (const instance of instances.values()) {
      for (const hook of instance.hooks) hook.cleanup?.()
    }
    instances.clear()
  }
  return {
    React,
    mount(component) { root = component; render() },
    unmount,
    text: () => text(tree),
    click(label) {
      const button = findButton(tree, label)
      assert.ok(button, 'button should be visible: ' + label)
      assert.ok(!button.props.disabled, 'button should be enabled: ' + label)
      button.props.onClick()
    },
  }
}

function setup(t) {
  const cleanups = []
  const slots = new Map()
  const intervals = new Map()
  const storage = new Map()
  const gets = []
  const view = renderer()
  let nextInterval = 0
  let handler
  const effect = (fn) => {
    const cleanup = fn()
    if (typeof cleanup === 'function') cleanups.push(cleanup)
    return cleanup
  }
  apply({
    effect,
    timeout: () => () => {},
    get: () => undefined,
    webServer: { register(route) { handler = route.handler; return () => {} } },
  })
  async function dispatch(url, options) {
    const req = Readable.from(options.body ? [Buffer.from(options.body)] : [])
    req.method = options.method
    req.url = url
    req.headers = { host: '127.0.0.1:19387', referer: 'dsh-app://app/', ...options.headers }
    if (options.body) req.headers['content-length'] = String(Buffer.byteLength(options.body))
    req.socket = { encrypted: false }
    const res = {
      headersSent: false,
      writeHead(status, headers) { this.status = status; this.headers = headers; this.headersSent = true },
      end(body) { this.body = Buffer.from(body || '') },
      destroy() {},
    }
    await handler(req, res)
    return {
      status: res.status,
      ok: res.status >= 200 && res.status < 300,
      headers: { get: (name) => res.headers[name.toLowerCase()] || null },
      json: () => Promise.resolve(JSON.parse(res.body.toString())),
    }
  }
  let client
  const window = {
    localStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    __ModuleLoader__: {
      load({ factory }) {
        client = factory((name) => {
          assert.equal(name, 'react')
          return view.React
        })
      },
    },
  }
  vm.runInNewContext(wrapClient(bundle.outputFiles[0].text, 'dsh-holdem'), {
    window,
    console,
    document: { createElement: () => ({ dataset: {}, remove() {} }), head: { appendChild() {} } },
    setInterval(fn) { const id = ++nextInterval; intervals.set(id, fn); return id },
    clearInterval: (id) => intervals.delete(id),
    fetch(url, options) {
      const ready = dispatch(url, options)
      if (options.method !== 'GET') return ready
      const delivery = deferred()
      const request = { ready, delivery, delivered: false }
      gets.push(request)
      return delivery.promise
    },
  })
  client.apply({
    effect,
    locale: { register: () => () => {}, bind: () => (key) => key },
    slots: {
      inject: (name, fn) => fn(),
      register(spec, component) { slots.set(spec.name, component); return () => slots.delete(spec.name) },
    },
  })
  t.after(() => {
    view.unmount()
    for (const cleanup of cleanups.reverse()) cleanup()
  })
  return {
    view,
    gets,
    mount: () => view.mount(slots.get('conversation.view')),
    tick() { for (const fn of intervals.values()) fn() },
    async deliver(request) {
      request.delivered = true
      request.delivery.resolve(await request.ready)
      await settled()
    },
    async deliverPending() {
      for (const request of gets.filter((request) => !request.delivered)) await this.deliver(request)
    },
  }
}

test('a slow cookie-less startup keeps the table the player started', async (t) => {
  const app = setup(t)
  app.mount()
  await app.gets[0].ready
  app.tick()
  await app.deliver(app.gets[0])
  app.view.click('Start')
  await settled()
  assert.match(app.view.text(), /第 1 手/)

  await app.deliverPending()
  app.tick()
  await app.deliverPending()
  assert.match(app.view.text(), /第 1 手/, 'a late startup response must not switch to an unused table')
})

test('the player can start a table after a polling request fails', async (t) => {
  const app = setup(t)
  app.mount()
  const failed = app.gets[0]
  await failed.ready
  failed.delivered = true
  failed.delivery.reject(new Error('network unavailable'))
  await settled()
  assert.match(app.view.text(), /network unavailable/)

  app.tick()
  await app.deliverPending()
  app.view.click('Start')
  await settled()
  assert.match(app.view.text(), /第 1 手/)
  assert.doesNotMatch(app.view.text(), /network unavailable/)
})

test('reopening the tab during startup keeps the table the player starts', async (t) => {
  const app = setup(t)
  app.mount()
  await app.gets[0].ready
  app.view.unmount()
  app.mount()
  await app.deliver(app.gets[0])
  app.view.click('Start')
  await settled()
  assert.match(app.view.text(), /第 1 手/)

  await app.deliverPending()
  app.tick()
  await app.deliverPending()
  assert.match(app.view.text(), /第 1 手/, 'reopening must not leave a second startup response that replaces the table')
})
