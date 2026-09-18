// All hk-* styles for the poker tab, injected as one <style> tag by client.cjs.
// The palette lives in CSS custom properties on .hk-root so a theme switch only
// redefines variables: the light palette below is the shipped one, and the dark
// block at the end overrides it when the host resolves to the dark theme.
module.exports = `
.hk-root,.hk-mini{--hk-bg:#fff;--hk-subtle:#fafafa;--hk-surface:#fff;--hk-muted:#f4f4f5;--hk-empty:#f3f3f4;--hk-avatar-bg:#111;--hk-avatar-fg:#fff;--hk-line:#e7e7ea;--hk-line-soft:#ececee;--hk-line-btn:#e5e5e7;--hk-line-chip:#d0d0d5;--hk-dash:#ddd;--hk-text:#111;--hk-text-2:#444;--hk-text-3:#6f6f73;--hk-text-dim:#8a8a8e;--hk-text-faint:#9a9aa1;--hk-primary-bg:#111;--hk-primary-fg:#fff;--hk-primary-hover:#222;--hk-accent:#3b82f6;--hk-accent-bg:#eef4ff;--hk-accent-fg:#3b82f6;--hk-ring:rgba(59,130,246,.18);--hk-pre-ring:rgba(0,0,0,.08);--hk-bet-fg:#8a5a00;--hk-bet-bg:#fff8e6;--hk-bet-line:#f0dca8;--hk-win-bg:#fffbeb;--hk-win-line:#fcd34d;--hk-win-fg:#92400e;--hk-win-sub:#a16207;--hk-card-bg:#fff;--hk-card-line:#e8e8eb;--hk-card-text:#171717;--hk-card-red:#e11d48;position:relative;flex:1;width:100%;min-height:0;height:100%;display:flex;flex-direction:column;background:var(--hk-bg);color:var(--hk-text);overflow:hidden;user-select:none;font-family:ui-sans-serif,system-ui,-apple-system,"SF Pro Text",sans-serif}
.hk-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.hk-top{flex:none;display:flex;align-items:center;gap:10px;padding:10px 16px 0}
.hk-title{font-size:13px;color:var(--hk-text);font-weight:650}
.hk-meta{flex:1;min-width:0;font-size:12px;color:var(--hk-text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hk-chipbtn{cursor:pointer;border:1px solid var(--hk-line);background:var(--hk-surface);color:var(--hk-text-2);border-radius:999px;padding:5px 11px;font-size:12px}
.hk-chipbtn:hover{background:var(--hk-subtle)}
.hk-chipbtn.go{background:var(--hk-primary-bg);border-color:var(--hk-primary-bg);color:var(--hk-primary-fg);padding:5px 14px;font-weight:650}
.hk-chipbtn.go:hover{background:var(--hk-primary-hover)}
.hk-chipbtn:disabled{opacity:.35;cursor:default}
.hk-body{flex:1;min-height:0;display:flex;overflow:hidden}
.hk-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:88px 112px 56px;container-type:size;overflow:visible}
.hk-play{display:flex;flex-direction:column;align-items:center;justify-content:center;width:min(1080px,100%,calc(100cqh * 2.15));max-width:100%;height:100%;min-height:0;padding:0;overflow:visible}
.hk-rail{flex:none;width:280px;min-width:240px;height:100%;border-left:1px solid var(--hk-line-soft);background:var(--hk-subtle);display:flex;flex-direction:column;min-height:0;overflow:hidden}
.hk-rail-h{flex:none;padding:14px 16px 2px;font-size:12px;font-weight:650;color:var(--hk-text)}
.hk-rail-tabs{flex:none;display:flex;padding:4px 8px 0;border-bottom:1px solid var(--hk-line-soft)}
.hk-rail-tab{flex:1;cursor:pointer;border:0;background:transparent;color:var(--hk-text-dim);font-size:12px;font-weight:650;padding:10px 8px 9px}
.hk-rail-tab.on{color:var(--hk-text);box-shadow:inset 0 -2px 0 var(--hk-text)}
.hk-rail-sub{flex:none;padding:10px 16px 10px;font-size:11px;color:var(--hk-text-dim)}
.hk-av-list{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:0 10px 18px}
.hk-av-row{display:flex;align-items:center;gap:8px;padding:8px 6px;border-radius:10px}
.hk-av-name{flex:1;min-width:0;font-size:12px;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hk-av-file{display:none}
.hk-av-row .hk-chipbtn{padding:4px 9px;font-size:11px}
.hk-tl{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding:0 10px 18px}
[data-slot="conversation.session"]:has(.hk-root){flex:1 1 0!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
[data-slot="conversation.session"]:has(.hk-root)>*{flex:1 1 0!important;min-height:0!important;overflow:hidden!important;max-height:100%!important}
.hk-tl-hand{font-size:10px;letter-spacing:.06em;color:var(--hk-text-faint);padding:12px 6px 4px}
.hk-tl-street{display:flex;align-items:center;gap:8px;margin:8px 4px;font-size:11px;color:var(--hk-text-dim)}
.hk-tl-street:before,.hk-tl-street:after{content:"";flex:1;height:1px;background:var(--hk-line)}
.hk-tl-row{display:flex;gap:8px;padding:7px 6px;border-radius:10px}
.hk-tl-ico{width:20px;height:20px;flex:none;border-radius:50%;overflow:hidden;background:var(--hk-avatar-bg);display:flex;align-items:center;justify-content:center;font-size:11px;line-height:20px;color:var(--hk-avatar-fg)}
.hk-tl-main{min-width:0}
.hk-tl-name{font-size:12px;font-weight:650;color:var(--hk-text)}
.hk-tl-act{font-size:11px;color:var(--hk-text-3);margin-top:1px}
.hk-tl-talk{margin-top:5px;font-size:12px;line-height:1.35;color:var(--hk-text);background:var(--hk-surface);border:1px solid var(--hk-line-soft);border-radius:10px;padding:6px 8px}
.hk-tl-empty{padding:28px 10px;font-size:12px;color:var(--hk-text-faint);line-height:1.5}
.hk-table{position:relative;width:100%;height:auto;max-height:min(520px,calc(100cqh - 180px));aspect-ratio:2.15 / 1;background:var(--hk-subtle);border:1px solid var(--hk-line);border-radius:9999px;margin-bottom:52px}
.hk-center{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px}
.hk-pot{font-size:12px;color:var(--hk-text-3);font-weight:600;background:var(--hk-surface);border:1px solid var(--hk-line);border-radius:999px;padding:5px 10px}
.hk-board{display:flex;gap:10px;min-height:100px;align-items:center;justify-content:center;perspective:640px}
.hk-banner{max-width:360px;text-align:center;font-size:12px;line-height:1.45;color:var(--hk-text-3);background:var(--hk-surface);border:1px solid var(--hk-line-soft);border-radius:12px;padding:8px 12px}
.hk-banner.hk-over-banner{color:var(--hk-win-fg);background:var(--hk-win-bg);border-color:var(--hk-win-line);font-weight:700;max-width:min(420px,86vw)}
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
.hk-card{width:64px;height:90px;border-radius:10px;background:var(--hk-card-bg);color:var(--hk-card-text);position:relative;padding:0;font-weight:750;border:1px solid var(--hk-card-line);font-size:18px;line-height:1;box-shadow:0 1px 2px rgba(0,0,0,.04);overflow:hidden}
.hk-rank{position:absolute;top:4px;left:5px;font-size:13px;line-height:1;font-weight:750}
.hk-suit{position:absolute;left:50%;top:56%;transform:translate(-50%,-50%);font-size:22px;line-height:1}
.hk-board .hk-rank{top:6px;left:7px;font-size:16px}
.hk-board .hk-suit{font-size:30px}
.hk-cards .hk-rank{top:3px;left:4px;font-size:11px}
.hk-cards .hk-suit{font-size:16px}
.hk-seat.s0 .hk-rank{top:4px;left:5px;font-size:13px}
.hk-seat.s0 .hk-suit{font-size:20px}
.hk-card.red{color:var(--hk-card-red)}
.hk-card.back{display:flex;align-items:center;justify-content:center;padding:0;background:var(--hk-card-bg);color:var(--hk-card-text)}
.hk-card.empty{background:var(--hk-empty);border:1px dashed var(--hk-dash);box-shadow:none;color:transparent}
/* A newly dealt community card flips in. React remounts the slot because its
   key carries the card, so the animation replays for the flop (staggered by
   dealDelay), the turn and the river, and never repeats on a re-render. */
.hk-card.deal{animation:hk-deal .46s cubic-bezier(.2,.7,.3,1) both}
@keyframes hk-deal{0%{opacity:.2;transform:rotateY(-86deg) scale(.92)}55%{opacity:1}100%{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.hk-card.deal{animation:none}}
.hk-pill{display:flex;align-items:center;gap:8px;min-width:148px;background:var(--hk-surface);border:1px solid var(--hk-line);border-radius:999px;padding:5px 10px 5px 5px}
.hk-potbet{font-size:10px;font-weight:650;color:var(--hk-bet-fg);background:var(--hk-bet-bg);border:1px solid var(--hk-bet-line);border-radius:999px;padding:2px 8px;white-space:nowrap}
.hk-winbadge{font-size:11px;font-weight:800;color:#fff;background:linear-gradient(135deg,#f59e0b,#f97316);border-radius:999px;padding:2px 10px;box-shadow:0 2px 8px rgba(245,158,11,.45);white-space:nowrap;animation:hk-winpulse 1.1s ease-in-out infinite}
.hk-seat.winner .hk-pill{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.30)}
.hk-seat.winner{z-index:5}
@keyframes hk-winpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.hk-banner.hk-winner-banner{display:flex;flex-direction:column;align-items:center;gap:2px;max-width:min(420px,86vw);color:var(--hk-win-fg);background:var(--hk-win-bg);border:1px solid var(--hk-win-line);font-weight:700;font-size:13px;line-height:1.35;text-wrap:balance;font-variant-numeric:tabular-nums}
.hk-winner-h{font-weight:700}
.hk-winner-sub{font-weight:600;font-size:11px;color:var(--hk-win-sub)}
.hk-seat.toact .hk-pill{border-color:var(--hk-accent);box-shadow:0 0 0 2px var(--hk-ring)}
.hk-avatar{width:34px;height:34px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--hk-avatar-bg);flex:none}
.hk-avatar canvas,.hk-avatar img,.hk-tl-ico canvas,.hk-tl-ico img{width:100%;height:100%;object-fit:cover;display:block}
.hk-avatar canvas,.hk-tl-ico canvas{image-rendering:pixelated;image-rendering:crisp-edges}
.hk-name{min-width:0;font-size:12px;font-weight:650;color:var(--hk-text);display:flex;align-items:center;gap:4px;max-width:118px}
.hk-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hk-d{flex:none;width:16px;height:16px;border-radius:50%;background:var(--hk-primary-bg);color:var(--hk-primary-fg);font-size:9px;font-weight:750;display:flex;align-items:center;justify-content:center;letter-spacing:0}
.hk-d.hk-bb{background:var(--hk-text-3)}
.hk-d.hk-sb{background:var(--hk-surface);color:var(--hk-text-2);border:1px solid var(--hk-line-chip)}
.hk-d.hk-rebuy{width:auto;padding:0 4px;border-radius:999px;background:var(--hk-muted);color:var(--hk-text-dim);font-size:8px;font-weight:650}
.hk-d.hk-out{width:auto;padding:0 4px;border-radius:999px;background:var(--hk-bet-bg);color:var(--hk-bet-fg);border:1px solid var(--hk-bet-line);font-size:8px;font-weight:700}
.hk-stack{flex:none;margin-left:auto;white-space:nowrap;font-size:11px;color:var(--hk-text-dim)}
.hk-status{max-width:168px;font-size:11px;font-weight:600;color:var(--hk-accent-fg);background:var(--hk-accent-bg);border-radius:999px;padding:3px 8px;line-height:1.25;text-align:center}
.hk-status.talk{color:var(--hk-text-2);background:var(--hk-muted)}
.hk-status.off{visibility:hidden}
.hk-dock{flex:none;width:100%;padding:0 8px 4px;display:flex;flex-direction:column;align-items:center;gap:10px;position:relative;z-index:6}
.hk-panel{display:flex;align-items:center;gap:10px;background:var(--hk-muted);border-radius:999px;padding:7px 10px 7px 8px}
.hk-pre{cursor:pointer;border:0;background:transparent;color:var(--hk-text-2);border-radius:999px;padding:6px 10px;font-size:12px;font-weight:650}
.hk-pre.on{background:var(--hk-surface);color:var(--hk-text);box-shadow:0 0 0 1px var(--hk-pre-ring)}
.hk-slider{width:168px;accent-color:var(--hk-accent)}
.hk-amt{font-size:12px;color:var(--hk-text-3);font-weight:650;min-width:92px;text-align:right;font-variant-numeric:tabular-nums}
.hk-actions{display:flex;align-items:center;justify-content:center;gap:10px}
.hk-btn{cursor:pointer;border:1px solid var(--hk-line-btn);background:var(--hk-surface);color:var(--hk-text);border-radius:14px;padding:12px 18px;font-size:15px;font-weight:700;min-width:132px}
.hk-btn:disabled{opacity:.35;cursor:default}
.hk-raise,.hk-go{background:var(--hk-primary-bg);border-color:var(--hk-primary-bg);color:var(--hk-primary-fg)}
.hk-wait{font-size:13px;color:var(--hk-text-dim);padding:10px 0}
.hk-err{color:var(--hk-card-red);font-size:12px;padding:0 16px 8px}
.hk-v{width:12px;height:12px;flex:none}
/* ---------- floating mini window (registered into shell.overlay) ----------
   The overlay layer is position:absolute; inset:0; pointer-events:none, so the
   window positions itself and re-enables pointer events. It is NOT inside
   .hk-root, which is why the palette above also targets .hk-mini. */
.hk-mini{position:absolute;z-index:1;pointer-events:auto;display:flex;flex-direction:column;width:360px;height:520px;background:var(--hk-bg);color:var(--hk-text);border:1px solid var(--hk-line);border-radius:14px;box-shadow:0 18px 44px rgba(0,0,0,.24),0 2px 6px rgba(0,0,0,.10);overflow:hidden;font-family:ui-sans-serif,system-ui,-apple-system,"SF Pro Text",sans-serif;user-select:none}
.hk-mini.dragging{box-shadow:0 26px 64px rgba(0,0,0,.32)}
.hk-mini-bar{flex:none;display:flex;align-items:center;gap:8px;height:36px;padding:0 6px 0 10px;background:var(--hk-surface);border-bottom:1px solid var(--hk-line);cursor:grab;touch-action:none}
.hk-mini.dragging .hk-mini-bar{cursor:grabbing}
.hk-mini-ico{flex:none;font-size:14px;line-height:1}
.hk-mini-title{flex:none;font-size:12px;font-weight:650}
.hk-mini-meta{flex:1;min-width:0;font-size:11px;color:var(--hk-text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hk-mini-btn{flex:none;cursor:pointer;width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;border:1px solid var(--hk-line);background:var(--hk-surface);color:var(--hk-text-2);border-radius:8px;font-size:12px;line-height:1}
.hk-mini-btn:hover{background:var(--hk-subtle)}
.hk-mini-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.hk-mini-seg{flex:none;display:flex;gap:4px;padding:6px;background:var(--hk-surface);border-top:1px solid var(--hk-line)}
.hk-mini-seg button{flex:1;cursor:pointer;border:0;background:transparent;color:var(--hk-text-dim);font-size:11px;font-weight:650;padding:6px 4px;border-radius:8px}
.hk-mini-seg button.on{background:var(--hk-muted);color:var(--hk-text)}
.hk-mini-collapsed{flex-direction:row;align-items:center;gap:8px;width:auto;height:auto;padding:8px 14px;border-radius:999px;cursor:grab;touch-action:none}
.hk-mini-collapsed.dragging{cursor:grabbing}
.hk-mini-collapsed .hk-mini-meta{flex:none}
/* compact geometry: the same table at roughly half scale */
.hk-mini .hk-root{background:transparent}
.hk-mini .hk-top{padding:6px 8px 0;gap:6px}
.hk-mini .hk-title,.hk-mini .hk-meta{display:none}
.hk-mini .hk-chipbtn{padding:4px 10px;font-size:11px}
.hk-mini .hk-chipbtn.go{padding:4px 12px}
.hk-mini .hk-d{width:13px;height:13px;font-size:8px}
/* The mini window does not render the oval stage at all: at ~340px wide its
   absolutely positioned seats, bubbles and winner banner overlap. It uses a
   vertical layout instead — board/pot header, one row per player, actions. */
.hk-mini .hk-c{flex:1;min-height:0;display:flex;flex-direction:column;gap:6px;padding:6px 8px 8px}
.hk-mini .hk-c-top{flex:none;display:flex;align-items:center;justify-content:flex-end;gap:6px}
.hk-mini .hk-c-head{flex:none;display:flex;flex-direction:column;gap:6px;padding:7px 8px;border:1px solid var(--hk-line-soft);border-radius:12px;background:var(--hk-subtle)}
.hk-mini .hk-c-row1{display:flex;align-items:center;justify-content:space-between;gap:8px}
.hk-mini .hk-c-board{flex:none;display:flex;gap:4px;perspective:520px}
.hk-mini .hk-c-slot{display:flex}
.hk-mini .hk-c-board .hk-card{width:34px;height:48px;border-radius:7px}
.hk-mini .hk-c-board .hk-rank{top:3px;left:3px;font-size:11px}
.hk-mini .hk-c-board .hk-suit{font-size:16px}
.hk-mini .hk-c-pot{flex:none;font-size:12px;font-weight:700;white-space:nowrap;font-variant-numeric:tabular-nums}
.hk-mini .hk-c-row2{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:34px}
.hk-mini .hk-c-hole{display:flex;align-items:center;gap:7px;min-width:0}
.hk-mini .hk-c-hole .hk-cards{position:relative;left:auto;top:auto;transform:none;flex:none;display:block;width:44px;height:34px}
.hk-mini .hk-c-hole .hk-cards .hk-card{top:0;width:24px;height:34px;border-radius:5px}
.hk-mini .hk-c-hole .hk-cards .hk-card.fan-l{left:0;transform:rotate(-12deg)}
.hk-mini .hk-c-hole .hk-cards .hk-card.fan-r{left:18px;transform:rotate(12deg)}
.hk-mini .hk-c-hole .hk-rank{top:2px;left:3px;font-size:9px}
.hk-mini .hk-c-hole .hk-suit{font-size:13px}
/* Revealed hole cards inside a player row (showdown, or the winner of an
   uncontested pot): smaller than the header pair so the 38px row never grows. */
.hk-mini .hk-c-row .hk-c-hole.hk-c-open{flex:none}
.hk-mini .hk-c-row .hk-c-hole.hk-c-open .hk-cards{width:34px;height:28px}
.hk-mini .hk-c-row .hk-c-hole.hk-c-open .hk-cards .hk-card{width:20px;height:28px;border-radius:4px}
.hk-mini .hk-c-row .hk-c-hole.hk-c-open .hk-cards .hk-card.fan-l{left:0;transform:rotate(-10deg)}
.hk-mini .hk-c-row .hk-c-hole.hk-c-open .hk-cards .hk-card.fan-r{left:15px;transform:rotate(10deg)}
.hk-mini .hk-c-row .hk-c-hole.hk-c-open .hk-rank{top:2px;left:2px;font-size:8px}
.hk-mini .hk-c-row .hk-c-hole.hk-c-open .hk-suit{font-size:11px}
.hk-mini .hk-c-handname{font-size:11px;font-weight:650;color:var(--hk-text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hk-mini .hk-c-hint{font-size:10px;color:var(--hk-text-dim);line-height:1.35}
.hk-mini .hk-c-winner{display:flex;flex-direction:column;align-items:flex-end;gap:1px;text-align:right;max-width:198px;min-width:0}
.hk-mini .hk-c-winner .hk-winner-h{max-width:198px;font-size:11px;font-weight:700;color:var(--hk-win-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hk-mini .hk-c-winner .hk-winner-sub{max-width:198px;font-size:9px;color:var(--hk-win-sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hk-mini .hk-c-players{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;display:flex;flex-direction:column;gap:4px;padding-right:2px}
.hk-mini .hk-c-row{flex:none;display:flex;align-items:center;gap:7px;padding:4px 7px;border:1px solid var(--hk-line-soft);border-radius:10px;background:var(--hk-surface)}
.hk-mini .hk-c-row.me{background:var(--hk-muted);border-color:var(--hk-line-btn)}
.hk-mini .hk-c-row.toact{border-color:var(--hk-accent);box-shadow:0 0 0 2px var(--hk-ring)}
.hk-mini .hk-c-row.folded{opacity:.45}
.hk-mini .hk-c-row.out{opacity:.4;background:var(--hk-muted)}
.hk-mini .hk-c-row.winner{border-color:var(--hk-win-line);background:var(--hk-win-bg)}
.hk-mini .hk-c-av{flex:none;width:22px;height:22px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--hk-avatar-bg)}
.hk-mini .hk-c-av img,.hk-mini .hk-c-av canvas{width:100%;height:100%;object-fit:cover;display:block}
.hk-mini .hk-c-av canvas{image-rendering:pixelated;image-rendering:crisp-edges}
.hk-mini .hk-c-main{flex:1;min-width:0;display:flex;flex-direction:column}
.hk-mini .hk-c-name{display:flex;align-items:center;gap:4px;min-width:0;font-size:11px;font-weight:650;line-height:1.35}
.hk-mini .hk-c-who{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hk-mini .hk-c-crown{flex:none;font-size:10px;line-height:1}
.hk-mini .hk-c-allin{flex:none;font-size:9px;font-weight:700;color:var(--hk-bet-fg);background:var(--hk-bet-bg);border:1px solid var(--hk-bet-line);border-radius:999px;padding:0 5px}
.hk-mini .hk-c-stack{flex:none;margin-left:auto;padding-left:6px;font-size:10px;font-weight:400;color:var(--hk-text-dim);font-variant-numeric:tabular-nums}
.hk-mini .hk-d.hk-rebuy{width:auto;padding:0 4px;border-radius:999px;background:var(--hk-muted);color:var(--hk-text-dim);font-size:8px;font-weight:650}
.hk-mini .hk-d.hk-out{width:auto;padding:0 4px;border-radius:999px;background:var(--hk-bet-bg);color:var(--hk-bet-fg);border:1px solid var(--hk-bet-line);font-size:8px;font-weight:700}
.hk-mini .hk-c-over{margin:0 0 6px;padding:8px 10px;border:1px solid var(--hk-win-line);border-radius:10px;background:var(--hk-win-bg);text-align:center}
.hk-mini .hk-c-over-h{font-size:12px;font-weight:750;color:var(--hk-win-fg)}
.hk-mini .hk-c-over-sub{margin-top:2px;font-size:10px;line-height:1.4;color:var(--hk-win-sub)}
.hk-mini .hk-c-status{font-size:10px;line-height:1.3;color:var(--hk-accent-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:13px}
.hk-mini .hk-c-status.quiet{color:var(--hk-text-3)}
.hk-mini .hk-c-bet{flex:none;font-size:9px;font-weight:650;color:var(--hk-bet-fg);background:var(--hk-bet-bg);border:1px solid var(--hk-bet-line);border-radius:999px;padding:1px 6px;font-variant-numeric:tabular-nums}
.hk-mini .hk-dock{flex:none;gap:6px;padding:0;align-items:stretch}
.hk-mini .hk-panel{gap:5px;padding:4px 6px;flex-wrap:nowrap;justify-content:space-between}
.hk-mini .hk-pre{font-size:10px;padding:4px 6px}
.hk-mini .hk-slider{flex:1;min-width:56px;width:auto}
.hk-mini .hk-amt{font-size:10px;min-width:0;flex:none}
.hk-mini .hk-actions{gap:6px}
.hk-mini .hk-btn{flex:1;min-width:0;padding:9px 8px;font-size:12px;border-radius:10px}
.hk-mini .hk-wait{font-size:11px;padding:6px 0;text-align:center}
.hk-mini .hk-rail-sub{padding:8px 10px;font-size:10px}
.hk-mini .hk-av-list{padding:0 6px 12px}
.hk-mini .hk-av-row{padding:6px 4px;gap:6px}
.hk-mini .hk-tl{padding:0 6px 12px}
.hk-mini .hk-tl-talk{font-size:11px}
body[data-ds-dark-theme] .hk-root,body[data-ds-dark-theme] .hk-mini{--hk-bg:#151517;--hk-subtle:#1b1b1c;--hk-surface:#232324;--hk-muted:#2c2c2e;--hk-empty:#232324;--hk-avatar-bg:#353638;--hk-avatar-fg:#e9ecf2;--hk-line:#353638;--hk-line-soft:#2c2c2e;--hk-line-btn:#43454a;--hk-line-chip:#43454a;--hk-dash:#353638;--hk-text:#e9ecf2;--hk-text-2:#adb2b8;--hk-text-3:#979da6;--hk-text-dim:#979da6;--hk-text-faint:#81858c;--hk-primary-bg:#e9ecf2;--hk-primary-fg:#151517;--hk-primary-hover:#fff;--hk-accent:#60a5fa;--hk-accent-bg:rgba(96,165,250,.16);--hk-accent-fg:#93c5fd;--hk-ring:rgba(96,165,250,.28);--hk-pre-ring:rgba(255,255,255,.14);--hk-bet-fg:#fbbf24;--hk-bet-bg:rgba(251,191,36,.14);--hk-bet-line:rgba(251,191,36,.35);--hk-win-bg:rgba(251,191,36,.12);--hk-win-line:rgba(251,191,36,.45);--hk-win-fg:#fcd34d;--hk-win-sub:#fbbf24;--hk-card-line:#cfd3d6}
`
