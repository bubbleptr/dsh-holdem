import { cardTxt, evalBest, makeDeck, shuffle, strength } from './cards.js'
import { makePots } from './pots.js'
import { avatarDataDir, avatarView, decodeAvatar, isPlayerId, loadBundled, loadOverrides, removeOverride, writeOverride } from './avatars.js'

const START_STACK = 2000000
const SB = 10000
const BB = 20000

const BOTS = [
  { id: 'altman', name: 'Altman', emoji: 'A', brand: 'openai', company: 'OpenAI', loose: 0.04, agg: 0.58, bluff: 0.08, tag: 'OpenAI', style: '你是 OpenAI 创始人 Sam Altman。紧凶、爱讲愿景，但牌桌上绝不露底。垃圾牌就弃，强牌价值下注，很少大额诈唬。' },
  { id: 'dario', name: '达里奥', emoji: 'D', brand: 'anthropic', company: 'Anthropic', loose: -0.1, agg: 0.22, bluff: 0.03, tag: 'Anthropic', style: '你是 Anthropic 创始人 Dario Amodei。极紧、安全优先。只有强成牌或大听牌才继续，几乎不诈唬。' },
  { id: 'musk', name: '马斯克', emoji: 'X', brand: 'xai', company: 'xAI', loose: 0.3, agg: 0.88, bluff: 0.36, tag: 'xAI', style: '你是 xAI 创始人埃隆·马斯克。疯子打法，爱全下，闲话短促带刺，偶尔乱诈。' },
  { id: 'liang', name: '梁文峰', emoji: '梁', brand: 'deepseek', company: 'DeepSeek', loose: 0.16, agg: 0.72, bluff: 0.22, tag: 'DeepSeek', style: '你是 DeepSeek 创始人梁文峰。高效松凶，尺度多变，会突然加注，专吃软玩家。' },
  { id: 'jensen', name: '黄仁勋', emoji: '黄', brand: 'nvidia', company: 'NVIDIA', loose: 0.12, agg: 0.7, bluff: 0.12, tag: 'NVIDIA', style: '你是 NVIDIA 创始人黄仁勋。热情、持续施压、爱价值下注。闲话像发布会，但不提牌面。' },
]

const ACT_TOOL = {
  name: 'holdem_act',
  description: 'Take exactly one legal No-Limit Hold\'em action.',
  parameters: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['fold', 'check', 'call', 'raise'] },
      amount: { type: 'number', description: 'Raise-to total in tokens. Required for raise.' },
      talk: { type: 'string', description: '可选桌边闲话，必须是简体中文，最多16个字。禁止提到底牌、花色、点数、听牌、成牌或任何推理过程。' },
    },
    required: ['type'],
  },
}

function sanitizeTalk(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let talk = raw.replace(/\s+/g, '').trim()
  if (!talk) return ''
  if (/[A-Za-z]{3,}/.test(talk)) return ''
  if (/(底牌|手牌|洞牌|对子|同花|顺子|葫芦|四条|皇家|听牌|成牌|胜率|赔率|范围|range|odds|equity|[♠♥♦♣]|黑桃|红心|红桃|方块|梅花|[AKQJT2-9][shdc])/i.test(talk)) return ''
  return talk.slice(0, 24)
}

function parseJsonObject(text) {
  if (!text) return null
  const raw = String(text)
  try { return JSON.parse(raw) } catch (e) {}
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try { return JSON.parse(raw.slice(start, end + 1)) } catch (e) { return null }
}

function createPlayer(spec, seat) {
  return {
    id: spec.id,
    name: spec.name,
    emoji: spec.emoji,
    brand: spec.brand || '',
    company: spec.company || '',
    kind: spec.kind,
    tag: spec.tag || '',
    loose: spec.loose || 0,
    agg: spec.agg || 0.4,
    bluff: spec.bluff || 0.1,
    seat: seat,
    stack: START_STACK,
    bet: 0,
    committed: 0,
    folded: false,
    allIn: false,
    acted: false,
    cards: [],
    lastAction: '',
    lastThought: '',
    talk: '',
    style: spec.style || '',
  }
}

