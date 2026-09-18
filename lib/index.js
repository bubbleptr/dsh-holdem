// src/cards.js
var RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
var SUITS = ["s", "h", "d", "c"];
var HAND_NAMES = ["\u9AD8\u724C", "\u4E00\u5BF9", "\u4E24\u5BF9", "\u4E09\u6761", "\u987A\u5B50", "\u540C\u82B1", "\u846B\u82A6", "\u56DB\u6761", "\u540C\u82B1\u987A", "\u7687\u5BB6\u540C\u82B1\u987A"];
var RANK_TXT = { 14: "A", 13: "K", 12: "Q", 11: "J", 10: "T", 9: "9", 8: "8", 7: "7", 6: "6", 5: "5", 4: "4", 3: "3", 2: "2" };
var SUIT_TXT = { s: "s", h: "h", d: "d", c: "c" };
function cardTxt(c) {
  if (!c) return "?";
  return (RANK_TXT[c.r] || c.r) + (SUIT_TXT[c.s] || c.s);
}
function makeDeck() {
  const deck = [];
  for (let s = 0; s < SUITS.length; s++) {
    for (let r = 0; r < RANKS.length; r++) deck.push({ r: RANKS[r], s: SUITS[s] });
  }
  return deck;
}
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = deck[i];
    deck[i] = deck[j];
    deck[j] = t;
  }
  return deck;
}
function eval5(cards) {
  const ranks = cards.map(function(c) {
    return c.r;
  }).sort(function(a, b) {
    return b - a;
  });
  const flush = cards.every(function(c) {
    return c.s === cards[0].s;
  });
  const uniq = [];
  for (let i = 0; i < ranks.length; i++) {
    if (uniq[uniq.length - 1] !== ranks[i]) uniq.push(ranks[i]);
  }
  let straightHigh = 0;
  if (uniq.length === 5) {
    if (uniq[0] - uniq[4] === 4) straightHigh = uniq[0];
    else if (uniq[0] === 14 && uniq[1] === 5 && uniq[2] === 4 && uniq[3] === 3 && uniq[4] === 2) straightHigh = 5;
  }
  const counts = {};
  for (let i = 0; i < ranks.length; i++) counts[ranks[i]] = (counts[ranks[i]] || 0) + 1;
  const groups = Object.keys(counts).map(Number).sort(function(a, b) {
    const d = counts[b] - counts[a];
    return d !== 0 ? d : b - a;
  });
  let cat = 0;
  let kick = ranks;
  if (straightHigh && flush) {
    cat = straightHigh === 14 ? 9 : 8;
    kick = [straightHigh];
  } else if (counts[groups[0]] === 4) {
    cat = 7;
    kick = groups;
  } else if (counts[groups[0]] === 3 && counts[groups[1]] === 2) {
    cat = 6;
    kick = groups;
  } else if (flush) {
    cat = 5;
    kick = ranks;
  } else if (straightHigh) {
    cat = 4;
    kick = [straightHigh];
  } else if (counts[groups[0]] === 3) {
    cat = 3;
    kick = groups;
  } else if (counts[groups[0]] === 2 && counts[groups[1]] === 2) {
    cat = 2;
    kick = groups;
  } else if (counts[groups[0]] === 2) {
    cat = 1;
    kick = groups;
  }
  let score = cat;
  for (let i = 0; i < 5; i++) score = score * 16 + (kick[i] || 0);
  const name2 = cat === 9 ? HAND_NAMES[9] : HAND_NAMES[cat];
  return { cat, kick, score, name: name2 };
}
function combos5(cards) {
  const out = [];
  const n = cards.length;
  for (let a = 0; a < n - 4; a++) {
    for (let b = a + 1; b < n - 3; b++) {
      for (let c = b + 1; c < n - 2; c++) {
        for (let d = c + 1; d < n - 1; d++) {
          for (let e = d + 1; e < n; e++) out.push([cards[a], cards[b], cards[c], cards[d], cards[e]]);
        }
      }
    }
  }
  return out;
}
function evalBest(cards) {
  if (!cards || cards.length < 5) return { cat: -1, score: -1, name: "\u2014", kick: [] };
  if (cards.length === 5) return eval5(cards);
  const list = combos5(cards);
  let best = null;
  for (let i = 0; i < list.length; i++) {
    const ev = eval5(list[i]);
    if (!best || ev.score > best.score) best = ev;
  }
  return best;
}
function preflopScore(cards) {
  const a = cards[0].r >= cards[1].r ? cards[0] : cards[1];
  const b = cards[0].r >= cards[1].r ? cards[1] : cards[0];
  if (a.r === b.r) return Math.min(0.96, 0.46 + a.r / 28);
  const gap = a.r - b.r;
  let s = (a.r + b.r) / 42;
  if (a.s === b.s) s += 0.08;
  if (gap === 1) s += 0.09;
  else if (gap === 2) s += 0.04;
  else s -= gap * 0.016;
  if (a.r >= 13 && b.r >= 10) s += 0.08;
  return Math.max(0.06, Math.min(0.9, s));
}
function strength(hole, board) {
  if (!board || board.length === 0) return preflopScore(hole);
  const ev = evalBest(hole.concat(board));
  const boardEv = board.length >= 5 ? evalBest(board.slice()) : null;
  let s = 0.12 + ev.cat * 0.09;
  if (boardEv && ev.score <= boardEv.score) s *= 0.55;
  if (ev.cat >= 4) s += 0.12;
  return Math.max(0.06, Math.min(0.98, s));
}

// src/bets.js
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function raiseCeiling(opts) {
  const pot = Number(opts.pot) || 0;
  const currentBet = Number(opts.currentBet) || 0;
  const bb = Number(opts.bb) || 0;
  const minR = Number(opts.minR) || 0;
  const maxR = Number(opts.maxR) || 0;
  if (maxR <= 0) return 0;
  const cap = currentBet + Math.max(3 * Math.max(pot, bb), 4 * bb);
  return Math.max(minR, Math.min(maxR, Math.floor(cap)));
}
function clampRaise(amount, opts) {
  const minR = Number(opts.minR) || 0;
  const maxR = Number(opts.maxR) || 0;
  if (maxR <= 0) return 0;
  const v = typeof amount === "number" && isFinite(amount) ? Math.floor(amount) : 0;
  if (!(v > 0)) return Math.max(0, Math.min(minR, maxR));
  return clamp(v, minR, raiseCeiling(opts));
}

