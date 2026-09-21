// Safe table-talk helpers. They deliberately allow bluffing about intent or confidence
// while keeping private cards, exact hand information, and reasoning out of the log.
export const TALK_MAX_LENGTH = 16

const NEUTRAL_TALKS = {
  blind: ['按规矩来。', '先交个盲注。', '轮到我了。', '没什么好说的。'],
  fold: ['这手先不玩。', '我先让一手。', '没什么好说的。', '先看你们争。'],
  check: ['先看看。', '不急。', '没什么好说的。', '我先过。'],
  call: ['先跟着看。', '这点代价可以。', '再看一张。', '没什么好说的。'],
  raise: ['给点压力。', '继续。', '我来加速。', '先把池子做大。'],
}

const BLUFF_TALKS = {
  blind: ['这点盲注不算什么。', '先给你们一点机会。', '别把盲注当信号。'],
  fold: ['差一点就跟了。', '我只是换个节奏。', '别以为我怕了。'],
  check: ['我等你们犯错。', '你们可以继续猜。', '我很有耐心。'],
  call: ['我只是陪你们玩。', '这点压力不够。', '还没到认真时候。'],
  raise: ['这点压力不够。', '别把我当空气。', '我可不是在试探。', '这局我说了算。'],
}

const FORBIDDEN_TALK = /(底牌|手牌|洞牌|对子|同花|顺子|葫芦|四条|皇家|听牌|成牌|牌力|胜率|赔率|范围|range|odds|equity|[♠♥♦♣]|黑桃|红心|红桃|方块|梅花|[AKQJT2-9][shdc])/i

function actionKey(action) {
  if (action === 'bet' || action === 'allin') return 'raise'
  return NEUTRAL_TALKS[action] ? action : 'check'
}

function clamp01(n) {
  return Math.max(0, Math.min(1, Number(n) || 0))
}

export function sanitizeTalk(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const talk = raw.replace(/\s+/g, '').trim()
  if (!talk) return ''
  if (/[A-Za-z]{3,}/.test(talk)) return ''
  if (FORBIDDEN_TALK.test(talk)) return ''
  return Array.from(talk).slice(0, TALK_MAX_LENGTH).join('')
}

export function fallbackTalk(player, action, random = Math.random, recent = []) {
  const key = actionKey(action)
  const useBluff = random() < clamp01(player && player.bluff)
  const pool = useBluff ? BLUFF_TALKS[key] : NEUTRAL_TALKS[key]
  const previous = Array.isArray(recent) ? recent[recent.length - 1] : ''
  const choices = pool.filter(function (line) { return line !== previous })
  const list = choices.length ? choices : pool
  const line = list[Math.floor(random() * list.length)] || NEUTRAL_TALKS.check[0]
  return sanitizeTalk(line) || '没什么好说的。'
}