export function createTable(ctx) {
  const state = {
    status: 'idle',
    handNo: 0,
    street: 'preflop',
    dealer: 5,
    board: [],
    deck: [],
    currentBet: 0,
    minRaise: BB,
    toAct: null,
    winners: [],
    revealed: false,
    lastPot: 0,
    thinkEndsAt: 0,
    actionLog: [],
    timeline: [],
    tlSeq: 0,
    agentModel: '',
    log: ['Click Start to sit with five agents.'],
  }
  const players = [createPlayer({ id: 'hero', name: 'you', emoji: '🧑', kind: 'human', tag: 'Hero' }, 0)]
  for (let i = 0; i < BOTS.length; i++) {
    players.push(createPlayer(Object.assign({ kind: 'ai' }, BOTS[i]), i + 1))
  }
  const avatarDir = avatarDataDir()
  const overrides = loadOverrides(avatarDir)
  const bundled = loadBundled()

  let aiTimer = null
  let aiSeq = 0

  function log(text) {
    state.log = state.log.concat([text]).slice(-10)
  }

  function record(entry) {
    state.tlSeq = (state.tlSeq || 0) + 1
    state.timeline = (state.timeline || []).concat([{
      id: state.tlSeq,
      at: Date.now(),
      handNo: state.handNo,
      street: entry.street || state.street || '',
      kind: entry.kind || 'action',
      name: entry.name || '',
      emoji: entry.emoji || '',
      playerId: entry.playerId || '',
      action: entry.action || '',
      talk: entry.talk || '',
    }]).slice(-160)
  }

  function clearAi() {
    aiSeq += 1
    if (aiTimer) {
      aiTimer()
      aiTimer = null
    }
  }

  function pot() {
    let n = 0
    for (let i = 0; i < players.length; i++) n += players[i].committed
    return n
  }

  function live() {
    return players.filter(function (p) { return !p.folded })
  }

  function canAct(p) {
    return !p.folded && !p.allIn && p.stack >= 0
  }

  // Seat numbers increase to the right on the felt (hero at bottom), so
  // clockwise play — dealer's left — is decreasing seat index.
  function cw(from, steps) {
    const n = players.length
    const k = steps == null ? 1 : steps
    return (from - k % n + n) % n
  }

  function nextIndex(from) {
    for (let i = 1; i <= players.length; i++) {
      const p = players[cw(from, i)]
      if (!p.folded && !p.allIn) return p.seat
    }
    return null
  }

  function put(p, amount) {
    const n = Math.max(0, Math.min(amount, p.stack))
    p.stack -= n
    p.bet += n
    p.committed += n
    if (p.stack === 0) p.allIn = true
    return n
  }

  function resetStreetFlags() {
    for (let i = 0; i < players.length; i++) {
      players[i].bet = 0
      players[i].acted = false
      if (!players[i].folded && players[i].stack === 0) players[i].allIn = true
    }
    state.currentBet = 0
    state.minRaise = BB
  }

  function legalFor(p) {
    if (!p || state.status !== 'playing' || state.toAct !== p.seat) {
      return { fold: false, check: false, call: false, callAmount: 0, raise: false, minRaiseTo: 0, maxRaiseTo: 0, toCall: 0 }
    }
    const toCall = Math.max(0, state.currentBet - p.bet)
    const maxRaiseTo = p.bet + p.stack
    const minRaiseTo = state.currentBet === 0 ? Math.max(BB, state.minRaise) : state.currentBet + state.minRaise
    return {
      fold: true,
      check: toCall === 0,
      call: toCall > 0,
      callAmount: Math.min(toCall, p.stack),
      raise: p.stack > toCall,
      minRaiseTo: Math.min(minRaiseTo, maxRaiseTo),
      maxRaiseTo: maxRaiseTo,
      toCall: toCall,
    }
  }

  function snapshot() {
    const hero = players[0]
    const legal = legalFor(state.toAct == null ? null : players[state.toAct])
    return {
      status: state.status,
      handNo: state.handNo,
      street: state.street,
      dealer: state.dealer,
      sb: SB,
      bb: BB,
      pot: pot(),
      lastPot: state.lastPot,
      board: state.board.slice(),
      toAct: state.toAct,
      currentBet: state.currentBet,
      minRaise: state.minRaise,
      winners: state.winners,
      revealed: state.revealed,
      thinkEndsAt: state.thinkEndsAt || 0,
      agentModel: state.agentModel || '',
      log: state.log.slice(),
      timeline: (state.timeline || []).slice(),
      legal: legal,
      heroHand: hero.cards.length >= 5 || state.board.length >= 3
        ? evalBest(hero.cards.concat(state.board)).name
        : (hero.cards.length === 2 ? '底牌' : ''),
      players: players.map(function (p) {
        const show = p.kind === 'human' || state.revealed
        return {
          id: p.id,
          name: p.name,
          emoji: p.emoji,
          brand: p.brand || '',
          company: p.company || '',
          kind: p.kind,
          tag: p.tag,
          seat: p.seat,
          stack: p.stack,
          bet: p.bet,
          committed: p.committed,
          folded: p.folded,
          allIn: p.allIn,
          isDealer: p.seat === state.dealer,
          isSb: p.seat === cw(state.dealer, 1),
          isBb: p.seat === cw(state.dealer, 2),
          isToAct: state.toAct === p.seat && state.status === 'playing',
          lastAction: p.lastAction,
          lastThought: '',
          talk: p.talk || '',
          avatar: avatarView(p.id, overrides, bundled),
          hasCards: p.cards.length === 2,
          cards: show ? p.cards.slice() : [],
          handName: show && p.cards.length === 2 && (state.revealed || p.kind === 'human') && state.board.length >= 3
            ? evalBest(p.cards.concat(state.board)).name
            : '',
        }
      }),
    }
  }

  function findNextActor(from) {
    for (let i = 1; i <= players.length; i++) {
      const p = players[cw(from, i)]
      if (!p.folded && !p.allIn && (!p.acted || p.bet < state.currentBet)) return p.seat
    }
    return null
  }

  function streetClosed() {
    const alive = live()
    if (alive.length <= 1) return true
    const actors = alive.filter(function (p) { return !p.allIn })
    if (actors.length === 0) return true
    if (actors.length === 1 && actors[0].bet >= state.currentBet) return true
    return actors.every(function (p) { return p.acted && p.bet === state.currentBet })
  }

  function seatOrder(seat) {
    // Odd chips go first to the player immediately clockwise of the button.
    return (state.dealer - seat - 1 + players.length) % players.length
  }

  function finishFoldWin() {
    const winner = live()[0]
    const amount = pot()
    winner.stack += amount
    state.lastPot = amount
    state.winners = [{ seats: [winner.seat], names: [winner.name], amount: amount, handName: '无人跟注' }]
    for (let i = 0; i < players.length; i++) players[i].committed = 0
    state.status = 'hand-over'
    state.toAct = null
    state.revealed = false
    log(winner.name + ' 收走底池 ' + amount)
    record({ kind: 'result', name: winner.name, emoji: winner.emoji, playerId: winner.id, action: '收走底池 ' + amount, street: state.street })
  }

  function showdown() {
    state.revealed = true
    state.status = 'showdown'
    state.toAct = null
    const pots = makePots(players)
    const results = []
    for (let i = 0; i < pots.length; i++) {
      const potItem = pots[i]
      const scored = potItem.eligible.map(function (p) {
        return { p: p, ev: evalBest(p.cards.concat(state.board)) }
      })
      let best = -1
      for (let j = 0; j < scored.length; j++) if (scored[j].ev.score > best) best = scored[j].ev.score
      const winners = scored.filter(function (s) { return s.ev.score === best })
      winners.sort(function (a, b) { return seatOrder(a.p.seat) - seatOrder(b.p.seat) })
      const share = Math.floor(potItem.amount / winners.length)
      let rem = potItem.amount - share * winners.length
      for (let j = 0; j < winners.length; j++) {
        winners[j].p.stack += share + (rem > 0 ? 1 : 0)
        if (rem > 0) rem--
      }
      results.push({
        seats: winners.map(function (w) { return w.p.seat }),
        names: winners.map(function (w) { return w.p.name }),
        amount: potItem.amount,
        handName: winners[0].ev.name,
      })
      log(winners.map(function (w) { return w.p.name }).join('、') + ' 以' + winners[0].ev.name + ' 赢下 ' + potItem.amount)
      record({
        kind: 'result',
        name: winners.map(function (w) { return w.p.name }).join('、'),
        emoji: winners[0].p.emoji,
        playerId: winners[0].p.id,
        action: winners[0].ev.name + ' · ' + potItem.amount,
        street: 'showdown',
      })
    }
    state.winners = results
    state.lastPot = results.reduce(function (s, r) { return s + r.amount }, 0)
    for (let i = 0; i < players.length; i++) players[i].committed = 0
    state.status = 'hand-over'
  }

  function dealStreet() {
    if (state.street === 'preflop') {
      state.deck.pop()
      state.board = [state.deck.pop(), state.deck.pop(), state.deck.pop()]
      state.street = 'flop'
      log('翻牌')
      record({ kind: 'street', action: '翻牌', street: 'flop' })
    } else if (state.street === 'flop') {
      state.deck.pop()
      state.board.push(state.deck.pop())
      state.street = 'turn'
      log('转牌')
      record({ kind: 'street', action: '转牌', street: 'turn' })
    } else if (state.street === 'turn') {
      state.deck.pop()
      state.board.push(state.deck.pop())
      state.street = 'river'
      log('河牌')
      record({ kind: 'street', action: '河牌', street: 'river' })
    } else {
      showdown()
      return
    }
    resetStreetFlags()
    if (maybeRunout()) return
    state.toAct = findNextActor(state.dealer)
    if (state.toAct == null) {
      if (state.street === 'river') showdown()
      else dealStreet()
    }
  }

  function maybeRunout() {
    const alive = live()
    if (alive.length <= 1) return false
    const actors = alive.filter(function (p) { return !p.allIn })
    if (actors.length === 0 || (actors.length === 1 && actors[0].bet >= state.currentBet)) {
      while (state.street !== 'river' && state.status === 'playing') {
        if (state.street === 'preflop') {
          state.deck.pop()
          state.board = [state.deck.pop(), state.deck.pop(), state.deck.pop()]
          state.street = 'flop'
        } else if (state.street === 'flop') {
          state.deck.pop()
          state.board.push(state.deck.pop())
          state.street = 'turn'
        } else if (state.street === 'turn') {
          state.deck.pop()
          state.board.push(state.deck.pop())
          state.street = 'river'
        }
      }
      if (state.status === 'playing') showdown()
      return true
    }
    return false
  }

  function afterAction() {
    if (live().length <= 1) {
      finishFoldWin()
      return
    }
    if (streetClosed()) {
      if (state.street === 'river') showdown()
      else dealStreet()
      return
    }
    if (state.toAct == null) return
    state.toAct = findNextActor(state.toAct)
    if (state.toAct == null) {
      if (state.street === 'river') showdown()
      else dealStreet()
    }
  }

  function applyAction(p, type, amount) {
    const toCall = Math.max(0, state.currentBet - p.bet)
    if (type === 'fold') {
      if (toCall === 0) type = 'check'
      else {
        p.folded = true
        p.acted = true
        p.lastAction = '弃牌'
        log(p.name + ' 弃牌')
        return
      }
    }
    if (type === 'check') {
      if (toCall > 0) {
        applyAction(p, 'call', 0)
        return
      }
      p.acted = true
      p.lastAction = '过牌'
      log(p.name + ' 过牌')
      return
    }
    if (type === 'call') {
      if (toCall === 0) {
        applyAction(p, 'check', 0)
        return
      }
      const paid = put(p, toCall)
      p.acted = true
      p.lastAction = p.allIn ? '全下 ' + paid : '跟注 ' + paid
      log(p.name + ' ' + p.lastAction)
      return
    }
    if (type === 'allin') {
      const target = p.bet + p.stack
      applyAction(p, 'raise', target)
      return
    }
    if (type === 'raise' || type === 'bet') {
      let target = typeof amount === 'number' ? Math.floor(amount) : 0
      const maxTo = p.bet + p.stack
      if (target <= 0) target = state.currentBet === 0 ? BB : state.currentBet + state.minRaise
      if (target > maxTo) target = maxTo
      if (target <= p.bet) {
        applyAction(p, toCall > 0 ? 'call' : 'check', 0)
        return
      }
      if (target < state.currentBet) {
        applyAction(p, 'call', 0)
        return
      }
      const need = target - p.bet
      const raiseBy = target - state.currentBet
      put(p, need)
      const isRaise = target > state.currentBet
      if (isRaise) {
        if (raiseBy >= state.minRaise || p.allIn) {
          if (raiseBy >= state.minRaise) state.minRaise = raiseBy
          for (let i = 0; i < players.length; i++) {
            if (players[i] !== p && !players[i].folded && !players[i].allIn) players[i].acted = false
          }
        }
        state.currentBet = p.bet
      }
      p.acted = true
      if (p.allIn) p.lastAction = '全下 ' + p.bet
      else if (state.currentBet === p.bet && raiseBy > 0 && toCall === 0) p.lastAction = '下注 ' + p.bet
      else p.lastAction = '加注至 ' + p.bet
      log(p.name + ' ' + p.lastAction)
    }
  }

  function decideAi(p) {
    const toCall = Math.max(0, state.currentBet - p.bet)
    const hs = strength(p.cards, state.board) + p.loose
    const potNow = pot()
    const odds = toCall === 0 ? 0 : toCall / (potNow + toCall)
    const roll = Math.random()
    if (toCall === 0) {
      if (hs > 0.62 && roll < p.agg) {
        const size = Math.floor(potNow * (0.5 + p.agg * 0.4))
        return { type: 'raise', amount: Math.max(BB, p.bet + size) }
      }
      if (hs > 0.5 && roll < p.bluff * 1.4) {
        return { type: 'raise', amount: p.bet + Math.max(BB, Math.floor(potNow * 0.66)) }
      }
      return { type: 'check' }
    }
    if (hs + 0.08 < odds && toCall > p.stack * 0.12 && roll > p.bluff) return { type: 'fold' }
    if (hs > 0.7 && roll < p.agg) {
      const size = Math.floor((potNow + toCall) * (0.6 + p.agg * 0.5))
      return { type: 'raise', amount: state.currentBet + Math.max(state.minRaise, size) }
    }
    if (hs > 0.55 && roll < p.bluff + 0.15) {
      return { type: 'raise', amount: state.currentBet + Math.max(state.minRaise, Math.floor((potNow + toCall) * 0.75)) }
    }
    if (toCall >= p.stack) return { type: 'call' }
    if (hs + p.loose * 0.5 >= odds - 0.08) return { type: 'call' }
    if (toCall <= BB && hs > 0.28) return { type: 'call' }
    return { type: 'fold' }
  }

  function normalizeChoice(raw, legal, fallback) {
    const type = raw && typeof raw.type === 'string' ? raw.type.toLowerCase() : ''
    const talk = sanitizeTalk(raw && raw.talk)
    if (type === 'check' && legal.check) return { type: 'check', talk: talk }
    if (type === 'fold' && legal.fold) return { type: legal.toCall > 0 ? 'fold' : 'check', talk: talk }
    if (type === 'call' && legal.call) return { type: 'call', talk: talk }
    if (type === 'call' && legal.check) return { type: 'check', talk: talk }
    if ((type === 'raise' || type === 'bet' || type === 'allin') && legal.raise) {
      let amount = typeof raw.amount === 'number' ? Math.floor(raw.amount) : legal.minRaiseTo
      if (!(amount > 0)) amount = legal.minRaiseTo
      if (amount < legal.minRaiseTo) amount = legal.minRaiseTo
      if (amount > legal.maxRaiseTo) amount = legal.maxRaiseTo
      return { type: 'raise', amount: amount, talk: talk }
    }
    return fallback
  }

  function describeLegal(legal) {
    const parts = []
    if (legal.fold && legal.toCall > 0) parts.push('fold')
    if (legal.check) parts.push('check')
    if (legal.call) parts.push('call ' + legal.callAmount + ' more tokens')
    if (legal.raise) parts.push('raise to ' + legal.minRaiseTo + '–' + legal.maxRaiseTo + ' tokens (raise-to total, not increment)')
    return parts.join('; ')
  }

  function buildPrompt(p, legal) {
    const others = players.map(function (o) {
      return '- seat ' + o.seat + ' ' + o.name + (o.seat === p.seat ? ' (you)' : '') +
        ': stack ' + o.stack + ', bet ' + o.bet +
        (o.folded ? ', folded' : '') +
        (o.allIn ? ', all-in' : '') +
        (o.lastAction ? ', last ' + o.lastAction : '')
    }).join('\n')
    const history = (state.actionLog || []).length ? (state.actionLog || []).join('\n') : '(no actions yet this hand)'
    return [
      'Hand #' + state.handNo + ' · ' + state.street + ' · pot ' + pot() + ' tokens · current bet ' + state.currentBet,
      'Blinds ' + SB + '/' + BB + '.',
      'Your hole cards: ' + p.cards.map(cardTxt).join(' '),
      'Board: ' + (state.board.length ? state.board.map(cardTxt).join(' ') : '(none)'),
      'Players:\n' + others,
      'Action so far:\n' + history,
      'Legal actions: ' + describeLegal(legal),
      '选择一个合法动作。talk 必须是简体中文闲话，最多十六个字。禁止在 talk 里提到底牌、花色、点数或任何推理。',
    ].join('\n\n')
  }

  function askAgent(p) {
    const legal = legalFor(p)
    const fallback = decideAi(p)
    const llm = ctx.get('llm')
    const models = ctx.get('agentDefaultModel')
    if (llm === undefined || models === undefined) {
      state.agentModel = 'heuristic'
      return Promise.resolve(fallback)
    }
    const sel = models.currentSelection()
    if (!sel || !sel.provider || !sel.model) {
      state.agentModel = 'heuristic'
      return Promise.resolve(fallback)
    }
    state.agentModel = sel.provider + '/' + sel.model
    const system = [
      '你是德州扑克牌桌上的玩家「' + p.name + '」' + (p.company ? ('（' + p.company + '）') : '') + '。',
      '风格：' + (p.style || p.tag || '均衡'),
      '你只能看见自己的底牌。筹码单位是 tokens。',
      '用 holdem_act 做出一个合法动作。amount 是加注到的总额。',
      'talk 可选，必须是简体中文桌边闲话，最多十六个字，符合人设。',
      '绝对不要在 talk 里提到底牌、花色、点数、听牌、成牌、胜率或任何推理过程。',
    ].join('')
    const options = {
      provider: sel.provider,
      model: sel.model,
      system: system,
      messages: [{
        id: 'hk-' + p.id + '-' + state.handNo + '-' + Date.now(),
        role: 'user',
        content: [{ type: 'text', text: buildPrompt(p, legal) }],
        source: { kind: 'plugin', plugin: 'holdem' },
      }],
      tools: [ACT_TOOL],
      temperature: 0.7,
      maxTokens: 700,
    }
    if (sel.reasoningEffort) options.reasoningEffort = sel.reasoningEffort

    return (async function () {
      let text = ''
      let toolArgs = ''
      for await (const chunk of llm.stream(options)) {
        if (chunk.type === 'text-delta' && chunk.text) {
          text += chunk.text
        } else if (chunk.type === 'tool-call-delta' && chunk.argumentsDelta) {
          toolArgs += chunk.argumentsDelta
        } else if (chunk.type === 'block-end' && chunk.block && chunk.block.type === 'tool-call') {
          toolArgs = chunk.block.arguments || toolArgs
        } else if (chunk.type === 'finish' && chunk.reason && (chunk.reason.kind === 'error' || chunk.reason.kind === 'aborted')) {
          const msg = chunk.reason.failure && chunk.reason.failure.message
          throw new Error(msg || 'llm finish ' + chunk.reason.kind)
        }
      }
      const parsed = parseJsonObject(toolArgs) || parseJsonObject(text)
      return normalizeChoice(parsed, legal, fallback)
    })()
  }

  function commitAi(p, choice) {
    applyAction(p, choice.type, choice.amount)
    if (choice.talk) p.talk = choice.talk
    state.actionLog = (state.actionLog || []).concat([state.street + ': ' + p.name + ' ' + p.lastAction]).slice(-16)
    record({ kind: 'action', name: p.name, emoji: p.emoji, playerId: p.id, action: p.lastAction, talk: p.talk || '' })
    afterAction()
    scheduleAi()
  }

  function runAi(seq, seat, handNo) {
    if (seq !== aiSeq) return
    const p = players[seat]
    if (!p || p.kind !== 'ai' || state.status !== 'playing' || state.toAct !== seat || state.handNo !== handNo) return
    askAgent(p).then(function (choice) {
      if (seq !== aiSeq) return
      if (state.status !== 'playing' || state.toAct !== seat || state.handNo !== handNo) return
      commitAi(p, choice)
    }).catch(function (err) {
      console.error(err)
      if (seq !== aiSeq) return
      if (state.status !== 'playing' || state.toAct !== seat || state.handNo !== handNo) return
      commitAi(p, decideAi(p))
    })
  }

  function scheduleAi() {
    clearAi()
    state.thinkEndsAt = 0
    if (state.status !== 'playing' || state.toAct == null) return
    const p = players[state.toAct]
    if (!p || p.kind !== 'ai') return
    const seq = aiSeq
    const seat = p.seat
    const handNo = state.handNo
    p.lastThought = ''
    p.talk = ''
    state.thinkEndsAt = Date.now() + 45000
    aiTimer = ctx.timeout(function () {
      aiTimer = null
      runAi(seq, seat, handNo)
    }, 40)
  }

  function dealHand() {
    clearAi()
    for (let i = 0; i < players.length; i++) {
      const p = players[i]
      if (p.stack <= 0) {
        p.stack = START_STACK
        log(p.name + ' 重新买入 ' + START_STACK)
      }
      p.bet = 0
      p.committed = 0
      p.folded = false
      p.allIn = false
      p.acted = false
      p.cards = []
      p.lastAction = ''
      p.lastThought = ''
      p.talk = ''
    }
    state.handNo += 1
    state.dealer = cw(state.dealer)
    state.deck = shuffle(makeDeck())
    state.board = []
    state.street = 'preflop'
    state.winners = []
    state.revealed = false
    state.status = 'playing'
    state.lastPot = 0
    state.actionLog = []
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < players.length; i++) {
        players[cw(state.dealer, 1 + i)].cards.push(state.deck.pop())
      }
    }
    const sbSeat = cw(state.dealer, 1)
    const bbSeat = cw(state.dealer, 2)
    put(players[sbSeat], SB)
    players[sbSeat].lastAction = '小盲 ' + players[sbSeat].bet
    put(players[bbSeat], BB)
    players[bbSeat].lastAction = '大盲 ' + players[bbSeat].bet
    state.currentBet = players[bbSeat].bet
    state.minRaise = BB
    log('第 ' + state.handNo + ' 手 · ' + players[state.dealer].name + ' 坐庄')
    record({ kind: 'street', action: '第 ' + state.handNo + ' 手', street: 'preflop', name: players[state.dealer].name, emoji: players[state.dealer].emoji, playerId: players[state.dealer].id })
    record({ kind: 'action', name: players[sbSeat].name, emoji: players[sbSeat].emoji, playerId: players[sbSeat].id, action: players[sbSeat].lastAction, street: 'preflop' })
    record({ kind: 'action', name: players[bbSeat].name, emoji: players[bbSeat].emoji, playerId: players[bbSeat].id, action: players[bbSeat].lastAction, street: 'preflop' })
    state.toAct = findNextActor(bbSeat)
    if (state.toAct == null) {
      maybeRunout()
      return
    }
    scheduleAi()
  }

  function start() {
    state.handNo = 0
    state.dealer = Math.floor(Math.random() * players.length)
    for (let i = 0; i < players.length; i++) players[i].stack = START_STACK
    state.log = []
    log('新牌桌：盲注 ' + SB + '/' + BB + '，记分牌 ' + START_STACK)
    dealHand()
    return snapshot()
  }

  function nextHand() {
    if (state.status === 'idle') return start()
    if (state.status === 'playing') return snapshot()
    dealHand()
    return snapshot()
  }

  function reset() {
    clearAi()
    state.status = 'idle'
    state.handNo = 0
    state.board = []
    state.toAct = null
    state.winners = []
    state.revealed = false
    for (let i = 0; i < players.length; i++) {
      players[i].stack = START_STACK
      players[i].bet = 0
      players[i].committed = 0
      players[i].folded = false
      players[i].allIn = false
      players[i].cards = []
      players[i].lastAction = ''
    }
    state.log = ['牌桌已重置。点击「开始对局」。']
    state.timeline = []
    state.actionLog = []
    return snapshot()
  }

  function act(args) {
    const type = args && typeof args.type === 'string' ? args.type : ''
    if (state.status !== 'playing' || state.toAct !== 0) return snapshot()
    const p = players[0]
    applyAction(p, type, args && args.amount)
    state.actionLog = (state.actionLog || []).concat([state.street + ': you ' + p.lastAction]).slice(-16)
    record({ kind: 'action', name: 'you', emoji: p.emoji, playerId: p.id, action: p.lastAction })
    afterAction()
    scheduleAi()
    return snapshot()
  }

  function setAvatar(args) {
    const id = args && args.id
    if (!isPlayerId(id)) throw new Error('unknown player')
    const decoded = decodeAvatar(args)
    if (!decoded) throw new Error('invalid image')
    overrides[id] = writeOverride(avatarDir, id, decoded)
    return snapshot()
  }

  function clearAvatar(args) {
    const id = args && args.id
    if (!isPlayerId(id)) throw new Error('unknown player')
    removeOverride(avatarDir, id)
    delete overrides[id]
    return snapshot()
  }

  function avatarFile(id) {
    if (overrides[id]) return overrides[id]
    return bundled[id] || null
  }

  ctx.effect(function () {
    return function () { clearAi() }
  })

  return {
    snapshot: snapshot,
    start: start,
    nextHand: nextHand,
    reset: reset,
    act: act,
    setAvatar: setAvatar,
    clearAvatar: clearAvatar,
    avatarFile: avatarFile,
  }
}