// src/table-rules.js
var MAX_REBUYS = 3;
function rebuyDecision(player, opts) {
  const max = opts && typeof opts.max === "number" ? opts.max : MAX_REBUYS;
  const start = opts && typeof opts.start === "number" ? opts.start : 0;
  const used = player && typeof player.rebuys === "number" ? player.rebuys : 0;
  if (!player || player.out) return { action: "out" };
  if (player.stack > 0) return { action: "keep" };
  if (used < max) return { action: "rebuy", rebuys: used + 1, stack: start };
  return { action: "out" };
}
function blindSeats(seatCount, active, dealer) {
  const seated = active.slice().sort(function(a, b) {
    return a - b;
  });
  if (seated.length < 2) return null;
  if (seated.length === 2) {
    const button = seated.indexOf(dealer) !== -1 ? dealer : seated[0];
    return { sb: button, bb: button === seated[0] ? seated[1] : seated[0] };
  }
  const next = function(from) {
    for (let i = 1; i <= seatCount; i++) {
      const s = (from - i % seatCount + seatCount) % seatCount;
      if (seated.indexOf(s) !== -1) return s;
    }
    return null;
  };
  const sb = next(dealer);
  return { sb, bb: next(sb) };
}

// src/pots.js
function makePots(players) {
  const levels = [];
  for (let i = 0; i < players.length; i++) {
    const c = players[i].committed;
    if (c > 0 && levels.indexOf(c) === -1) levels.push(c);
  }
  levels.sort(function(a, b) {
    return a - b;
  });
  const pots = [];
  let prev = 0;
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    let amount = 0;
    const eligible = [];
    for (let j = 0; j < players.length; j++) {
      const p = players[j];
      if (p.committed > prev) amount += Math.min(p.committed, level) - prev;
      if (!p.folded && p.committed >= level) eligible.push(p);
    }
    if (amount > 0 && eligible.length) pots.push({ amount, eligible });
    prev = level;
  }
  return pots;
}

// src/avatars.js
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
var PLAYER_IDS = ["hero", "altman", "dario", "musk", "liang", "jensen"];
var AGENT_IDS = ["altman", "dario", "musk", "liang", "jensen"];
var MAX_AVATAR_BYTES = 2 * 1024 * 1024;
var BUNDLED_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
function isPlayerId(id) {
  return PLAYER_IDS.indexOf(id) !== -1;
}
function avatarDataDir() {
  const home = process.env.DSH_HOME || join(homedir(), ".dsh");
  return join(home, "dsh-holdem", "avatars");
}
function bundledAvatarDir() {
  const here = dirname(fileURLToPath(import.meta.url));
  const fromSrc = join(here, "..", "assets", "avatars");
  if (existsSync(fromSrc)) return fromSrc;
  return join(here, "avatars");
}
function sniffMime(bytes) {
  if (!bytes || bytes.length < 12) return "";
  if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70 && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80) return "image/webp";
  return "";
}
function decodeAvatar(args) {
  args = args || {};
  let bytes = args.bytes;
  if (typeof args.image === "string") {
    const raw = args.image.replace(/\s/g, "");
    const m = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i.exec(raw);
    if (m) bytes = Buffer.from(m[2], "base64");
    else bytes = Buffer.from(raw, "base64");
  }
  if (typeof bytes === "string") bytes = Buffer.from(bytes, "base64");
  if (!Buffer.isBuffer(bytes) || bytes.length === 0 || bytes.length > MAX_AVATAR_BYTES) return null;
  const mime = sniffMime(bytes);
  if (!mime) return null;
  return { bytes, mime };
}
function readOverride(dir, id) {
  if (!isPlayerId(id)) return null;
  const file = join(dir, id);
  if (!existsSync(file)) return null;
  const bytes = readFileSync(file);
  const mime = sniffMime(bytes);
  if (!mime) return null;
  let rev = 0;
  try {
    rev = Math.floor(statSync(file).mtimeMs);
  } catch (e) {
    rev = Date.now();
  }
  return { bytes, mime, rev };
}
function loadOverrides(dir) {
  const out = {};
  if (!dir || !existsSync(dir)) return out;
  for (let i = 0; i < PLAYER_IDS.length; i++) {
    const rec = readOverride(dir, PLAYER_IDS[i]);
    if (rec) out[PLAYER_IDS[i]] = rec;
  }
  return out;
}
function writeOverride(dir, id, rec) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, id), rec.bytes);
  const st = statSync(join(dir, id));
  return { bytes: rec.bytes, mime: rec.mime, rev: Math.floor(st.mtimeMs) };
}
function removeOverride(dir, id) {
  if (!isPlayerId(id)) return;
  const file = join(dir, id);
  if (existsSync(file)) unlinkSync(file);
}
function readBundled(dir, id) {
  if (id === "hero" || !isPlayerId(id) || !dir || !existsSync(dir)) return null;
  for (let i = 0; i < BUNDLED_EXTS.length; i++) {
    const file = join(dir, id + BUNDLED_EXTS[i]);
    if (!existsSync(file)) continue;
    const bytes = readFileSync(file);
    const mime = sniffMime(bytes);
    if (!mime) continue;
    let rev = 0;
    try {
      rev = Math.floor(statSync(file).mtimeMs);
    } catch (e) {
      rev = Date.now();
    }
    return { bytes, mime, rev };
  }
  return null;
}
function loadBundled(dir) {
  const out = {};
  const root = dir || bundledAvatarDir();
  if (!root || !existsSync(root)) return out;
  for (let i = 0; i < AGENT_IDS.length; i++) {
    const rec = readBundled(root, AGENT_IDS[i]);
    if (rec) out[AGENT_IDS[i]] = rec;
  }
  return out;
}
function avatarView(id, overrides, bundled) {
  const rec = overrides && overrides[id];
  if (rec) {
    return {
      kind: "override",
      seed: id,
      src: "/dsh-holdem/avatar/" + id + "?v=" + rec.rev
    };
  }
  const pack = bundled && bundled[id];
  if (pack) {
    return {
      kind: "default",
      seed: id,
      src: "/dsh-holdem/avatar/" + id + "?v=" + pack.rev
    };
  }
  return { kind: "identicon", seed: id, src: "" };
}

