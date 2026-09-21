import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TALK_MAX_LENGTH, fallbackTalk, sanitizeTalk } from '../src/talk.js'

test('sanitizeTalk enforces the sixteen-character limit', () => {
  const talk = sanitizeTalk('这是一句足够长的桌边闲话用于测试长度限制。')
  assert.ok(talk)
  assert.ok(Array.from(talk).length <= TALK_MAX_LENGTH)
})

test('sanitizeTalk removes private card information but allows bluffing', () => {
  assert.equal(sanitizeTalk('我拿到了As'), '')
  assert.equal(sanitizeTalk('我有同花'), '')
  assert.equal(sanitizeTalk('我只是试探一下。'), '我只是试探一下。')
})

test('fallbackTalk always supplies safe talk for every AI action', () => {
  for (const action of ['blind', 'fold', 'check', 'call', 'raise']) {
    const talk = fallbackTalk({ bluff: 0 }, action, () => 0.99)
    assert.ok(talk)
    assert.ok(Array.from(talk).length <= TALK_MAX_LENGTH)
    assert.equal(sanitizeTalk(talk), talk)
  }
})

test('fallbackTalk can produce a bluff line and avoids the previous line', () => {
  assert.equal(fallbackTalk({ bluff: 1 }, 'raise', () => 0), '这点压力不够。')
  assert.notEqual(
    fallbackTalk({ bluff: 0 }, 'check', () => 0, ['先看看。']),
    '先看看。',
  )
})
