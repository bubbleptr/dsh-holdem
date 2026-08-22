/* dsh-holdem client bundle — generated from src/client.cjs */
window.__ModuleLoader__.load({
  id: "dsh-holdem",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client-css.cjs
var require_client_css = __commonJS({
  "src/client-css.cjs"(exports2, module2) {
    module2.exports = `
.hk-root{position:relative;flex:1;width:100%;min-height:0;height:100%;display:flex;flex-direction:column;background:#fff;color:#111;overflow:hidden;user-select:none;font-family:ui-sans-serif,system-ui,-apple-system,"SF Pro Text",sans-serif}
.hk-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.hk-top{flex:none;display:flex;align-items:center;gap:10px;padding:10px 16px 0}
.hk-title{font-size:13px;color:#111;font-weight:650}
.hk-meta{flex:1;min-width:0;font-size:12px;color:#8a8a8e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hk-chipbtn{cursor:pointer;border:1px solid #e7e7ea;background:#fff;color:#444;border-radius:999px;padding:5px 11px;font-size:12px}
.hk-chipbtn:hover{background:#fafafa}
.hk-chipbtn.go{background:#111;border-color:#111;color:#fff;padding:5px 14px;font-weight:650}
.hk-chipbtn.go:hover{background:#222}
.hk-chipbtn:disabled{opacity:.35;cursor:default}
.hk-body{flex:1;min-height:0;display:flex;overflow:hidden}
.hk-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:88px 112px 56px;container-type:size;overflow:visible}
.hk-play{display:flex;flex-direction:column;align-items:center;justify-content:center;width:min(1080px,100%,calc(100cqh * 2.15));max-width:100%;height:100%;min-height:0;padding:0;overflow:visible}
.hk-rail{flex:none;width:280px;min-width:240px;height:100%;border-left:1px solid #ececee;background:#fafafa;display:flex;flex-direction:column;min-height:0;overflow:hidden}
.hk-rail-h{flex:none;padding:14px 16px 2px;font-size:12px;font-weight:650;color:#111}
.hk-rail-tabs{flex:none;display:flex;padding:4px 8px 0;border-bottom:1px solid #ececee}
.hk-rail-tab{flex:1;cursor:pointer;border:0;background:transparent;color:#8a8a8e;font-size:12px;font-weight:650;padding:10px 8px 9px}
.hk-rail-tab.on{color:#111;box-shadow:inset 0 -2px 0 #111}
.hk-rail-sub{flex:none;padding:10px 16px 10px;font-size:11px;color:#8a8a8e}
.hk-av-list{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:0 10px 18px}
.hk-av-row{display:flex;align-items:center;gap:8px;padding:8px 6px;border-radius:10px}
.hk-av-name{flex:1;min-width:0;font-size:12px;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hk-av-file{display:none}
.hk-av-row .hk-chipbtn{padding:4px 9px;font-size:11px}
.hk-tl{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:0 10px 18px}
[data-slot="conversation.session"]:has(.hk-root){flex:1 1 0!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
[data-slot="conversation.session"]:has(.hk-root)>*{flex:1 1 0!important;min-height:0!important;overflow:hidden!important;max-height:100%!important}
.hk-tl-hand{font-size:10px;letter-spacing:.06em;color:#9a9aa1;padding:12px 6px 4px}
.hk-tl-street{display:flex;align-items:center;gap:8px;margin:8px 4px;font-size:11px;color:#8a8a8e}
.hk-tl-street:before,.hk-tl-street:after{content:"";flex:1;height:1px;background:#e7e7ea}
.hk-tl-row{display:flex;gap:8px;padding:7px 6px;border-radius:10px}
.hk-tl-ico{width:20px;height:20px;flex:none;border-radius:50%;overflow:hidden;background:#111;display:flex;align-items:center;justify-content:center;font-size:11px;line-height:20px;color:#fff}
.hk-tl-main{min-width:0}
.hk-tl-name{font-size:12px;font-weight:650;color:#111}
.hk-tl-act{font-size:11px;color:#6f6f73;margin-top:1px}
.hk-tl-talk{margin-top:5px;font-size:12px;line-height:1.35;color:#111;background:#fff;border:1px solid #ececee;border-radius:10px;padding:6px 8px}
.hk-tl-empty{padding:28px 10px;font-size:12px;color:#9a9aa1;line-height:1.5}
.hk-table{position:relative;width:100%;height:auto;max-height:min(520px,calc(100cqh - 180px));aspect-ratio:2.15 / 1;background:#fafafa;border:1px solid #e7e7e7;border-radius:9999px;margin-bottom:52px}
.hk-center{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px}
.hk-pot{font-size:12px;color:#5b5b60;font-weight:600;background:#fff;border:1px solid #e7e7ea;border-radius:999px;padding:5px 10px}
.hk-board{display:flex;gap:10px;min-height:100px;align-items:center;justify-content:center}
.hk-banner{max-width:360px;text-align:center;font-size:12px;line-height:1.45;color:#666;background:#fff;border:1px solid #ececee;border-radius:12px;padding:8px 12px}
.hk-seat{position:absolute;width:168px;display:flex;flex-direction:column;align-items:center;gap:6px;z-index:2;overflow:visible}
.hk-seat.folded{opacity:.4}
.hk-seat.s0 .hk-status,.hk-seat.top .hk-status{position:absolute;left:50%;top:calc(100% + 8px);bottom:auto;transform:translateX(-50%)}
.hk-badge{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;z-index:2}
.hk-pill{position:relative;z-index:3}
.hk-cards{position:absolute;left:50%;top:0;width:70px;height:52px;pointer-events:none;z-index:1;transform:translate(-50%,-80%)}
.hk-cards .hk-card{position:absolute;top:0;width:38px;height:54px;padding:0}
.hk-cards .hk-card.fan-l{left:0;transform:rotate(-16deg);transform-origin:50% 110%}
.hk-cards .hk-card.fan-r{left:24px;transform:rotate(16deg);transform-origin:50% 110%}
.hk-seat.s0 .hk-cards{width:86px;height:64px}
.hk-seat.s0 .hk-cards .hk-card{width:48px;height:68px}
.hk-seat.s0 .hk-cards .hk-card.fan-r{left:28px}
.hk-card{width:64px;height:90px;border-radius:10px;background:#fff;color:#171717;position:relative;padding:0;font-weight:750;border:1px solid #e8e8eb;font-size:18px;line-height:1;box-shadow:0 1px 2px rgba(0,0,0,.04);overflow:hidden}
.hk-rank{position:absolute;top:4px;left:5px;font-size:13px;line-height:1;font-weight:750}
.hk-suit{position:absolute;left:50%;top:56%;transform:translate(-50%,-50%);font-size:22px;line-height:1}
.hk-board .hk-rank{top:6px;left:7px;font-size:16px}
.hk-board .hk-suit{font-size:30px}
.hk-cards .hk-rank{top:3px;left:4px;font-size:11px}
.hk-cards .hk-suit{font-size:16px}
.hk-seat.s0 .hk-rank{top:4px;left:5px;font-size:13px}
.hk-seat.s0 .hk-suit{font-size:20px}
.hk-card.red{color:#e11d48}
.hk-card.back{display:flex;align-items:center;justify-content:center;padding:0;background:#fff;color:#111}
.hk-card.empty{background:#f3f3f4;border:1px dashed #ddd;box-shadow:none;color:transparent}
.hk-pill{display:flex;align-items:center;gap:8px;min-width:148px;background:#fff;border:1px solid #e7e7ea;border-radius:999px;padding:5px 10px 5px 5px}
.hk-potbet{font-size:10px;font-weight:650;color:#8a5a00;background:#fff8e6;border:1px solid #f0dca8;border-radius:999px;padding:2px 8px;white-space:nowrap}
.hk-winbadge{font-size:11px;font-weight:800;color:#fff;background:linear-gradient(135deg,#f59e0b,#f97316);border-radius:999px;padding:2px 10px;box-shadow:0 2px 8px rgba(245,158,11,.45);white-space:nowrap;animation:hk-winpulse 1.1s ease-in-out infinite}
.hk-seat.winner .hk-pill{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.30)}
.hk-seat.winner{z-index:5}
@keyframes hk-winpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.hk-banner.hk-winner-banner{display:flex;flex-direction:column;align-items:center;gap:2px;max-width:min(420px,86vw);color:#92400e;background:#fffbeb;border:1px solid #fcd34d;font-weight:700;font-size:13px;line-height:1.35;text-wrap:balance;font-variant-numeric:tabular-nums}
.hk-winner-h{font-weight:700}
.hk-winner-sub{font-weight:600;font-size:11px;color:#a16207}
.hk-seat.toact .hk-pill{border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59,130,246,.18)}
.hk-avatar{width:34px;height:34px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#111;flex:none}
.hk-avatar canvas,.hk-avatar img,.hk-tl-ico canvas,.hk-tl-ico img{width:100%;height:100%;object-fit:cover;display:block}
.hk-avatar canvas,.hk-tl-ico canvas{image-rendering:pixelated;image-rendering:crisp-edges}
.hk-name{min-width:0;font-size:12px;font-weight:650;color:#111;display:flex;align-items:center;gap:4px;max-width:118px}
.hk-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hk-d{flex:none;width:16px;height:16px;border-radius:50%;background:#111;color:#fff;font-size:9px;font-weight:750;display:flex;align-items:center;justify-content:center;letter-spacing:0}
.hk-d.hk-bb{background:#6f6f73}
.hk-d.hk-sb{background:#fff;color:#555;border:1px solid #d0d0d5}
.hk-stack{flex:none;margin-left:auto;white-space:nowrap;font-size:11px;color:#8a8a8e}
.hk-status{max-width:168px;font-size:11px;font-weight:600;color:#3b82f6;background:#eef4ff;border-radius:999px;padding:3px 8px;line-height:1.25;text-align:center}
.hk-status.talk{color:#444;background:#f4f4f5}
.hk-status.off{visibility:hidden}
.hk-dock{flex:none;width:100%;padding:0 8px 4px;display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;z-index:6}
.hk-panel{display:flex;align-items:center;gap:10px;background:#f4f4f5;border-radius:999px;padding:7px 10px 7px 8px}
.hk-pre{cursor:pointer;border:0;background:transparent;color:#444;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:650}
.hk-pre.on{background:#fff;color:#111;box-shadow:0 0 0 1px rgba(0,0,0,.08)}
.hk-slider{width:168px;accent-color:#3b82f6}
.hk-amt{font-size:12px;color:#6f6f73;font-weight:650;min-width:92px;text-align:right;font-variant-numeric:tabular-nums}
.hk-actions{display:flex;align-items:center;justify-content:center;gap:10px}
.hk-btn{cursor:pointer;border:1px solid #e5e5e7;background:#fff;color:#111;border-radius:14px;padding:12px 18px;font-size:15px;font-weight:700;min-width:132px}
.hk-btn:disabled{opacity:.35;cursor:default}
.hk-raise,.hk-go{background:#111;border-color:#111;color:#fff}
.hk-wait{font-size:13px;color:#8a8a8e;padding:10px 0}
.hk-err{color:#e11d48;font-size:12px;padding:0 16px 8px}
.hk-v{width:12px;height:12px;flex:none}
`;
  }
});

// src/format.js
var format_exports = {};
__export(format_exports, {
  fmt: () => fmt,
  formatWinnerLines: () => formatWinnerLines
});
function fmt(n) {
  n = Math.floor(Number(n) || 0);
  const abs = Math.abs(n);
  if (abs >= 1e6) {
    const v = n / 1e6;
    const s = abs >= 1e7 ? String(Math.round(v)) : String(Math.round(v * 100) / 100);
    return s + "M";
  }
  if (abs >= 1e3) {
    const v = n / 1e3;
    const s = abs >= 1e4 ? String(Math.round(v)) : String(Math.round(v * 100) / 100);
    return s + "K";
  }
  return String(n);
}
function namesOf(w) {
  return (w.names || []).join("\u3001");
}
function potLabel(i, n) {
  if (i === 0) return "\u4E3B\u6C60";
  if (n === 2) return "\u8FB9\u6C60";
  return "\u8FB9\u6C60" + i;
}
function verbOf(w) {
  return w.names && w.names.length > 1 ? "\u5E73\u5206" : "\u8D62\u4E0B";
}
function sameResult(a, b) {
  return namesOf(a) === namesOf(b) && a.handName === b.handName;
}
function formatWinnerLines(winners) {
  if (!winners || !winners.length) return [];
  if (winners.length === 1 && winners[0].handName === "\u65E0\u4EBA\u8DDF\u6CE8") {
    return [namesOf(winners[0]) + " \u6536\u8D70\u5E95\u6C60 " + fmt(winners[0].amount) + " \u7B79\u7801"];
  }
  const allSame = winners.every(function(w) {
    return sameResult(w, winners[0]);
  });
  if (allSame) {
    const w = winners[0];
    let total = 0;
    for (let i = 0; i < winners.length; i++) total += winners[i].amount || 0;
    const headline = namesOf(w) + " \u4EE5" + w.handName + verbOf(w) + " " + fmt(total) + " \u7B79\u7801";
    if (winners.length === 1) return [headline];
    const pots = winners.map(function(x, i) {
      return potLabel(i, winners.length) + " " + fmt(x.amount);
    }).join(" \xB7 ");
    return [headline, pots];
  }
  return winners.map(function(w, i) {
    return potLabel(i, winners.length) + " " + fmt(w.amount) + " \xB7 " + namesOf(w) + " \u4EE5" + w.handName + verbOf(w);
  });
}
var init_format = __esm({
  "src/format.js"() {
  }
});

// src/bets.js
var bets_exports = {};
__export(bets_exports, {
  raisePresets: () => raisePresets,
  raiseSizeForPct: () => raiseSizeForPct
});
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function raiseSizeForPct(pct, opts) {
  const pot = Number(opts.pot) || 0;
  const currentBet = Number(opts.currentBet) || 0;
  const minR = Number(opts.minR) || 0;
  const maxR = Number(opts.maxR) || 0;
  if (maxR <= 0) return 0;
  let raw = Math.floor(currentBet + pot * (pct / 100));
  if (raw >= maxR) raw = Math.floor(maxR * (pct / 100));
  return clamp(raw, minR, maxR);
}
function raisePresets(opts) {
  const pcts = opts.pcts || DEFAULT_PCTS;
  const maxR = Number(opts.maxR) || 0;
  const seen = /* @__PURE__ */ Object.create(null);
  const out = [];
  for (let i = 0; i < pcts.length; i++) {
    const pct = pcts[i];
    const v = raiseSizeForPct(pct, opts);
    if (v <= 0 || v >= maxR) continue;
    if (seen[v]) continue;
    seen[v] = true;
    out.push({ label: pct + "%", v });
  }
  return out;
}
var DEFAULT_PCTS;
var init_bets = __esm({
  "src/bets.js"() {
    DEFAULT_PCTS = [25, 33, 75, 133];
  }
});

// src/identicon.js
var identicon_exports = {};
__export(identicon_exports, {
  IDENTICON_PX: () => IDENTICON_PX,
  identiconModel: () => identiconModel,
  paintIdenticon: () => paintIdenticon
});
function fnv1a(str) {
  let h2 = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h2 ^= str.charCodeAt(i);
    h2 = Math.imul(h2, 16777619);
  }
  return h2 >>> 0;
}
function xorshift32(seed) {
  let s = seed || 2654435769;
  return function() {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}
function hueFill(hue) {
  const h2 = (hue % 360 + 360) % 360;
  const s = 0.85;
  const l = 0.58;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(h2 / 60 % 2 - 1));
  const m = l - c / 2;
  let r;
  let g;
  let b;
  if (h2 < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h2 < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h2 < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h2 < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h2 < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}
function identiconModel(seed) {
  const name = String(seed || "");
  const rand = xorshift32(fnv1a(name));
  const bits = [];
  for (let i = 0; i < 32; i++) bits.push(rand() < 0.5);
  const vertical = rand() < 0.5;
  const hue = Math.floor(rand() * 180) * 2;
  const halfDensity = [];
  for (let i = 0; i < 32; i++) halfDensity.push(0.55 + rand() * 0.45);
  const on = new Array(GRID * GRID);
  const density = new Array(GRID * GRID);
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const i = vertical ? Math.min(r, GRID - 1 - r) * GRID + c : r * (GRID / 2) + Math.min(c, GRID - 1 - c);
      on[r * GRID + c] = bits[i];
      density[r * GRID + c] = halfDensity[i];
    }
  }
  return { on, density, fill: hueFill(hue) };
}
function rgba(fill, alpha) {
  return "rgba(" + fill[0] + "," + fill[1] + "," + fill[2] + "," + alpha + ")";
}
function paintIdenticon(canvas, seed) {
  if (!canvas || !canvas.getContext) return;
  const model = identiconModel(seed);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const px = GRID * CELL_PX;
  canvas.width = px;
  canvas.height = px;
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, px, px);
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (!model.on[r * GRID + c]) continue;
      const dens = model.density[r * GRID + c];
      const base = 0.35 + 0.65 * dens;
      for (let py = 0; py < CELL_PX; py++) {
        for (let pxi = 0; pxi < CELL_PX; pxi++) {
          const gx = c * CELL_PX + pxi;
          const gy = r * CELL_PX + py;
          const lit = dens > BAYER4[gy & 3][gx & 3];
          const alpha = lit ? base : base * 0.35;
          ctx.fillStyle = rgba(model.fill, alpha);
          ctx.fillRect(gx, gy, 1, 1);
        }
      }
    }
  }
}
var GRID, CELL_PX, BG, BAYER4, IDENTICON_PX;
var init_identicon = __esm({
  "src/identicon.js"() {
    GRID = 8;
    CELL_PX = 4;
    BG = "#111111";
    BAYER4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ].map(function(row) {
      return row.map(function(v) {
        return (v + 0.5) / 16;
      });
    });
    IDENTICON_PX = GRID * CELL_PX;
  }
});

