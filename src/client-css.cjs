// All hk-* styles for the poker tab, injected as one <style> tag by client.cjs.
module.exports = `
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
`
