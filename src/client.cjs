const React = require('react')
const h = React.createElement

const API = '/dsh-holdem'

function rpc(method, args) {
  const isGet = method === 'get-state'
  return fetch(API + '/' + method, {
    method: isGet ? 'GET' : 'POST',
    headers: isGet ? undefined : { 'content-type': 'application/json' },
    body: isGet ? undefined : JSON.stringify(args || {}),
  }).then(function (res) {
    return res.json().then(function (body) {
      if (!res.ok) throw new Error((body && body.error) || ('holdem ' + res.status))
      return body
    })
  })
}

const CSS = require('./client-css.cjs')
const { fmt, formatWinnerLines } = require('./format.js')
const { raisePresets } = require('./bets.js')
const { paintIdenticon } = require('./identicon.js')

const SUIT = { s: '♠', h: '♥', d: '♦', c: '♣' }
const RANK = { 14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: '10', 9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2' }
const STREET = { idle: '大厅', preflop: '翻前', flop: '翻牌', turn: '转牌', river: '河牌', showdown: '摊牌', 'hand-over': '本手结束' }

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n))
}

const TABLE_ASPECT = 2.15

function seatPos(seat) {
  const rx = 50 / TABLE_ASPECT
  // Hero at bottom; numbers increase toward the right. Clockwise action is
  // the other way (see cw() in host.js).
  if (seat === 0) return { left: '50%', top: '100%', transform: 'translate(-50%, -50%)' }
  if (seat === 3) return { left: '50%', top: '0%', transform: 'translate(-50%, -50%)' }
  const spec = {
    1: { cx: 100 - rx, ang: 38 },
    2: { cx: 100 - rx, ang: -38 },
    4: { cx: rx, ang: 218 },
    5: { cx: rx, ang: 142 },
  }[seat]
  const rad = (spec.ang * Math.PI) / 180
  return {
    left: (spec.cx + rx * Math.cos(rad)) + '%',
    top: (50 + 50 * Math.sin(rad)) + '%',
    transform: 'translate(-50%, -50%)',
  }
}

function seatIsTop(seat) {
  return seat === 2 || seat === 3 || seat === 4
}

function Identicon(props) {
  const seed = props.seed || ''
  const ref = React.useRef(null)
  React.useEffect(function () {
    paintIdenticon(ref.current, seed)
  }, [seed])
  return h('canvas', {
    ref: ref,
    className: 'hk-identicon',
    width: 32,
    height: 32,
    'aria-hidden': 'true',
  })
}

function PlayerMark(props) {
  const p = props.player || {}
  const avatar = p.avatar || {}
  if (avatar.src) {
    return h('img', { className: 'hk-avatar-img', src: avatar.src, alt: '' })
  }
  return h(Identicon, { seed: avatar.seed || p.id || '' })
}

function playerLabel(p) {
  if (!p) return ''
  return p.id === 'hero' ? 'you' : (p.name || p.id)
}