function readJson(req) {
  return new Promise(function (resolve, reject) {
    const chunks = []
    req.on('data', function (chunk) { chunks.push(chunk) })
    req.on('end', function () {
      try {
        const raw = Buffer.concat(chunks).toString('utf8').trim()
        resolve(raw ? JSON.parse(raw) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, body) {
  const data = Buffer.from(JSON.stringify(body))
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': String(data.length),
    'cache-control': 'no-store',
  })
  res.end(data)
}

function sendBytes(res, mime, bytes) {
  res.writeHead(200, {
    'content-type': mime || 'application/octet-stream',
    'content-length': String(bytes.length),
    'cache-control': 'no-store',
  })
  res.end(bytes)
}

function methodFromUrl(url) {
  const path = String(url || '').split('?')[0]
  const rest = path.replace(/^\/dsh-holdem\/?/, '')
  return rest || 'get-state'
}

export const name = 'dsh-holdem'
export const inject = ['timer', 'webServer']

export function apply(ctx) {
  const table = createTable(ctx)
  ctx.effect(function () {
    return ctx.webServer.register({
      kind: 'prefix',
      path: '/dsh-holdem',
      handler: async function (req, res) {
        const method = methodFromUrl(req.url)
        try {
          if (req.method === 'GET' && method.indexOf('avatar/') === 0) {
            const id = decodeURIComponent(method.slice('avatar/'.length).split('/')[0])
            const file = table.avatarFile(id)
            if (!file) {
              sendJson(res, 404, { error: 'no override' })
              return
            }
            sendBytes(res, file.mime, file.bytes)
            return
          }
          if (req.method === 'GET' || method === 'get-state') {
            sendJson(res, 200, table.snapshot())
            return
          }
          if (req.method !== 'POST') {
            sendJson(res, 405, { error: 'method not allowed' })
            return
          }
          const args = await readJson(req)
          if (method === 'start') sendJson(res, 200, table.start())
          else if (method === 'act') sendJson(res, 200, table.act(args || {}))
          else if (method === 'next-hand') sendJson(res, 200, table.nextHand())
          else if (method === 'reset') sendJson(res, 200, table.reset())
          else if (method === 'set-avatar') sendJson(res, 200, table.setAvatar(args || {}))
          else if (method === 'clear-avatar') sendJson(res, 200, table.clearAvatar(args || {}))
          else sendJson(res, 404, { error: 'unknown method' })
        } catch (err) {
          const msg = String((err && err.message) || err)
          const code = /unknown player|invalid image/.test(msg) ? 400 : 500
          sendJson(res, code, { error: msg })
        }
      },
    })
  })
}
