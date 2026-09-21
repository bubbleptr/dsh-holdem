# 更新日志

本文件遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

0.x 阶段：不兼容变更升 minor（0.y），新功能升 minor，修复升 patch。API 与规则稳定后发布 1.0.0，此后不兼容变更升 major。

## [Unreleased]

## [0.4.0] - 2026-09-21

### 不兼容变更
- 牌局 API 改为按浏览器会话隔离：每个浏览器一张独立牌桌，POST 必须携带首次 GET 返回的 `X-CSRF-Token`、同源 Origin 与 `application/json`，否则返回 401/403/415。直接用 curl 调用旧接口的脚本需要先 GET 拿会话。（#6）
- 买入规则：每人 3 次买入，用完出局；人类出局则本局结束。原来是无限买入。（#5）
- 非摊牌收池时会亮出赢家的两张底牌。（#5）
- `holdem_act` 工具的 `talk` 改为必填。（#6）

### 新增
- 会话区悬浮小窗（`shell.overlay`）：可拖动、可收起，不切 Tab 也能看牌、出手。（#5）
- 公共牌翻牌进场动效，翻牌三张错峰，`prefers-reduced-motion` 下关闭。（#5）
- 加注尺度按底池封顶，`allin` 成为显式选项，模型和启发式回退共用同一钳制。（#5）
- 桌边闲话回退池：模型没给或被过滤时按动作和 `bluff` 参数补一句，大小盲注时也会说话。（#6）
- WCAG 对比度检查脚本 `pnpm check:contrast`。（#5）
- 离线引擎测试 harness（stub 掉 llm 服务）。（#5）

### 修复
- 启发式回退路径绕过 `normalizeChoice` 导致意外全下。（#5）
- 出局座位导致盲注与庄家标记错位；牌桌结束后仍挂着庄/盲徽章。（#5）

### 安全
- 请求体上限 4 MiB、15 秒读超时、Content-Length 校验；响应加 `X-Content-Type-Options: nosniff`；5xx 不再回显内部错误。（#6）

### 内部
- 为 dsh 0.1.6 运行时卸载做准备：LLM 请求带 `AbortSignal`，`clearAi()` 时中止；`client.inject` 里停更的 `dsh-client-runtime` 换成 `dsh-client-ui-renderer`。（#7）

## [0.3.0] - 2026-08-23

### 新增
- 玩家头像与五位智能体的肖像，支持上传覆盖。（#4）
- 小盲/大盲座位徽章。

### 修复
- 盲注与行动顺序改为从按钮位顺时针。（#3）
- 底池百分比快捷键不再静默变成全下。（#2）
- 摊牌横幅区分主池与边池。

### 内部
- 抽出纯逻辑模块 `cards.js`、`pots.js` 与 client CSS，补单测。
- `pnpm dev` watch 构建，配合客户端 HMR。

## [0.2.0] - 2026-08-21

### 新增
- AI 创始人阵容与人设、座位重设计、每人投入显示、赢家效果。

## [0.1.0] - [0.1.3] - 2026-08-20

- 首次发布：六人无限注德州扑克插件，host 引擎 + client Tab。0.1.1 至 0.1.3 为发布当天的打包修补。

[Unreleased]: https://github.com/bubbleptr/dsh-holdem/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/bubbleptr/dsh-holdem/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/bubbleptr/dsh-holdem/releases/tag/v0.3.0