function TimelineBody(props) {
  const items = props.items || []
  const byId = props.byId || {}
  const ref = React.useRef(null)
  React.useEffect(function () {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [items.length])

  const nodes = []
  let lastHand = null
  for (let i = 0; i < items.length; i++) {
    const ev = items[i]
    if (ev.handNo && ev.handNo !== lastHand) {
      lastHand = ev.handNo
      nodes.push(h('div', { key: 'h' + ev.id, className: 'hk-tl-hand' }, '第 ' + ev.handNo + ' 手'))
    }
    if (ev.kind === 'street') {
      nodes.push(h('div', { key: ev.id, className: 'hk-tl-street' }, ev.action || ev.street))
      continue
    }
    const markPlayer = (ev.playerId && byId[ev.playerId]) || (ev.playerId
      ? { id: ev.playerId, avatar: { kind: 'identicon', seed: ev.playerId } }
      : null)
    nodes.push(h('div', { key: ev.id, className: 'hk-tl-row' },
      h('div', { className: 'hk-tl-ico' },
        markPlayer ? h(PlayerMark, { player: markPlayer }) : (ev.emoji || '•'),
      ),
      h('div', { className: 'hk-tl-main' },
        h('div', { className: 'hk-tl-name' }, ev.name || '牌桌'),
        ev.action ? h('div', { className: 'hk-tl-act' }, ev.action) : null,
        ev.talk ? h('div', { className: 'hk-tl-talk' }, ev.talk) : null,
      ),
    ))
  }

  return h('div', { className: 'hk-tl', ref: ref },
    nodes.length ? nodes : h('div', { className: 'hk-tl-empty' }, '开始一手牌后，行动和闲话会出现在这里。'),
  )
}

function AvatarRow(props) {
  const p = props.player
  const inputRef = React.useRef(null)
  const override = !!(p.avatar && p.avatar.kind === 'override')
  return h('div', { className: 'hk-av-row' },
    h('div', { className: 'hk-avatar' }, h(PlayerMark, { player: p })),
    h('div', { className: 'hk-av-name' }, playerLabel(p)),
    h('input', {
      ref: inputRef,
      type: 'file',
      accept: 'image/png,image/jpeg,image/webp',
      className: 'hk-av-file',
      onChange: function (e) {
        const file = e.target.files && e.target.files[0]
        e.target.value = ''
        if (file) props.onSetAvatar(p.id, file)
      },
    }),
    h('button', {
      type: 'button',
      className: 'hk-chipbtn',
      disabled: props.busy,
      onClick: function () { if (inputRef.current) inputRef.current.click() },
    }, '更换'),
    h('button', {
      type: 'button',
      className: 'hk-chipbtn',
      disabled: props.busy || !override,
      onClick: function () { props.onClearAvatar(p.id) },
    }, '恢复默认'),
  )
}

function Rail(props) {
  const [tab, setTab] = React.useState('timeline')
  const players = props.players || []
  const byId = {}
  for (let i = 0; i < players.length; i++) byId[players[i].id] = players[i]
  return h('aside', { className: 'hk-rail' },
    h('div', { className: 'hk-rail-tabs' },
      h('button', {
        type: 'button',
        className: 'hk-rail-tab' + (tab === 'timeline' ? ' on' : ''),
        onClick: function () { setTab('timeline') },
      }, '时间线'),
      h('button', {
        type: 'button',
        className: 'hk-rail-tab' + (tab === 'avatar' ? ' on' : ''),
        onClick: function () { setTab('avatar') },
      }, '头像'),
    ),
    tab === 'timeline'
      ? [
          h('div', { key: 'sub', className: 'hk-rail-sub' }, '行动与桌边闲话'),
          h(TimelineBody, { key: 'tl', items: props.items, byId: byId }),
        ]
      : [
          h('div', { key: 'sub', className: 'hk-rail-sub' }, '上传图片覆盖默认头像'),
          h('div', { key: 'list', className: 'hk-av-list' },
            players.map(function (p) {
              return h(AvatarRow, {
                key: p.id,
                player: p,
                busy: props.busy,
                onSetAvatar: props.onSetAvatar,
                onClearAvatar: props.onClearAvatar,
              })
            }),
          ),
        ],
  )
}

const BRAND = {
  openai: { bg: '#10a37f', fg: '#fff' },
  anthropic: { bg: '#D97757', fg: '#fff' },
  xai: { bg: '#111111', fg: '#fff' },
  deepseek: { bg: '#4d6bfe', fg: '#fff' },
  nvidia: { bg: '#74b71b', fg: '#fff' },
  hero: { bg: '#3b82f6', fg: '#fff' },
}

const LOBE_ICON = {
  openai: 'M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z',
  anthropic: 'M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z',
  xai: 'M6.469 8.776L16.512 23h-4.464L2.005 8.776H6.47zm-.004 7.9l2.233 3.164L6.467 23H2l4.465-6.324zM22 2.582V23h-3.659V7.764L22 2.582zM22 1l-9.952 14.095-2.233-3.163L17.533 1H22z',
  deepseek: 'M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z',
  nvidia: 'M10.212 8.976V7.62c.127-.01.256-.017.388-.021 3.596-.117 5.957 3.184 5.957 3.184s-2.548 3.647-5.282 3.647a3.227 3.227 0 01-1.063-.175v-4.109c1.4.174 1.681.812 2.523 2.258l1.873-1.627a4.905 4.905 0 00-3.67-1.846 6.594 6.594 0 00-.729.044m0-4.476v2.025c.13-.01.259-.019.388-.024 5.002-.174 8.261 4.226 8.261 4.226s-3.743 4.69-7.643 4.69c-.338 0-.675-.031-1.007-.092v1.25c.278.038.558.057.838.057 3.629 0 6.253-1.91 8.794-4.169.421.347 2.146 1.193 2.501 1.564-2.416 2.083-8.048 3.763-11.24 3.763-.308 0-.603-.02-.894-.048V19.5H24v-15H10.21zm0 9.756v1.068c-3.356-.616-4.287-4.21-4.287-4.21a7.173 7.173 0 014.287-2.138v1.172h-.005a3.182 3.182 0 00-2.502 1.178s.615 2.276 2.507 2.931m-5.961-3.3c1.436-1.935 3.604-3.148 5.961-3.336V6.523C5.81 6.887 2 10.723 2 10.723s2.158 6.427 8.21 7.015v-1.166C5.77 16 4.25 10.958 4.25 10.958h-.002z',
}

function BrandMark(brand, size, color) {
  const d = LOBE_ICON[brand]
  if (!d) return null
  return h('svg', {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: color || '#fff',
    fillRule: 'evenodd',
    'aria-hidden': 'true',
  }, h('path', { d: d }))
}

function Verified() {
  return h('svg', { className: 'hk-v', viewBox: '0 0 16 16', 'aria-hidden': 'true' },
    h('circle', { cx: 8, cy: 8, r: 7, fill: '#3b82f6' }),
    h('path', { d: 'M4.8 8.15l2.05 2.05 4.35-4.4', stroke: '#fff', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }),
  )
}

function cardView(card, opts) {
  opts = opts || {}
  const small = !!opts.small
  const backBrand = opts.backBrand || ''
  const fan = opts.fan || ''
  const cls = 'hk-card' + (small ? ' sm' : '') + (fan ? ' fan-' + fan : '')
  if (!card) return h('div', { className: cls + ' empty' })
  if (card === 'back') {
    const pal = BRAND[backBrand]
    const showLogo = !!(backBrand && backBrand !== 'hero' && pal)
    return h('div', { className: cls + ' back' }, showLogo ? BrandMark(backBrand, small ? 14 : 22, pal.bg) : null)
  }
  const red = card.s === 'h' || card.s === 'd'
  return h('div', { className: cls + (red ? ' red' : '') },
    h('span', { className: 'hk-rank' }, RANK[card.r] || card.r),
    h('span', { className: 'hk-suit' }, SUIT[card.s] || ''),
  )
}

function holePair(p) {
  if (!p.hasCards) return null
  const face = p.cards && p.cards.length === 2 && !p.folded
  const base = { small: p.seat !== 0, backBrand: p.kind === 'ai' ? (p.brand || '') : '' }
  const left = Object.assign({}, base, { fan: 'l' })
  const right = Object.assign({}, base, { fan: 'r' })
  return h('div', { className: 'hk-cards' },
    cardView(face ? p.cards[0] : 'back', left),
    cardView(face ? p.cards[1] : 'back', right),
  )
}

function seatView(p, thinkLabel, isWinner) {
  const thinking = !!(p.isToAct && p.kind === 'ai')
  const statusText = thinking ? (thinkLabel || '思考中') : (p.talk || '')
  const top = seatIsTop(p.seat)
  const pill = h('div', { className: 'hk-pill' },
    h('div', { className: 'hk-avatar' }, h(PlayerMark, { player: p })),
    h('div', { className: 'hk-name' },
      h('span', {}, playerLabel(p)),
      p.isDealer ? h('span', { className: 'hk-d', title: '庄家' }, '庄')
        : p.isBb ? h('span', { className: 'hk-d hk-bb', title: '大盲' }, '大')
        : p.isSb ? h('span', { className: 'hk-d hk-sb', title: '小盲' }, '小')
        : Verified(),
    ),
    h('div', { className: 'hk-stack' }, fmt(p.stack) + ' 筹码'),
  )
  const below = isWinner
    ? h('div', { className: 'hk-winbadge' }, '🏆 Winner')
    : (p.committed > 0 ? h('div', { className: 'hk-potbet' }, '投入 ' + fmt(p.committed)) : null)
  const status = h('div', { className: 'hk-status' + (statusText ? (thinking ? '' : ' talk') : ' off') }, statusText || 'idle')
  return h('div', {
    key: p.id,
    className: 'hk-seat s' + p.seat + (top ? ' top' : '') + (p.isToAct ? ' toact' : '') + (p.folded ? ' folded' : '') + (isWinner ? ' winner' : ''),
    style: seatPos(p.seat),
  },
    h('div', { className: 'hk-badge' }, holePair(p), pill, below),
    status,
  )
}

function findScrollPort(el) {
  var view = el.ownerDocument && el.ownerDocument.defaultView
  var p = el.parentElement
  var rootEl = el.ownerDocument && el.ownerDocument.documentElement
  while (p && p !== rootEl) {
    var oy = view ? view.getComputedStyle(p).overflowY : ''
    if (oy === 'auto' || oy === 'scroll') return p
    p = p.parentElement
  }
  return el.parentElement
}

function useLockToScrollPort(root) {
  React.useEffect(function () {
    if (!root) return
    var view = root.ownerDocument && root.ownerDocument.defaultView
    var port = findScrollPort(root)
    function fit() {
      var h = (port && port.clientHeight) || (root.parentElement && root.parentElement.clientHeight) || 0
      if (h > 0) {
        root.style.height = h + 'px'
        root.style.maxHeight = h + 'px'
      }
    }
    fit()
    var RO = view && view.ResizeObserver
    var ro = RO ? new RO(fit) : null
    if (ro) {
      if (port) ro.observe(port)
      if (root.parentElement) ro.observe(root.parentElement)
    }
    function onWheel(e) {
      var tl = root.querySelector('.hk-tl')
      if (tl && (e.target === tl || tl.contains(e.target))) {
        var dy = e.deltaY
        if (e.deltaMode === 1) dy *= 16
        if (e.deltaMode === 2) dy *= tl.clientHeight
        var max = Math.max(0, tl.scrollHeight - tl.clientHeight)
        tl.scrollTop = Math.min(max, Math.max(0, tl.scrollTop + dy))
      }
      e.preventDefault()
      e.stopPropagation()
    }
    root.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return function () {
      if (ro) ro.disconnect()
      root.removeEventListener('wheel', onWheel, { capture: true })
    }
  }, [root])
}

function Table(props) {
  const [rootEl, setRootEl] = React.useState(null)
  useLockToScrollPort(rootEl)
  const state = props.state
  const busy = props.busy
  const now = props.now || 0
  const onStart = props.onStart
  const onNext = props.onNext
  const onReset = props.onReset
  const onAct = props.onAct
  const legal = (state && state.legal) || {}
  const minR = legal.minRaiseTo || 0
  const maxR = legal.maxRaiseTo || 0
  const [raiseTo, setRaiseTo] = React.useState(minR)

  React.useEffect(function () {
    setRaiseTo(minR)
  }, [minR, state && state.handNo, state && state.street])

  if (!state) return h('div', { className: 'hk-root', ref: setRootEl }, h('div', { className: 'hk-wait', style: { padding: 24 } }, '连接中…'))

  const acting = (state.players || []).find(function (p) { return p.isToAct })
  const winnerLines = formatWinnerLines(state.winners || [])
  const winnerSeats = {}
  for (let i = 0; i < (state.winners || []).length; i++) {
    const seats = state.winners[i].seats || []
    for (let j = 0; j < seats.length; j++) winnerSeats[seats[j]] = true
  }
  const idle = state.status === 'idle'
  const over = state.status === 'hand-over'
  const myTurn = state.status === 'playing' && state.toAct === 0
  const board = state.board || []
  const boardSlots = [0, 1, 2, 3, 4].map(function (i) { return board[i] || null })
  const dealer = (state.players || []).find(function (p) { return p.isDealer })
  const dealerBrand = dealer && dealer.kind === 'ai' && dealer.brand ? dealer.brand : 'hero'
  const boardOpts = { small: false, backBrand: dealerBrand, rimBrand: dealerBrand }
  const pot = state.pot || 0
  const presets = raisePresets({
    pot: pot,
    currentBet: state.currentBet || 0,
    minR: minR,
    maxR: maxR,
  })
  const chosen = clamp(raiseTo || minR, minR || 0, maxR || 0)
  let thinkLabel = ''
  if (acting && acting.kind === 'ai' && state.thinkEndsAt) {
    const left = Math.max(0, Math.ceil((state.thinkEndsAt - now) / 1000))
    thinkLabel = '思考中 · ' + left + '秒'
  }

  return h('div', { className: 'hk-root', ref: setRootEl },
    h('div', { className: 'hk-body' },
    h('div', { className: 'hk-main' },
    h('div', { className: 'hk-top' },
      h('div', { className: 'hk-title' }, 'No-Limit Inference'),
      h('div', { className: 'hk-meta' },
        idle
          ? '六人桌 · Altman / 达里奥 / 马斯克 / 梁文峰 / 黄仁勋'
          : ('第 ' + state.handNo + ' 手 · ' + (STREET[state.street] || state.street) + (state.agentModel ? ' · ' + state.agentModel : '')),
      ),
      idle
        ? h('button', { className: 'hk-chipbtn go', disabled: busy, onClick: onStart }, 'Start')
        : null,
      h('button', { className: 'hk-chipbtn', onClick: onReset }, 'Reset'),
    ),
    h('div', { className: 'hk-stage' },
      h('div', { className: 'hk-play' },
      h('div', { className: 'hk-table' },
        h('div', { className: 'hk-center' },
          idle ? null : h('div', { className: 'hk-pot' }, '底池 ' + fmt(state.pot || state.lastPot || 0) + ' 筹码'),
          h('div', { className: 'hk-board' },
            boardSlots.map(function (c, i) { return h('div', { key: i }, cardView(c || 'back', boardOpts)) }),
          ),
          idle ? h('div', { className: 'hk-banner' }, '五位玩家入座。每人只能看见自己的底牌。') : null,
          over && winnerLines.length
            ? h('div', { className: 'hk-banner hk-winner-banner' },
                winnerLines.map(function (line, i) {
                  return h('div', {
                    key: i,
                    className: i === 0 ? 'hk-winner-h' : 'hk-winner-sub',
                  }, (i === 0 ? '🏆 ' : '') + line)
                }),
              )
            : null,
        ),
        (state.players || []).map(function (p) { return seatView(p, thinkLabel, !!winnerSeats[p.seat]) }),
      ),
      idle ? null : h('div', { className: 'hk-dock' },
      over
          ? h('div', { className: 'hk-actions' },
              h('button', { className: 'hk-btn hk-go', disabled: busy, onClick: onNext }, '下一手'),
            )
          : myTurn
            ? [
                legal.raise && maxR > minR
                  ? h('div', { key: 'panel', className: 'hk-panel' },
                      presets.map(function (p) {
                        return h('button', {
                          key: p.label,
                          className: 'hk-pre' + (chosen === p.v ? ' on' : ''),
                          onClick: function () { setRaiseTo(p.v) },
                        }, p.label)
                      }),
                      h('input', {
                        className: 'hk-slider',
                        type: 'range',
                        min: minR,
                        max: Math.max(minR, maxR),
                        value: chosen,
                        onChange: function (e) { setRaiseTo(Number(e.target.value)) },
                      }),
                      h('div', { className: 'hk-amt' }, fmt(chosen) + ' 筹码'),
                    )
                  : null,
                h('div', { key: 'act', className: 'hk-actions' },
                  h('button', { className: 'hk-btn', disabled: busy || !legal.fold, onClick: function () { onAct({ type: 'fold' }) } }, 'Fold'),
                  legal.check
                    ? h('button', { className: 'hk-btn', disabled: busy, onClick: function () { onAct({ type: 'check' }) } }, 'Check')
                    : h('button', { className: 'hk-btn', disabled: busy || !legal.call, onClick: function () { onAct({ type: 'call' }) } }, 'Call ' + fmt(legal.callAmount || 0)),
                  legal.raise
                    ? h('button', {
                        className: 'hk-btn hk-raise',
                        disabled: busy,
                        onClick: function () { onAct({ type: 'raise', amount: chosen }) },
                      }, (chosen >= maxR ? 'All-in ' : 'Bet ') + fmt(chosen))
                    : null,
                ),
              ]
            : h('div', { className: 'hk-wait' }, acting ? ((acting.name || acting.id) + ' 正在思考…') : '发牌中…'),
      ),
      ),
    ),
    ),
    h(Rail, {
      items: state.timeline || [],
      players: state.players || [],
      busy: busy,
      onSetAvatar: props.onSetAvatar,
      onClearAvatar: props.onClearAvatar,
    }),
    ),
  )
}

function PokerView() {
    const [state, setState] = React.useState(null)
    const [err, setErr] = React.useState('')
    const [busy, setBusy] = React.useState(false)
    const [now, setNow] = React.useState(Date.now())

    React.useEffect(function () {
      let alive = true
      const load = function () {
        rpc('get-state').then(function (next) {
          if (alive) { setState(next); setNow(Date.now()); setErr('') }
        }).catch(function (e) {
          if (alive) setErr(String((e && e.message) || e))
        })
      }
      load()
      const timer = setInterval(load, 280)
      return function () {
        alive = false
        clearInterval(timer)
      }
    }, [])

    const call = function (method, args) {
      setBusy(true)
      return rpc(method, args || {}).then(function (next) {
        setState(next)
        setNow(Date.now())
        setErr('')
        return next
      }).catch(function (e) {
        setErr(String((e && e.message) || e))
      }).then(function (v) {
        setBusy(false)
        return v
      })
    }

    return h('div', { style: { flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
      err ? h('div', { className: 'hk-err' }, err) : null,
      h(Table, {
        state: state,
        busy: busy,
        now: now,
        onStart: function () { call('start', {}) },
        onNext: function () { call('next-hand', {}) },
        onReset: function () { call('reset', {}) },
        onAct: function (a) { call('act', a) },
        onSetAvatar: function (id, file) {
          if (!file) return
          if (file.size > 2 * 1024 * 1024) {
            setErr('图片超过 2MB')
            return
          }
          const reader = new FileReader()
          reader.onload = function () {
            call('set-avatar', { id: id, image: reader.result })
          }
          reader.onerror = function () {
            setErr('读取图片失败')
          }
          reader.readAsDataURL(file)
        },
        onClearAvatar: function (id) { call('clear-avatar', { id: id }) },
      }),
    )
}

function apply(ctx) {
  ctx.effect(function () {
    const style = document.createElement('style')
    style.dataset.plugin = 'dsh-holdem'
    style.textContent = CSS
    document.head.appendChild(style)
    return function () { style.remove() }
  })
  ctx.slots.inject('conversation.view', function () {
    return ctx.slots.register(
      { name: 'conversation.view', id: 'holdem', order: 20, label: '德州扑克' },
      PokerView,
    )
  })
}

module.exports = {
  name: 'dsh-holdem',
  inject: ['slots'],
  apply: apply,
}