// src/host.js
var START_STACK = 2e6;
var SB = 1e4;
var BB = 2e4;
var BOTS = [
  { id: "altman", name: "Altman", emoji: "A", brand: "openai", company: "OpenAI", loose: 0.04, agg: 0.58, bluff: 0.08, tag: "OpenAI", style: "\u4F60\u662F OpenAI \u521B\u59CB\u4EBA Sam Altman\u3002\u7D27\u51F6\u3001\u7231\u8BB2\u613F\u666F\uFF0C\u4F46\u724C\u684C\u4E0A\u7EDD\u4E0D\u9732\u5E95\u3002\u5783\u573E\u724C\u5C31\u5F03\uFF0C\u5F3A\u724C\u4EF7\u503C\u4E0B\u6CE8\uFF0C\u5F88\u5C11\u5927\u989D\u8BC8\u552C\u3002" },
  { id: "dario", name: "\u8FBE\u91CC\u5965", emoji: "D", brand: "anthropic", company: "Anthropic", loose: -0.1, agg: 0.22, bluff: 0.03, tag: "Anthropic", style: "\u4F60\u662F Anthropic \u521B\u59CB\u4EBA Dario Amodei\u3002\u6781\u7D27\u3001\u5B89\u5168\u4F18\u5148\u3002\u53EA\u6709\u5F3A\u6210\u724C\u6216\u5927\u542C\u724C\u624D\u7EE7\u7EED\uFF0C\u51E0\u4E4E\u4E0D\u8BC8\u552C\u3002" },
  { id: "musk", name: "\u9A6C\u65AF\u514B", emoji: "X", brand: "xai", company: "xAI", loose: 0.3, agg: 0.88, bluff: 0.36, tag: "xAI", style: "\u4F60\u662F xAI \u521B\u59CB\u4EBA\u57C3\u9686\xB7\u9A6C\u65AF\u514B\u3002\u75AF\u5B50\u6253\u6CD5\uFF1A\u5C3A\u5EA6\u5938\u5F20\u3001\u7231\u505A\u5927\u989D\u65BD\u538B\u3001\u95F2\u8BDD\u77ED\u4FC3\u5E26\u523A\u3001\u5076\u5C14\u4E71\u8BC8\uFF1B\u4F46\u53EA\u6709\u724C\u529B\u771F\u7684\u591F\u5F3A\u65F6\u624D\u63A8\u5149\uFF0C\u4E0D\u8981\u6BCF\u624B\u90FD\u5168\u4E0B\u3002" },
  { id: "liang", name: "\u6881\u6587\u5CF0", emoji: "\u6881", brand: "deepseek", company: "DeepSeek", loose: 0.16, agg: 0.72, bluff: 0.22, tag: "DeepSeek", style: "\u4F60\u662F DeepSeek \u521B\u59CB\u4EBA\u6881\u6587\u5CF0\u3002\u9AD8\u6548\u677E\u51F6\uFF0C\u5C3A\u5EA6\u591A\u53D8\uFF0C\u4F1A\u7A81\u7136\u52A0\u6CE8\uFF0C\u4E13\u5403\u8F6F\u73A9\u5BB6\u3002" },
  { id: "jensen", name: "\u9EC4\u4EC1\u52CB", emoji: "\u9EC4", brand: "nvidia", company: "NVIDIA", loose: 0.12, agg: 0.7, bluff: 0.12, tag: "NVIDIA", style: "\u4F60\u662F NVIDIA \u521B\u59CB\u4EBA\u9EC4\u4EC1\u52CB\u3002\u70ED\u60C5\u3001\u6301\u7EED\u65BD\u538B\u3001\u7231\u4EF7\u503C\u4E0B\u6CE8\u3002\u95F2\u8BDD\u50CF\u53D1\u5E03\u4F1A\uFF0C\u4F46\u4E0D\u63D0\u724C\u9762\u3002" }
];
var ACT_TOOL = {
  name: "holdem_act",
  description: "Take exactly one legal No-Limit Hold'em action.",
  parameters: {
    type: "object",
    properties: {
      type: { type: "string", enum: ["fold", "check", "call", "raise", "allin"], description: "allin = \u628A\u5168\u90E8\u7B79\u7801\u4E00\u6B21\u63A8\u4E0A\u53BB\uFF0C\u53EA\u5728\u5C11\u6570\u60C5\u51B5\u4F7F\u7528\uFF1B\u666E\u901A\u52A0\u6CE8\u8BF7\u7528 raise\u3002" },
      amount: { type: "number", description: "Raise-to total in tokens, required for type=raise. Must sit inside the raise range given in the prompt." },
      talk: { type: "string", description: "\u53EF\u9009\u684C\u8FB9\u95F2\u8BDD\uFF0C\u5FC5\u987B\u662F\u7B80\u4F53\u4E2D\u6587\uFF0C\u6700\u591A16\u4E2A\u5B57\u3002\u7981\u6B62\u63D0\u5230\u5E95\u724C\u3001\u82B1\u8272\u3001\u70B9\u6570\u3001\u542C\u724C\u3001\u6210\u724C\u6216\u4EFB\u4F55\u63A8\u7406\u8FC7\u7A0B\u3002" }
    },
    required: ["type"]
  }
};
function sanitizeTalk(raw) {
  if (!raw || typeof raw !== "string") return "";
  let talk = raw.replace(/\s+/g, "").trim();
  if (!talk) return "";
  if (/[A-Za-z]{3,}/.test(talk)) return "";
  if (/(底牌|手牌|洞牌|对子|同花|顺子|葫芦|四条|皇家|听牌|成牌|胜率|赔率|范围|range|odds|equity|[♠♥♦♣]|黑桃|红心|红桃|方块|梅花|[AKQJT2-9][shdc])/i.test(talk)) return "";
  return talk.slice(0, 24);
}
function parseJsonObject(text) {
  if (!text) return null;
  const raw = String(text);
  try {
    return JSON.parse(raw);
  } catch (e) {
  }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}