// src/client.cjs
var React = require("react");
var h = React.createElement;
var API = "/dsh-holdem";
function rpc(method, args) {
  const isGet = method === "get-state";
  return fetch(API + "/" + method, {
    method: isGet ? "GET" : "POST",
    headers: isGet ? void 0 : { "content-type": "application/json" },
    body: isGet ? void 0 : JSON.stringify(args || {})
  }).then(function(res) {
    return res.json().then(function(body) {
      if (!res.ok) throw new Error(body && body.error || "holdem " + res.status);
      return body;
    });
  });
}
var CSS = require_client_css();
var { fmt: fmt2, formatWinnerLines: formatWinnerLines2 } = (init_format(), __toCommonJS(format_exports));
var { raisePresets: raisePresets2 } = (init_bets(), __toCommonJS(bets_exports));
var { paintIdenticon: paintIdenticon2 } = (init_identicon(), __toCommonJS(identicon_exports));
var SUIT = { s: "\u2660", h: "\u2665", d: "\u2666", c: "\u2663" };
var RANK = { 14: "A", 13: "K", 12: "Q", 11: "J", 10: "10", 9: "9", 8: "8", 7: "7", 6: "6", 5: "5", 4: "4", 3: "3", 2: "2" };
var STREET = { idle: "\u5927\u5385", preflop: "\u7FFB\u524D", flop: "\u7FFB\u724C", turn: "\u8F6C\u724C", river: "\u6CB3\u724C", showdown: "\u644A\u724C", "hand-over": "\u672C\u624B\u7ED3\u675F" };
function clamp2(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
var TABLE_ASPECT = 2.15;
function seatPos(seat) {
  const rx = 50 / TABLE_ASPECT;
  if (seat === 0) return { left: "50%", top: "100%", transform: "translate(-50%, -50%)" };
  if (seat === 3) return { left: "50%", top: "0%", transform: "translate(-50%, -50%)" };
  const spec = {
    1: { cx: 100 - rx, ang: 38 },
    2: { cx: 100 - rx, ang: -38 },
    4: { cx: rx, ang: 218 },
    5: { cx: rx, ang: 142 }
  }[seat];
  const rad = spec.ang * Math.PI / 180;
  return {
    left: spec.cx + rx * Math.cos(rad) + "%",
    top: 50 + 50 * Math.sin(rad) + "%",
    transform: "translate(-50%, -50%)"
  };
}
function seatIsTop(seat) {
  return seat === 2 || seat === 3 || seat === 4;
}
function Identicon(props) {
  const seed = props.seed || "";
  const ref = React.useRef(null);
  React.useEffect(function() {
    paintIdenticon2(ref.current, seed);
  }, [seed]);
  return h("canvas", {
    ref,
    className: "hk-identicon",
    width: 32,
    height: 32,
    "aria-hidden": "true"
  });
}
function PlayerMark(props) {
  const p = props.player || {};
  const avatar = p.avatar || {};
  if (avatar.src) {
    return h("img", { className: "hk-avatar-img", src: avatar.src, alt: "" });
  }
  return h(Identicon, { seed: avatar.seed || p.id || "" });
}
function playerLabel(p) {
  if (!p) return "";
  return p.id === "hero" ? "you" : p.name || p.id;
}
function TimelineBody(props) {
  const items = props.items || [];
  const byId = props.byId || {};
  const ref = React.useRef(null);
  React.useEffect(function() {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items.length]);
  const nodes = [];
  let lastHand = null;
  for (let i = 0; i < items.length; i++) {
    const ev = items[i];
    if (ev.handNo && ev.handNo !== lastHand) {
      lastHand = ev.handNo;
      nodes.push(h("div", { key: "h" + ev.id, className: "hk-tl-hand" }, "\u7B2C " + ev.handNo + " \u624B"));
    }
    if (ev.kind === "street") {
      nodes.push(h("div", { key: ev.id, className: "hk-tl-street" }, ev.action || ev.street));
      continue;
    }
    const markPlayer = ev.playerId && byId[ev.playerId] || (ev.playerId ? { id: ev.playerId, avatar: { kind: "identicon", seed: ev.playerId } } : null);
    nodes.push(h(
      "div",
      { key: ev.id, className: "hk-tl-row" },
      h(
        "div",
        { className: "hk-tl-ico" },
        markPlayer ? h(PlayerMark, { player: markPlayer }) : ev.emoji || "\u2022"
      ),
      h(
        "div",
        { className: "hk-tl-main" },
        h("div", { className: "hk-tl-name" }, ev.name || "\u724C\u684C"),
        ev.action ? h("div", { className: "hk-tl-act" }, ev.action) : null,
        ev.talk ? h("div", { className: "hk-tl-talk" }, ev.talk) : null
      )
    ));
  }
  return h(
    "div",
    { className: "hk-tl", ref },
    nodes.length ? nodes : h("div", { className: "hk-tl-empty" }, "\u5F00\u59CB\u4E00\u624B\u724C\u540E\uFF0C\u884C\u52A8\u548C\u95F2\u8BDD\u4F1A\u51FA\u73B0\u5728\u8FD9\u91CC\u3002")
  );
}
function AvatarRow(props) {
  const p = props.player;
  const inputRef = React.useRef(null);
  const override = !!(p.avatar && p.avatar.kind === "override");
  return h(
    "div",
    { className: "hk-av-row" },
    h("div", { className: "hk-avatar" }, h(PlayerMark, { player: p })),
    h("div", { className: "hk-av-name" }, playerLabel(p)),
    h("input", {
      ref: inputRef,
      type: "file",
      accept: "image/png,image/jpeg,image/webp",
      className: "hk-av-file",
      onChange: function(e) {
        const file = e.target.files && e.target.files[0];
        e.target.value = "";
        if (file) props.onSetAvatar(p.id, file);
      }
    }),
    h("button", {
      type: "button",
      className: "hk-chipbtn",
      disabled: props.busy,
      onClick: function() {
        if (inputRef.current) inputRef.current.click();
      }
    }, "\u66F4\u6362"),
    h("button", {
      type: "button",
      className: "hk-chipbtn",
      disabled: props.busy || !override,
      onClick: function() {
        props.onClearAvatar(p.id);
      }
    }, "\u6062\u590D\u9ED8\u8BA4")
  );
}
function Rail(props) {
  const [tab, setTab] = React.useState("timeline");
  const players = props.players || [];
  const byId = {};
  for (let i = 0; i < players.length; i++) byId[players[i].id] = players[i];
  return h(
    "aside",
    { className: "hk-rail" },
    h(
      "div",
      { className: "hk-rail-tabs" },
      h("button", {
        type: "button",
        className: "hk-rail-tab" + (tab === "timeline" ? " on" : ""),
        onClick: function() {
          setTab("timeline");
        }
      }, "\u65F6\u95F4\u7EBF"),
      h("button", {
        type: "button",
        className: "hk-rail-tab" + (tab === "avatar" ? " on" : ""),
        onClick: function() {
          setTab("avatar");
        }
      }, "\u5934\u50CF")
    ),
    tab === "timeline" ? [
      h("div", { key: "sub", className: "hk-rail-sub" }, "\u884C\u52A8\u4E0E\u684C\u8FB9\u95F2\u8BDD"),
      h(TimelineBody, { key: "tl", items: props.items, byId })
    ] : [
      h("div", { key: "sub", className: "hk-rail-sub" }, "\u4E0A\u4F20\u56FE\u7247\u8986\u76D6\u9ED8\u8BA4\u5934\u50CF"),
      h(
        "div",
        { key: "list", className: "hk-av-list" },
        players.map(function(p) {
          return h(AvatarRow, {
            key: p.id,
            player: p,
            busy: props.busy,
            onSetAvatar: props.onSetAvatar,
            onClearAvatar: props.onClearAvatar
          });
        })
      )
    ]
  );
}
var BRAND = {
  openai: { bg: "#10a37f", fg: "#fff" },
  anthropic: { bg: "#D97757", fg: "#fff" },
  xai: { bg: "#111111", fg: "#fff" },
  deepseek: { bg: "#4d6bfe", fg: "#fff" },
  nvidia: { bg: "#74b71b", fg: "#fff" },
  hero: { bg: "#3b82f6", fg: "#fff" }
};
var LOBE_ICON = {
  openai: "M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z",
  anthropic: "M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z",
  xai: "M6.469 8.776L16.512 23h-4.464L2.005 8.776H6.47zm-.004 7.9l2.233 3.164L6.467 23H2l4.465-6.324zM22 2.582V23h-3.659V7.764L22 2.582zM22 1l-9.952 14.095-2.233-3.163L17.533 1H22z",
  deepseek: "M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z",
  nvidia: "M10.212 8.976V7.62c.127-.01.256-.017.388-.021 3.596-.117 5.957 3.184 5.957 3.184s-2.548 3.647-5.282 3.647a3.227 3.227 0 01-1.063-.175v-4.109c1.4.174 1.681.812 2.523 2.258l1.873-1.627a4.905 4.905 0 00-3.67-1.846 6.594 6.594 0 00-.729.044m0-4.476v2.025c.13-.01.259-.019.388-.024 5.002-.174 8.261 4.226 8.261 4.226s-3.743 4.69-7.643 4.69c-.338 0-.675-.031-1.007-.092v1.25c.278.038.558.057.838.057 3.629 0 6.253-1.91 8.794-4.169.421.347 2.146 1.193 2.501 1.564-2.416 2.083-8.048 3.763-11.24 3.763-.308 0-.603-.02-.894-.048V19.5H24v-15H10.21zm0 9.756v1.068c-3.356-.616-4.287-4.21-4.287-4.21a7.173 7.173 0 014.287-2.138v1.172h-.005a3.182 3.182 0 00-2.502 1.178s.615 2.276 2.507 2.931m-5.961-3.3c1.436-1.935 3.604-3.148 5.961-3.336V6.523C5.81 6.887 2 10.723 2 10.723s2.158 6.427 8.21 7.015v-1.166C5.77 16 4.25 10.958 4.25 10.958h-.002z"
};
function BrandMark(brand, size, color) {
  const d = LOBE_ICON[brand];
  if (!d) return null;
  return h("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: color || "#fff",
    fillRule: "evenodd",
    "aria-hidden": "true"
  }, h("path", { d }));
}
function Verified() {
  return h(
    "svg",
    { className: "hk-v", viewBox: "0 0 16 16", "aria-hidden": "true" },
    h("circle", { cx: 8, cy: 8, r: 7, fill: "#3b82f6" }),
    h("path", { d: "M4.8 8.15l2.05 2.05 4.35-4.4", stroke: "#fff", strokeWidth: 1.6, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" })
  );
}
function cardView(card, opts) {
  opts = opts || {};
  const small = !!opts.small;
  const backBrand = opts.backBrand || "";
  const fan = opts.fan || "";
  const cls = "hk-card" + (small ? " sm" : "") + (fan ? " fan-" + fan : "");
  if (!card) return h("div", { className: cls + " empty" });
  if (card === "back") {
    const pal = BRAND[backBrand];
    const showLogo = !!(backBrand && backBrand !== "hero" && pal);
    return h("div", { className: cls + " back" }, showLogo ? BrandMark(backBrand, small ? 14 : 22, pal.bg) : null);
  }
  const red = card.s === "h" || card.s === "d";
  return h(
    "div",
    { className: cls + (red ? " red" : "") },
    h("span", { className: "hk-rank" }, RANK[card.r] || card.r),
    h("span", { className: "hk-suit" }, SUIT[card.s] || "")
  );
}
function holePair(p) {
  if (!p.hasCards) return null;
  const face = p.cards && p.cards.length === 2 && !p.folded;
  const base = { small: p.seat !== 0, backBrand: p.kind === "ai" ? p.brand || "" : "" };
  const left = Object.assign({}, base, { fan: "l" });
  const right = Object.assign({}, base, { fan: "r" });
  return h(
    "div",
    { className: "hk-cards" },
    cardView(face ? p.cards[0] : "back", left),
    cardView(face ? p.cards[1] : "back", right)
  );
}
function seatView(p, thinkLabel, isWinner) {
  const thinking = !!(p.isToAct && p.kind === "ai");
  const statusText = thinking ? thinkLabel || "\u601D\u8003\u4E2D" : p.talk || "";
  const top = seatIsTop(p.seat);
  const pill = h(
    "div",
    { className: "hk-pill" },
    h("div", { className: "hk-avatar" }, h(PlayerMark, { player: p })),
    h(
      "div",
      { className: "hk-name" },
      h("span", {}, playerLabel(p)),
      p.isDealer ? h("span", { className: "hk-d", title: "\u5E84\u5BB6" }, "\u5E84") : p.isBb ? h("span", { className: "hk-d hk-bb", title: "\u5927\u76F2" }, "\u5927") : p.isSb ? h("span", { className: "hk-d hk-sb", title: "\u5C0F\u76F2" }, "\u5C0F") : Verified()
    ),
    h("div", { className: "hk-stack" }, fmt2(p.stack) + " \u7B79\u7801")
  );
  const below = isWinner ? h("div", { className: "hk-winbadge" }, "\u{1F3C6} Winner") : p.committed > 0 ? h("div", { className: "hk-potbet" }, "\u6295\u5165 " + fmt2(p.committed)) : null;
  const status = h("div", { className: "hk-status" + (statusText ? thinking ? "" : " talk" : " off") }, statusText || "idle");
  return h(
    "div",
    {
      key: p.id,
      className: "hk-seat s" + p.seat + (top ? " top" : "") + (p.isToAct ? " toact" : "") + (p.folded ? " folded" : "") + (isWinner ? " winner" : ""),
      style: seatPos(p.seat)
    },
    h("div", { className: "hk-badge" }, holePair(p), pill, below),
    status
  );
}
function findScrollPort(el) {
  var view = el.ownerDocument && el.ownerDocument.defaultView;
  var p = el.parentElement;
  var rootEl = el.ownerDocument && el.ownerDocument.documentElement;
  while (p && p !== rootEl) {
    var oy = view ? view.getComputedStyle(p).overflowY : "";
    if (oy === "auto" || oy === "scroll") return p;
    p = p.parentElement;
  }
  return el.parentElement;
}
function useLockToScrollPort(root) {
  React.useEffect(function() {
    if (!root) return;
    var view = root.ownerDocument && root.ownerDocument.defaultView;
    var port = findScrollPort(root);
    function fit() {
      var h2 = port && port.clientHeight || root.parentElement && root.parentElement.clientHeight || 0;
      if (h2 > 0) {
        root.style.height = h2 + "px";
        root.style.maxHeight = h2 + "px";
      }
    }
    fit();
    var RO = view && view.ResizeObserver;
    var ro = RO ? new RO(fit) : null;
    if (ro) {
      if (port) ro.observe(port);
      if (root.parentElement) ro.observe(root.parentElement);
    }
    function onWheel(e) {
      var tl = root.querySelector(".hk-tl");
      if (tl && (e.target === tl || tl.contains(e.target))) {
        var dy = e.deltaY;
        if (e.deltaMode === 1) dy *= 16;
        if (e.deltaMode === 2) dy *= tl.clientHeight;
        var max = Math.max(0, tl.scrollHeight - tl.clientHeight);
        tl.scrollTop = Math.min(max, Math.max(0, tl.scrollTop + dy));
      }
      e.preventDefault();
      e.stopPropagation();
    }
    root.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return function() {
      if (ro) ro.disconnect();
      root.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [root]);
}
function Table(props) {
  const [rootEl, setRootEl] = React.useState(null);
  useLockToScrollPort(rootEl);
  const state = props.state;
  const busy = props.busy;
  const now = props.now || 0;
  const onStart = props.onStart;
  const onNext = props.onNext;
  const onReset = props.onReset;
  const onAct = props.onAct;
  const legal = state && state.legal || {};
  const minR = legal.minRaiseTo || 0;
  const maxR = legal.maxRaiseTo || 0;
  const [raiseTo, setRaiseTo] = React.useState(minR);
  React.useEffect(function() {
    setRaiseTo(minR);
  }, [minR, state && state.handNo, state && state.street]);
  if (!state) return h("div", { className: "hk-root", ref: setRootEl }, h("div", { className: "hk-wait", style: { padding: 24 } }, "\u8FDE\u63A5\u4E2D\u2026"));
  const acting = (state.players || []).find(function(p) {
    return p.isToAct;
  });
  const winnerLines = formatWinnerLines2(state.winners || []);
  const winnerSeats = {};
  for (let i = 0; i < (state.winners || []).length; i++) {
    const seats = state.winners[i].seats || [];
    for (let j = 0; j < seats.length; j++) winnerSeats[seats[j]] = true;
  }
  const idle = state.status === "idle";
  const over = state.status === "hand-over";
  const myTurn = state.status === "playing" && state.toAct === 0;
  const board = state.board || [];
  const boardSlots = [0, 1, 2, 3, 4].map(function(i) {
    return board[i] || null;
  });
  const dealer = (state.players || []).find(function(p) {
    return p.isDealer;
  });
  const dealerBrand = dealer && dealer.kind === "ai" && dealer.brand ? dealer.brand : "hero";
  const boardOpts = { small: false, backBrand: dealerBrand, rimBrand: dealerBrand };
  const pot = state.pot || 0;
  const presets = raisePresets2({
    pot,
    currentBet: state.currentBet || 0,
    minR,
    maxR
  });
  const chosen = clamp2(raiseTo || minR, minR || 0, maxR || 0);
  let thinkLabel = "";
  if (acting && acting.kind === "ai" && state.thinkEndsAt) {
    const left = Math.max(0, Math.ceil((state.thinkEndsAt - now) / 1e3));
    thinkLabel = "\u601D\u8003\u4E2D \xB7 " + left + "\u79D2";
  }
  return h(
    "div",
    { className: "hk-root", ref: setRootEl },
    h(
      "div",
      { className: "hk-body" },
      h(
        "div",
        { className: "hk-main" },
        h(
          "div",
          { className: "hk-top" },
          h("div", { className: "hk-title" }, "No-Limit Inference"),
          h(
            "div",
            { className: "hk-meta" },
            idle ? "\u516D\u4EBA\u684C \xB7 Altman / \u8FBE\u91CC\u5965 / \u9A6C\u65AF\u514B / \u6881\u6587\u5CF0 / \u9EC4\u4EC1\u52CB" : "\u7B2C " + state.handNo + " \u624B \xB7 " + (STREET[state.street] || state.street) + (state.agentModel ? " \xB7 " + state.agentModel : "")
          ),
          idle ? h("button", { className: "hk-chipbtn go", disabled: busy, onClick: onStart }, "Start") : null,
          h("button", { className: "hk-chipbtn", onClick: onReset }, "Reset")
        ),
        h(
          "div",
          { className: "hk-stage" },
          h(
            "div",
            { className: "hk-play" },
            h(
              "div",
              { className: "hk-table" },
              h(
                "div",
                { className: "hk-center" },
                idle ? null : h("div", { className: "hk-pot" }, "\u5E95\u6C60 " + fmt2(state.pot || state.lastPot || 0) + " \u7B79\u7801"),
                h(
                  "div",
                  { className: "hk-board" },
                  boardSlots.map(function(c, i) {
                    return h("div", { key: i }, cardView(c || "back", boardOpts));
                  })
                ),
                idle ? h("div", { className: "hk-banner" }, "\u4E94\u4F4D\u73A9\u5BB6\u5165\u5EA7\u3002\u6BCF\u4EBA\u53EA\u80FD\u770B\u89C1\u81EA\u5DF1\u7684\u5E95\u724C\u3002") : null,
                over && winnerLines.length ? h(
                  "div",
                  { className: "hk-banner hk-winner-banner" },
                  winnerLines.map(function(line, i) {
                    return h("div", {
                      key: i,
                      className: i === 0 ? "hk-winner-h" : "hk-winner-sub"
                    }, (i === 0 ? "\u{1F3C6} " : "") + line);
                  })
                ) : null
              ),
              (state.players || []).map(function(p) {
                return seatView(p, thinkLabel, !!winnerSeats[p.seat]);
              })
            ),
            idle ? null : h(
              "div",
              { className: "hk-dock" },
              over ? h(
                "div",
                { className: "hk-actions" },
                h("button", { className: "hk-btn hk-go", disabled: busy, onClick: onNext }, "\u4E0B\u4E00\u624B")
              ) : myTurn ? [
                legal.raise && maxR > minR ? h(
                  "div",
                  { key: "panel", className: "hk-panel" },
                  presets.map(function(p) {
                    return h("button", {
                      key: p.label,
                      className: "hk-pre" + (chosen === p.v ? " on" : ""),
                      onClick: function() {
                        setRaiseTo(p.v);
                      }
                    }, p.label);
                  }),
                  h("input", {
                    className: "hk-slider",
                    type: "range",
                    min: minR,
                    max: Math.max(minR, maxR),
                    value: chosen,
                    onChange: function(e) {
                      setRaiseTo(Number(e.target.value));
                    }
                  }),
                  h("div", { className: "hk-amt" }, fmt2(chosen) + " \u7B79\u7801")
                ) : null,
                h(
                  "div",
                  { key: "act", className: "hk-actions" },
                  h("button", { className: "hk-btn", disabled: busy || !legal.fold, onClick: function() {
                    onAct({ type: "fold" });
                  } }, "Fold"),
                  legal.check ? h("button", { className: "hk-btn", disabled: busy, onClick: function() {
                    onAct({ type: "check" });
                  } }, "Check") : h("button", { className: "hk-btn", disabled: busy || !legal.call, onClick: function() {
                    onAct({ type: "call" });
                  } }, "Call " + fmt2(legal.callAmount || 0)),
                  legal.raise ? h("button", {
                    className: "hk-btn hk-raise",
                    disabled: busy,
                    onClick: function() {
                      onAct({ type: "raise", amount: chosen });
                    }
                  }, (chosen >= maxR ? "All-in " : "Bet ") + fmt2(chosen)) : null
                )
              ] : h("div", { className: "hk-wait" }, acting ? (acting.name || acting.id) + " \u6B63\u5728\u601D\u8003\u2026" : "\u53D1\u724C\u4E2D\u2026")
            )
          )
        )
      ),
      h(Rail, {
        items: state.timeline || [],
        players: state.players || [],
        busy,
        onSetAvatar: props.onSetAvatar,
        onClearAvatar: props.onClearAvatar
      })
    )
  );
}
function PokerView() {
  const [state, setState] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(function() {
    let alive = true;
    const load = function() {
      rpc("get-state").then(function(next) {
        if (alive) {
          setState(next);
          setNow(Date.now());
          setErr("");
        }
      }).catch(function(e) {
        if (alive) setErr(String(e && e.message || e));
      });
    };
    load();
    const timer = setInterval(load, 280);
    return function() {
      alive = false;
      clearInterval(timer);
    };
  }, []);
  const call = function(method, args) {
    setBusy(true);
    return rpc(method, args || {}).then(function(next) {
      setState(next);
      setNow(Date.now());
      setErr("");
      return next;
    }).catch(function(e) {
      setErr(String(e && e.message || e));
    }).then(function(v) {
      setBusy(false);
      return v;
    });
  };
  return h(
    "div",
    { style: { flex: 1, minHeight: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" } },
    err ? h("div", { className: "hk-err" }, err) : null,
    h(Table, {
      state,
      busy,
      now,
      onStart: function() {
        call("start", {});
      },
      onNext: function() {
        call("next-hand", {});
      },
      onReset: function() {
        call("reset", {});
      },
      onAct: function(a) {
        call("act", a);
      },
      onSetAvatar: function(id, file) {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
          setErr("\u56FE\u7247\u8D85\u8FC7 2MB");
          return;
        }
        const reader = new FileReader();
        reader.onload = function() {
          call("set-avatar", { id, image: reader.result });
        };
        reader.onerror = function() {
          setErr("\u8BFB\u53D6\u56FE\u7247\u5931\u8D25");
        };
        reader.readAsDataURL(file);
      },
      onClearAvatar: function(id) {
        call("clear-avatar", { id });
      }
    })
  );
}
function apply(ctx) {
  ctx.effect(function() {
    const style = document.createElement("style");
    style.dataset.plugin = "dsh-holdem";
    style.textContent = CSS;
    document.head.appendChild(style);
    return function() {
      style.remove();
    };
  });
  ctx.slots.inject("conversation.view", function() {
    return ctx.slots.register(
      { name: "conversation.view", id: "holdem", order: 20, label: "\u5FB7\u5DDE\u6251\u514B" },
      PokerView
    );
  });
}
module.exports = {
  name: "dsh-holdem",
  inject: ["slots"],
  apply
};
    return module.exports;
  },
});