function createPlayer(spec, seat) {
  return {
    id: spec.id,
    name: spec.name,
    emoji: spec.emoji,
    brand: spec.brand || "",
    company: spec.company || "",
    kind: spec.kind,
    tag: spec.tag || "",
    loose: spec.loose || 0,
    agg: spec.agg || 0.4,
    bluff: spec.bluff || 0.1,
    seat,
    stack: START_STACK,
    rebuys: 0,
    out: false,
    bet: 0,
    committed: 0,
    folded: false,
    allIn: false,
    acted: false,
    cards: [],
    lastAction: "",
    lastThought: "",
    talk: "",
    style: spec.style || ""
  };
}
function createTable(ctx) {
  const state = {
    status: "idle",
    handNo: 0,
    street: "preflop",
    dealer: 5,
    board: [],
    deck: [],
    currentBet: 0,
    minRaise: BB,
    toAct: null,
    sbSeat: null,
    bbSeat: null,
    gameOver: false,
    winners: [],
    revealed: false,
    lastPot: 0,
    thinkEndsAt: 0,
    actionLog: [],
    timeline: [],
    tlSeq: 0,
    agentModel: "",
    log: ["Click Start to sit with five agents."]
  };
  const players = [createPlayer({ id: "hero", name: "you", emoji: "\u{1F9D1}", kind: "human", tag: "Hero" }, 0)];
  for (let i = 0; i < BOTS.length; i++) {
    players.push(createPlayer(Object.assign({ kind: "ai" }, BOTS[i]), i + 1));
  }
  const avatarDir = avatarDataDir();
  const overrides = loadOverrides(avatarDir);
  const bundled = loadBundled();
  let aiTimer = null;
  let aiSeq = 0;
  function log(text) {
    state.log = state.log.concat([text]).slice(-10);
  }
  function record(entry) {
    state.tlSeq = (state.tlSeq || 0) + 1;
    state.timeline = (state.timeline || []).concat([{
      id: state.tlSeq,
      at: Date.now(),
      handNo: state.handNo,
      street: entry.street || state.street || "",
      kind: entry.kind || "action",
      name: entry.name || "",
      emoji: entry.emoji || "",
      playerId: entry.playerId || "",
      action: entry.action || "",
      talk: entry.talk || ""
    }]).slice(-160);
  }
  function clearAi() {
    aiSeq += 1;
    if (aiTimer) {
      aiTimer();
      aiTimer = null;
    }
  }
  function pot() {
    let n = 0;
    for (let i = 0; i < players.length; i++) n += players[i].committed;
    return n;
  }
  function live() {
    return players.filter(function(p) {
      return !p.folded;
    });
  }
  function canAct(p) {
    return !p.folded && !p.allIn && p.stack >= 0;
  }
  function cw(from, steps) {
    const n = players.length;
    const k = steps == null ? 1 : steps;
    return (from - k % n + n) % n;
  }
  function nextIndex(from) {
    for (let i = 1; i <= players.length; i++) {
      const p = players[cw(from, i)];
      if (!p.folded && !p.allIn) return p.seat;
    }
    return null;
  }
  function put(p, amount) {
    const n = Math.max(0, Math.min(amount, p.stack));
    p.stack -= n;
    p.bet += n;
    p.committed += n;
    if (p.stack === 0) p.allIn = true;
    return n;
  }
  function resetStreetFlags() {
    for (let i = 0; i < players.length; i++) {
      players[i].bet = 0;
      players[i].acted = false;
      if (!players[i].folded && players[i].stack === 0) players[i].allIn = true;
    }
    state.currentBet = 0;
    state.minRaise = BB;
  }
  function legalFor(p) {
    if (!p || state.status !== "playing" || state.toAct !== p.seat) {
      return { fold: false, check: false, call: false, callAmount: 0, raise: false, minRaiseTo: 0, maxRaiseTo: 0, toCall: 0 };
    }
    const toCall = Math.max(0, state.currentBet - p.bet);
    const maxRaiseTo = p.bet + p.stack;
    const minRaiseTo = state.currentBet === 0 ? Math.max(BB, state.minRaise) : state.currentBet + state.minRaise;
    return {
      fold: true,
      check: toCall === 0,
      call: toCall > 0,
      callAmount: Math.min(toCall, p.stack),
      raise: p.stack > toCall,
      minRaiseTo: Math.min(minRaiseTo, maxRaiseTo),
      maxRaiseTo,
      toCall
    };
  }
  function snapshot() {
    const hero = players[0];
    const legal = legalFor(state.toAct == null ? null : players[state.toAct]);
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
      gameOver: !!state.gameOver,
      maxRebuys: MAX_REBUYS,
      thinkEndsAt: state.thinkEndsAt || 0,
      agentModel: state.agentModel || "",
      log: state.log.slice(),
      timeline: (state.timeline || []).slice(),
      legal,
      heroHand: hero.cards.length >= 5 || state.board.length >= 3 ? evalBest(hero.cards.concat(state.board)).name : hero.cards.length === 2 ? "\u5E95\u724C" : "",
      players: players.map(function(p) {
        const isWinner = (state.winners || []).some(function(w) {
          return (w.seats || []).indexOf(p.seat) !== -1;
        });
        const show = p.kind === "human" || state.revealed || state.status === "hand-over" && isWinner && !p.folded;
        return {
          id: p.id,
          name: p.name,
          emoji: p.emoji,
          brand: p.brand || "",
          company: p.company || "",
          kind: p.kind,
          tag: p.tag,
          seat: p.seat,
          stack: p.stack,
          rebuys: p.rebuys || 0,
          out: !!p.out,
          bet: p.bet,
          committed: p.committed,
          folded: p.folded,
          allIn: p.allIn,
          isDealer: p.seat === state.dealer,
          isSb: p.seat === state.sbSeat,
          isBb: p.seat === state.bbSeat,
          isToAct: state.toAct === p.seat && state.status === "playing",
          lastAction: p.lastAction,
          lastThought: "",
          talk: p.talk || "",
          avatar: avatarView(p.id, overrides, bundled),
          hasCards: p.cards.length === 2,
          cards: show ? p.cards.slice() : [],
          handName: show && p.cards.length === 2 && (state.revealed || p.kind === "human") && state.board.length >= 3 ? evalBest(p.cards.concat(state.board)).name : ""
        };
      })
    };
  }
  function findNextActor(from) {
    for (let i = 1; i <= players.length; i++) {
      const p = players[cw(from, i)];
      if (!p.folded && !p.allIn && (!p.acted || p.bet < state.currentBet)) return p.seat;
    }
    return null;
  }
  function streetClosed() {
    const alive = live();
    if (alive.length <= 1) return true;
    const actors = alive.filter(function(p) {
      return !p.allIn;
    });
    if (actors.length === 0) return true;
    if (actors.length === 1 && actors[0].bet >= state.currentBet) return true;
    return actors.every(function(p) {
      return p.acted && p.bet === state.currentBet;
    });
  }
  function seatOrder(seat) {
    return (state.dealer - seat - 1 + players.length) % players.length;
  }
  function finishFoldWin() {
    const winner = live()[0];
    const amount = pot();
    winner.stack += amount;
    state.lastPot = amount;
    state.winners = [{ seats: [winner.seat], names: [winner.name], amount, handName: "\u65E0\u4EBA\u8DDF\u6CE8" }];
    for (let i = 0; i < players.length; i++) players[i].committed = 0;
    state.status = "hand-over";
    state.toAct = null;
    state.revealed = false;
    log(winner.name + " \u6536\u8D70\u5E95\u6C60 " + amount);
    record({ kind: "result", name: winner.name, emoji: winner.emoji, playerId: winner.id, action: "\u6536\u8D70\u5E95\u6C60 " + amount, street: state.street });
  }
  function showdown() {
    state.revealed = true;
    state.status = "showdown";
    state.toAct = null;
    const pots = makePots(players);
    const results = [];
    for (let i = 0; i < pots.length; i++) {
      const potItem = pots[i];
      const scored = potItem.eligible.map(function(p) {
        return { p, ev: evalBest(p.cards.concat(state.board)) };
      });
      let best = -1;
      for (let j = 0; j < scored.length; j++) if (scored[j].ev.score > best) best = scored[j].ev.score;
      const winners = scored.filter(function(s) {
        return s.ev.score === best;
      });
      winners.sort(function(a, b) {
        return seatOrder(a.p.seat) - seatOrder(b.p.seat);
      });
      const share = Math.floor(potItem.amount / winners.length);
      let rem = potItem.amount - share * winners.length;
      for (let j = 0; j < winners.length; j++) {
        winners[j].p.stack += share + (rem > 0 ? 1 : 0);
        if (rem > 0) rem--;
      }
      results.push({
        seats: winners.map(function(w) {
          return w.p.seat;
        }),
        names: winners.map(function(w) {
          return w.p.name;
        }),
        amount: potItem.amount,
        handName: winners[0].ev.name
      });
      log(winners.map(function(w) {
        return w.p.name;
      }).join("\u3001") + " \u4EE5" + winners[0].ev.name + " \u8D62\u4E0B " + potItem.amount);
      record({
        kind: "result",
        name: winners.map(function(w) {
          return w.p.name;
        }).join("\u3001"),
        emoji: winners[0].p.emoji,
        playerId: winners[0].p.id,
        action: winners[0].ev.name + " \xB7 " + potItem.amount,
        street: "showdown"
      });
    }
    state.winners = results;
    state.lastPot = results.reduce(function(s, r) {
      return s + r.amount;
    }, 0);
    for (let i = 0; i < players.length; i++) players[i].committed = 0;
    state.status = "hand-over";
  }
  function dealStreet() {
    if (state.street === "preflop") {
      state.deck.pop();
      state.board = [state.deck.pop(), state.deck.pop(), state.deck.pop()];
      state.street = "flop";
      log("\u7FFB\u724C");
      record({ kind: "street", action: "\u7FFB\u724C", street: "flop" });
    } else if (state.street === "flop") {
      state.deck.pop();
      state.board.push(state.deck.pop());
      state.street = "turn";
      log("\u8F6C\u724C");
      record({ kind: "street", action: "\u8F6C\u724C", street: "turn" });
    } else if (state.street === "turn") {
      state.deck.pop();
      state.board.push(state.deck.pop());
      state.street = "river";
      log("\u6CB3\u724C");
      record({ kind: "street", action: "\u6CB3\u724C", street: "river" });
    } else {
      showdown();
      return;
    }
    resetStreetFlags();
    if (maybeRunout()) return;
    state.toAct = findNextActor(state.dealer);
    if (state.toAct == null) {
      if (state.street === "river") showdown();
      else dealStreet();
    }
  }
  function maybeRunout() {
    const alive = live();
    if (alive.length <= 1) return false;
    const actors = alive.filter(function(p) {
      return !p.allIn;
    });
    if (actors.length === 0 || actors.length === 1 && actors[0].bet >= state.currentBet) {
      while (state.street !== "river" && state.status === "playing") {
        if (state.street === "preflop") {
          state.deck.pop();
          state.board = [state.deck.pop(), state.deck.pop(), state.deck.pop()];
          state.street = "flop";
        } else if (state.street === "flop") {
          state.deck.pop();
          state.board.push(state.deck.pop());
          state.street = "turn";
        } else if (state.street === "turn") {
          state.deck.pop();
          state.board.push(state.deck.pop());
          state.street = "river";
        }
      }
      if (state.status === "playing") showdown();
      return true;
    }
    return false;
  }
  function afterAction() {
    if (live().length <= 1) {
      finishFoldWin();
      return;
    }
    if (streetClosed()) {
      if (state.street === "river") showdown();
      else dealStreet();
      return;
    }
    if (state.toAct == null) return;
    state.toAct = findNextActor(state.toAct);
    if (state.toAct == null) {
      if (state.street === "river") showdown();
      else dealStreet();
    }
  }
  function applyAction(p, type, amount) {
    const toCall = Math.max(0, state.currentBet - p.bet);
    if (type === "fold") {
      if (toCall === 0) type = "check";
      else {
        p.folded = true;
        p.acted = true;
        p.lastAction = "\u5F03\u724C";
        log(p.name + " \u5F03\u724C");
        return;
      }
    }
    if (type === "check") {
      if (toCall > 0) {
        applyAction(p, "call", 0);
        return;
      }
      p.acted = true;
      p.lastAction = "\u8FC7\u724C";
      log(p.name + " \u8FC7\u724C");
      return;
    }
    if (type === "call") {
      if (toCall === 0) {
        applyAction(p, "check", 0);
        return;
      }
      const paid = put(p, toCall);
      p.acted = true;
      p.lastAction = p.allIn ? "\u5168\u4E0B " + paid : "\u8DDF\u6CE8 " + paid;
      log(p.name + " " + p.lastAction);
      return;
    }
    if (type === "allin") {
      const target = p.bet + p.stack;
      applyAction(p, "raise", target);
      return;
    }
    if (type === "raise" || type === "bet") {
      let target = typeof amount === "number" ? Math.floor(amount) : 0;
      const maxTo = p.bet + p.stack;
      if (target <= 0) target = state.currentBet === 0 ? BB : state.currentBet + state.minRaise;
      if (target > maxTo) target = maxTo;
      if (target <= p.bet) {
        applyAction(p, toCall > 0 ? "call" : "check", 0);
        return;
      }
      if (target < state.currentBet) {
        applyAction(p, "call", 0);
        return;
      }
      const need = target - p.bet;
      const raiseBy = target - state.currentBet;
      put(p, need);
      const isRaise = target > state.currentBet;
      if (isRaise) {
        if (raiseBy >= state.minRaise || p.allIn) {
          if (raiseBy >= state.minRaise) state.minRaise = raiseBy;
          for (let i = 0; i < players.length; i++) {
            if (players[i] !== p && !players[i].folded && !players[i].allIn) players[i].acted = false;
          }
        }
        state.currentBet = p.bet;
      }
      p.acted = true;
      if (p.allIn) p.lastAction = "\u5168\u4E0B " + p.bet;
      else if (state.currentBet === p.bet && raiseBy > 0 && toCall === 0) p.lastAction = "\u4E0B\u6CE8 " + p.bet;
      else p.lastAction = "\u52A0\u6CE8\u81F3 " + p.bet;
      log(p.name + " " + p.lastAction);
    }
  }
  function decideAiRaw(p) {
    const toCall = Math.max(0, state.currentBet - p.bet);
    const hs = strength(p.cards, state.board) + p.loose;
    const potNow = pot();
    const odds = toCall === 0 ? 0 : toCall / (potNow + toCall);
    const roll = Math.random();
    if (toCall === 0) {
      if (hs > 0.62 && roll < p.agg) {
        const size = Math.floor(potNow * (0.5 + p.agg * 0.4));
        return { type: "raise", amount: Math.max(BB, p.bet + size) };
      }
      if (hs > 0.5 && roll < p.bluff * 1.4) {
        return { type: "raise", amount: p.bet + Math.max(BB, Math.floor(potNow * 0.66)) };
      }
      return { type: "check" };
    }
    if (hs + 0.08 < odds && toCall > p.stack * 0.12 && roll > p.bluff) return { type: "fold" };
    if (hs > 0.7 && roll < p.agg) {
      const size = Math.floor((potNow + toCall) * (0.6 + p.agg * 0.5));
      return { type: "raise", amount: state.currentBet + Math.max(state.minRaise, size) };
    }
    if (hs > 0.55 && roll < p.bluff + 0.15) {
      return { type: "raise", amount: state.currentBet + Math.max(state.minRaise, Math.floor((potNow + toCall) * 0.75)) };
    }
    if (toCall >= p.stack) return { type: "call" };
    if (hs + p.loose * 0.5 >= odds - 0.08) return { type: "call" };
    if (toCall <= BB && hs > 0.28) return { type: "call" };
    return { type: "fold" };
  }
  function decideAi(p) {
    const choice = decideAiRaw(p);
    if (!choice || choice.type !== "raise") return choice;
    const legal = legalFor(p);
    if (!legal.raise) return { type: legal.check ? "check" : "call" };
    return { type: "raise", amount: clampRaise(choice.amount, raiseOpts(legal)) };
  }
  function raiseOpts(legal) {
    return {
      pot: pot(),
      currentBet: state.currentBet,
      bb: BB,
      minR: legal.minRaiseTo,
      maxR: legal.maxRaiseTo
    };
  }
  function normalizeChoice(raw, legal, fallback) {
    const type = raw && typeof raw.type === "string" ? raw.type.toLowerCase() : "";
    const talk = sanitizeTalk(raw && raw.talk);
    if (type === "check" && legal.check) return { type: "check", talk };
    if (type === "fold" && legal.fold) return { type: legal.toCall > 0 ? "fold" : "check", talk };
    if (type === "call" && legal.call) return { type: "call", talk };
    if (type === "call" && legal.check) return { type: "check", talk };
    if (type === "allin" && legal.raise) return { type: "raise", amount: legal.maxRaiseTo, talk };
    if ((type === "raise" || type === "bet") && legal.raise) {
      return { type: "raise", amount: clampRaise(raw.amount, raiseOpts(legal)), talk };
    }
    return fallback;
  }
  function describeLegal(legal) {
    const parts = [];
    if (legal.fold && legal.toCall > 0) parts.push("fold");
    if (legal.check) parts.push("check");
    if (legal.call) parts.push("call " + legal.callAmount + " more tokens");
    if (legal.raise) {
      const opts = raiseOpts(legal);
      const top = raiseCeiling(opts);
      const potNow = Math.max(1, opts.pot);
      parts.push("raise: amount = the raise-to total, from " + legal.minRaiseTo + " to " + top + " (about " + Math.round(legal.minRaiseTo / potNow * 10) / 10 + "\u2013" + Math.round(top / potNow * 10) / 10 + "\xD7 the " + potNow + " token pot)");
      if (legal.maxRaiseTo > top) {
        parts.push("allin: " + legal.maxRaiseTo + " (your entire stack) \u2014 a separate, deliberate choice, never the top of the raise range");
      }
    }
    return parts.join("; ");
  }
  function buildPrompt(p, legal) {
    const others = players.map(function(o) {
      const who = o.seat === p.seat ? "YOU" : o.kind === "human" ? "the human" : o.name;
      return "- seat " + o.seat + " " + who + ": stack " + o.stack + ", bet " + o.bet + (o.folded ? ", folded" : "") + (o.allIn ? ", all-in" : "") + (o.lastAction ? ", last " + o.lastAction : "");
    }).join("\n");
    const history = (state.actionLog || []).length ? (state.actionLog || []).join("\n") : "(no actions yet this hand)";
    return [
      "Hand #" + state.handNo + " \xB7 " + state.street + " \xB7 pot " + pot() + " tokens \xB7 current bet " + state.currentBet,
      "Blinds " + SB + "/" + BB + ". Your stack " + p.stack + " tokens (about " + Math.round(p.stack / BB) + " big blinds); you have " + p.bet + " tokens in front of you this street.",
      "Your hole cards: " + p.cards.map(cardTxt).join(" "),
      "Board: " + (state.board.length ? state.board.map(cardTxt).join(" ") : "(none)"),
      "Players:\n" + others,
      "Action so far:\n" + history,
      "Legal actions: " + describeLegal(legal),
      "\u9009\u62E9\u4E00\u4E2A\u5408\u6CD5\u52A8\u4F5C\u3002\u91D1\u989D\u8981\u548C\u5E95\u6C60\u76F8\u79F0\uFF1A\u9664\u975E\u4F60\u771F\u7684\u6253\u7B97\u628A\u5168\u90E8\u7B79\u7801\u538B\u4E0A\uFF08\u90A3\u624D\u9009 allin\uFF09\uFF0C\u5426\u5219\u4E0D\u8981\u628A raise \u7684 amount \u5199\u6210\u533A\u95F4\u4E0A\u754C\u3002talk \u5FC5\u987B\u662F\u7B80\u4F53\u4E2D\u6587\u95F2\u8BDD\uFF0C\u6700\u591A\u5341\u516D\u4E2A\u5B57\u3002\u7981\u6B62\u5728 talk \u91CC\u63D0\u5230\u5E95\u724C\u3001\u82B1\u8272\u3001\u70B9\u6570\u6216\u4EFB\u4F55\u63A8\u7406\u3002"
    ].join("\n\n");
  }
  function askAgent(p) {
    const legal = legalFor(p);
    const fallback = decideAi(p);
    const llm = ctx.get("llm");
    const models = ctx.get("agentDefaultModel");
    if (llm === void 0 || models === void 0) {
      state.agentModel = "heuristic";
      return Promise.resolve(fallback);
    }
    const sel = models.currentSelection();
    if (!sel || !sel.provider || !sel.model) {
      state.agentModel = "heuristic";
      return Promise.resolve(fallback);
    }
    state.agentModel = sel.provider + "/" + sel.model;
    const system = [
      "\u4F60\u662F\u5FB7\u5DDE\u6251\u514B\u724C\u684C\u4E0A\u7684\u73A9\u5BB6\u300C" + p.name + "\u300D" + (p.company ? "\uFF08" + p.company + "\uFF09" : "") + "\u3002",
      "\u98CE\u683C\uFF1A" + (p.style || p.tag || "\u5747\u8861"),
      "\u4F60\u53EA\u80FD\u770B\u89C1\u81EA\u5DF1\u7684\u5E95\u724C\u3002\u7B79\u7801\u5355\u4F4D\u662F tokens\u3002",
      "\u7528 holdem_act \u505A\u51FA\u4E00\u4E2A\u5408\u6CD5\u52A8\u4F5C\u3002amount \u662F\u52A0\u6CE8\u5230\u7684\u603B\u989D\u3002",
      "talk \u53EF\u9009\uFF0C\u5FC5\u987B\u662F\u7B80\u4F53\u4E2D\u6587\u684C\u8FB9\u95F2\u8BDD\uFF0C\u6700\u591A\u5341\u516D\u4E2A\u5B57\uFF0C\u7B26\u5408\u4EBA\u8BBE\u3002",
      "\u7EDD\u5BF9\u4E0D\u8981\u5728 talk \u91CC\u63D0\u5230\u5E95\u724C\u3001\u82B1\u8272\u3001\u70B9\u6570\u3001\u542C\u724C\u3001\u6210\u724C\u3001\u80DC\u7387\u6216\u4EFB\u4F55\u63A8\u7406\u8FC7\u7A0B\u3002"
    ].join("");
    const options = {
      provider: sel.provider,
      model: sel.model,
      system,
      messages: [{
        id: "hk-" + p.id + "-" + state.handNo + "-" + Date.now(),
        role: "user",
        content: [{ type: "text", text: buildPrompt(p, legal) }],
        source: { kind: "plugin", plugin: "holdem" }
      }],
      tools: [ACT_TOOL],
      temperature: 0.7,
      maxTokens: 700
    };
    if (sel.reasoningEffort) options.reasoningEffort = sel.reasoningEffort;
    return (async function() {
      let text = "";
      let toolArgs = "";
      for await (const chunk of llm.stream(options)) {
        if (chunk.type === "text-delta" && chunk.text) {
          text += chunk.text;
        } else if (chunk.type === "tool-call-delta" && chunk.argumentsDelta) {
          toolArgs += chunk.argumentsDelta;
        } else if (chunk.type === "block-end" && chunk.block && chunk.block.type === "tool-call") {
          toolArgs = chunk.block.arguments || toolArgs;
        } else if (chunk.type === "finish" && chunk.reason && (chunk.reason.kind === "error" || chunk.reason.kind === "aborted")) {
          const msg = chunk.reason.failure && chunk.reason.failure.message;
          throw new Error(msg || "llm finish " + chunk.reason.kind);
        }
      }
      const parsed = parseJsonObject(toolArgs) || parseJsonObject(text);
      return normalizeChoice(parsed, legal, fallback);
    })();
  }
  function commitAi(p, choice) {
    applyAction(p, choice.type, choice.amount);
    if (choice.talk) p.talk = choice.talk;
    state.actionLog = (state.actionLog || []).concat([state.street + ": " + p.name + " " + p.lastAction]).slice(-16);
    record({ kind: "action", name: p.name, emoji: p.emoji, playerId: p.id, action: p.lastAction, talk: p.talk || "" });
    afterAction();
    scheduleAi();
  }
  function runAi(seq, seat, handNo) {
    if (seq !== aiSeq) return;
    const p = players[seat];
    if (!p || p.kind !== "ai" || state.status !== "playing" || state.toAct !== seat || state.handNo !== handNo) return;
    askAgent(p).then(function(choice) {
      if (seq !== aiSeq) return;
      if (state.status !== "playing" || state.toAct !== seat || state.handNo !== handNo) return;
      commitAi(p, choice);
    }).catch(function(err) {
      console.error(err);
      if (seq !== aiSeq) return;
      if (state.status !== "playing" || state.toAct !== seat || state.handNo !== handNo) return;
      commitAi(p, decideAi(p));
    });
  }
  function scheduleAi() {
    clearAi();
    state.thinkEndsAt = 0;
    if (state.status !== "playing" || state.toAct == null) return;
    const p = players[state.toAct];
    if (!p || p.kind !== "ai") return;
    const seq = aiSeq;
    const seat = p.seat;
    const handNo = state.handNo;
    p.lastThought = "";
    p.talk = "";
    state.thinkEndsAt = Date.now() + 45e3;
    aiTimer = ctx.timeout(function() {
      aiTimer = null;
      runAi(seq, seat, handNo);
    }, 40);
  }
  function endGame(message) {
    clearAi();
    state.gameOver = true;
    state.status = "game-over";
    state.toAct = null;
    state.winners = [];
    state.revealed = false;
    state.sbSeat = null;
    state.bbSeat = null;
    state.dealer = null;
    for (let i = 0; i < players.length; i++) {
      players[i].cards = [];
      players[i].bet = 0;
      players[i].committed = 0;
      players[i].allIn = false;
      players[i].acted = false;
      players[i].lastAction = "";
    }
    log(message);
  }
  function dealHand() {
    clearAi();
    let liveCount = 0;
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const decision = rebuyDecision(p, { max: MAX_REBUYS, start: START_STACK });
      if (decision.action === "rebuy") {
        p.rebuys = decision.rebuys;
        p.stack = decision.stack;
        log(p.name + " \u91CD\u65B0\u4E70\u5165 " + START_STACK + "\uFF08\u7B2C " + p.rebuys + "/" + MAX_REBUYS + " \u6B21\uFF09");
      } else if (decision.action === "out" && !p.out) {
        p.out = true;
        log(p.name + " \u4E70\u5165\u7528\u5C3D\uFF0C\u51FA\u5C40");
      }
      if (!p.out) liveCount += 1;
      p.bet = 0;
      p.committed = 0;
      p.folded = !!p.out;
      p.allIn = false;
      p.acted = false;
      p.cards = [];
      p.lastAction = "";
      p.lastThought = "";
      p.talk = "";
    }
    if (liveCount < 2) {
      endGame("\u53EA\u5269\u4E00\u540D\u73A9\u5BB6\uFF0C\u724C\u684C\u7ED3\u675F\u3002\u70B9\u300CReset\u300D\u518D\u5F00\u4E00\u684C\u3002");
      return;
    }
    if (players[0].out) {
      endGame("\u4F60\u7684 " + MAX_REBUYS + " \u6B21\u4E70\u5165\u5DF2\u7ECF\u7528\u5B8C\uFF0C\u672C\u5C40\u7ED3\u675F\u3002\u70B9\u300CReset\u300D\u518D\u5F00\u4E00\u684C\u3002");
      return;
    }
    state.handNo += 1;
    let dealer = cw(state.dealer);
    for (let i = 0; i < players.length && players[dealer].out; i++) dealer = cw(dealer);
    state.dealer = dealer;
    state.deck = shuffle(makeDeck());
    state.board = [];
    state.street = "preflop";
    state.winners = [];
    state.revealed = false;
    state.status = "playing";
    state.lastPot = 0;
    state.actionLog = [];
    const activeSeats = players.filter(function(p) {
      return !p.out;
    }).map(function(p) {
      return p.seat;
    });
    const blinds = blindSeats(players.length, activeSeats, state.dealer);
    state.sbSeat = blinds.sb;
    state.bbSeat = blinds.bb;
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < players.length; i++) {
        const p = players[cw(state.dealer, 1 + i)];
        if (!p.out) p.cards.push(state.deck.pop());
      }
    }
    const sbSeat = blinds.sb;
    const bbSeat = blinds.bb;
    put(players[sbSeat], SB);
    players[sbSeat].lastAction = "\u5C0F\u76F2 " + players[sbSeat].bet;
    put(players[bbSeat], BB);
    players[bbSeat].lastAction = "\u5927\u76F2 " + players[bbSeat].bet;
    state.currentBet = players[bbSeat].bet;
    state.minRaise = BB;
    log("\u7B2C " + state.handNo + " \u624B \xB7 " + players[state.dealer].name + " \u5750\u5E84");
    record({ kind: "street", action: "\u7B2C " + state.handNo + " \u624B", street: "preflop", name: players[state.dealer].name, emoji: players[state.dealer].emoji, playerId: players[state.dealer].id });
    record({ kind: "action", name: players[sbSeat].name, emoji: players[sbSeat].emoji, playerId: players[sbSeat].id, action: players[sbSeat].lastAction, street: "preflop" });
    record({ kind: "action", name: players[bbSeat].name, emoji: players[bbSeat].emoji, playerId: players[bbSeat].id, action: players[bbSeat].lastAction, street: "preflop" });
    state.toAct = findNextActor(bbSeat);
    if (state.toAct == null) {
      maybeRunout();
      return;
    }
    scheduleAi();
  }
  function start() {
    state.handNo = 0;
    state.gameOver = false;
    state.dealer = Math.floor(Math.random() * players.length);
    for (let i = 0; i < players.length; i++) {
      players[i].stack = START_STACK;
      players[i].rebuys = 0;
      players[i].out = false;
    }
    state.log = [];
    log("\u65B0\u724C\u684C\uFF1A\u76F2\u6CE8 " + SB + "/" + BB + "\uFF0C\u8BB0\u5206\u724C " + START_STACK + "\uFF0C\u6BCF\u4EBA " + MAX_REBUYS + " \u6B21\u4E70\u5165");
    dealHand();
    return snapshot();
  }
  function nextHand() {
    if (state.gameOver) return snapshot();
    if (state.status === "idle") return start();
    if (state.status === "playing") return snapshot();
    dealHand();
    return snapshot();
  }
  function reset() {
    clearAi();
    state.status = "idle";
    state.handNo = 0;
    state.gameOver = false;
    state.dealer = null;
    state.board = [];
    state.toAct = null;
    state.sbSeat = null;
    state.bbSeat = null;
    state.winners = [];
    state.revealed = false;
    for (let i = 0; i < players.length; i++) {
      players[i].stack = START_STACK;
      players[i].rebuys = 0;
      players[i].out = false;
      players[i].bet = 0;
      players[i].committed = 0;
      players[i].folded = false;
      players[i].allIn = false;
      players[i].cards = [];
      players[i].lastAction = "";
    }
    state.log = ["\u724C\u684C\u5DF2\u91CD\u7F6E\u3002\u70B9\u51FB\u300C\u5F00\u59CB\u5BF9\u5C40\u300D\u3002"];
    state.timeline = [];
    state.actionLog = [];
    return snapshot();
  }
  function act(args) {
    const type = args && typeof args.type === "string" ? args.type : "";
    if (state.status !== "playing" || state.toAct !== 0) return snapshot();
    const p = players[0];
    applyAction(p, type, args && args.amount);
    state.actionLog = (state.actionLog || []).concat([state.street + ": you " + p.lastAction]).slice(-16);
    record({ kind: "action", name: "you", emoji: p.emoji, playerId: p.id, action: p.lastAction });
    afterAction();
    scheduleAi();
    return snapshot();
  }
  function setAvatar(args) {
    const id = args && args.id;
    if (!isPlayerId(id)) throw new Error("unknown player");
    const decoded = decodeAvatar(args);
    if (!decoded) throw new Error("invalid image");
    overrides[id] = writeOverride(avatarDir, id, decoded);
    return snapshot();
  }
  function clearAvatar(args) {
    const id = args && args.id;
    if (!isPlayerId(id)) throw new Error("unknown player");
    removeOverride(avatarDir, id);
    delete overrides[id];
    return snapshot();
  }
  function avatarFile(id) {
    if (overrides[id]) return overrides[id];
    return bundled[id] || null;
  }
  ctx.effect(function() {
    return function() {
      clearAi();
    };
  });
  return {
    snapshot,
    start,
    nextHand,
    reset,
    act,
    setAvatar,
    clearAvatar,
    avatarFile
  };
}
function readJson(req) {
  return new Promise(function(resolve, reject) {
    const chunks = [];
    req.on("data", function(chunk) {
      chunks.push(chunk);
    });
    req.on("end", function() {
      try {
        const raw = Buffer.concat(chunks).toString("utf8").trim();
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}
function sendJson(res, status, body) {
  const data = Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": String(data.length),
    "cache-control": "no-store"
  });
  res.end(data);
}
function sendBytes(res, mime, bytes) {
  res.writeHead(200, {
    "content-type": mime || "application/octet-stream",
    "content-length": String(bytes.length),
    "cache-control": "no-store"
  });
  res.end(bytes);
}
function methodFromUrl(url) {
  const path = String(url || "").split("?")[0];
  const rest = path.replace(/^\/dsh-holdem\/?/, "");
  return rest || "get-state";
}
var name = "dsh-holdem";
var inject = ["timer", "webServer"];
function apply(ctx) {
  const table = createTable(ctx);
  ctx.effect(function() {
    return ctx.webServer.register({
      kind: "prefix",
      path: "/dsh-holdem",
      handler: async function(req, res) {
        const method = methodFromUrl(req.url);
        try {
          if (req.method === "GET" && method.indexOf("avatar/") === 0) {
            const id = decodeURIComponent(method.slice("avatar/".length).split("/")[0]);
            const file = table.avatarFile(id);
            if (!file) {
              sendJson(res, 404, { error: "no override" });
              return;
            }
            sendBytes(res, file.mime, file.bytes);
            return;
          }
          if (req.method === "GET" || method === "get-state") {
            sendJson(res, 200, table.snapshot());
            return;
          }
          if (req.method !== "POST") {
            sendJson(res, 405, { error: "method not allowed" });
            return;
          }
          const args = await readJson(req);
          if (method === "start") sendJson(res, 200, table.start());
          else if (method === "act") sendJson(res, 200, table.act(args || {}));
          else if (method === "next-hand") sendJson(res, 200, table.nextHand());
          else if (method === "reset") sendJson(res, 200, table.reset());
          else if (method === "set-avatar") sendJson(res, 200, table.setAvatar(args || {}));
          else if (method === "clear-avatar") sendJson(res, 200, table.clearAvatar(args || {}));
          else sendJson(res, 404, { error: "unknown method" });
        } catch (err) {
          const msg = String(err && err.message || err);
          const code = /unknown player|invalid image/.test(msg) ? 400 : 500;
          sendJson(res, code, { error: msg });
        }
      }
    });
  });
}
export {
  apply,
  createTable,
  inject,
  name
};
