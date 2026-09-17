# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

dsh-holdem 是 DeepSeek Harness (dsh) 的插件：六人无限注德州扑克，1 名人类玩家（seat 0）对 5 个 LLM 智能体（AI 公司创始人人设）。安装后在 dsh Web GUI 的 `conversation.view` 中出现「德州扑克」Tab。

## 常用命令

```sh
pnpm install
pnpm build        # 一次性构建（scripts/build.mjs），产出 lib/
pnpm dev          # watch 模式（scripts/dev.mjs），只监听 client 侧源码重建 lib/client.js
pnpm test         # node:test 单测（test/*.test.mjs）：纯逻辑 + 离线引擎（test/harness.mjs stub 掉 llm 服务）
```

发包时 `prepack` 会自动执行 build。无 lint 配置。

开发调试循环（本机 profile 已 `link:` 到本仓库，dsh CLI 用 `npx @deepseek-ai/dsh` 调用）：
- 改 `src/client.cjs`（UI）：一个终端跑 `pnpm dev`，另一个终端跑 `npx @deepseek-ai/dsh --profile web`。web GUI 常驻挂载 client-hmr 插件（无需任何旗标；旧版曾要求 `--dev`，现已移除），它轮询 bundle 文件：保存 → 自动重建 → 浏览器自动热重载，无需重启或刷新（插件 React state 会丢，但牌局状态在 host 侧，无影响）。
- 改 `src/host.js`：`pnpm build` 后重启 `npx @deepseek-ai/dsh --profile web`。host 侧共享 HMR 官方暂未启用，没有免重启方案。

注意：`lib/` 是提交进 git 的构建产物，改完 `src/` 必须重新 build，否则运行的还是旧代码。

## 架构

插件分为两个半区，由 `scripts/build.mjs` 用 esbuild 分别打包：

纯逻辑单独成模块并有单测：`src/cards.js`（牌力评估，`eval5`/`evalBest` 等）、`src/pots.js`（边池分层 `makePots`）、`src/bets.js`（下注尺度 `raiseCeiling`/`clampRaise`）、`src/table-rules.js`（买入/出局 `rebuyDecision`、盲注座位 `blindSeats`，含单挑）；`src/client-css.cjs` 是 client 的整段 CSS 字符串。牌局引擎（`createTable` 闭包）刻意保持在 `src/host.js` 内未拆——共享可变状态，拆分需先补更多特征测试；引擎级测试用 `test/harness.mjs` stub 掉 `llm` 服务离线驱动（`test/ai-sizing.test.mjs`、`test/rebuys.test.mjs`），需要确定性时用 `seedRandom(seed)` 替换 `Math.random`。

**Host（`src/host.js` → `lib/index.js`，Node/ESM）**
- cordis 风格插件：`export const name / inject = ['timer', 'webServer']` 和 `apply(ctx)`。build 脚本会校验这组导出，缺了会构建失败。
- `createTable(ctx)` 是全部牌局引擎：单例内存状态（无持久化），发牌、下注轮、边池、5 张牌评牌（`eval5`）、结算。
- 通过 `ctx.webServer.register({ kind: 'prefix', path: '/dsh-holdem' })` 暴露 JSON API：GET 任意路径返回 snapshot；POST `/start`、`/act`、`/next-hand`、`/reset`。每个调用都返回完整 snapshot。
- AI 决策链路（`askAgent`）：从 `ctx.get('llm')` 和 `ctx.get('agentDefaultModel').currentSelection()` 拿当前模型，用 `holdem_act` 工具调用流式请求；任何一环缺失或出错都回退到启发式 `decideAi`（由每个 bot 的 `loose/agg/bluff` 参数驱动），并把 `state.agentModel` 标为 `heuristic`。
- AI 行动由 `ctx.timeout` 调度，用 `aiSeq` 序号 + `handNo`/`toAct` 三重校验丢弃过期回调（换手牌、重置后旧请求不能落地）。
- 防泄牌是刻意设计：prompt 只含该 bot 自己的底牌；`sanitizeTalk` 过滤桌边闲话中的牌面、花色、胜率等词并限长。改 prompt 或 talk 相关逻辑时必须保持这条约束。

**Client（`src/client.cjs` → `lib/client.js`，浏览器/CJS）**
- 必须写成 CommonJS（`require('react')` / `module.exports`）：build 脚本把它包进 `window.__ModuleLoader__.load({ id, factory })` 包装器，React 由 harness 提供（esbuild external）。
- `apply(ctx)` 里用 `ctx.effect` 注入 `<style>`，用 `ctx.slots.inject('conversation.view')` 注册 Tab。
- UI 通过轮询 GET `/dsh-holdem` 获取 snapshot，动作走 POST；无 WebSocket。
- 样式全部是 `hk-` 前缀的手写 CSS 字符串，其中有针对 `[data-slot="conversation.session"]` 宿主容器的 `!important` 覆盖，改布局时注意别破坏。

**打包/分发**
- `package.json` 的 `dsh` 字段声明插件元数据：`bundle.patch` 指向 `cordis.patch.yml`（把本包插入 web 组合），`client.inject` 声明客户端运行时依赖。
- 用户通过 `dsh plugin --profile web add dsh-holdem` 安装 npm 预构建包，不需要 clone/build。

## dsh 插件开发要点（摘自官方文档）

官方文档：<https://github.com/deepseek-ai/deepseek-harness> 的 `docs/` 目录（各篇均有中文版 `*.zh.md`）。最相关：`cordis-primer.md`、`cookbook/extension-cookbook.md`、`user/develop/basic/publish.md`（bundle/profile 打包）、`subsystems/client-modules.md`（客户端模块机制）、`defensive-patterns.md`。dsh 处于 developer preview，API 可能变动。

**Cordis 核心模型**
- 插件 = 导出 `name` / `inject` / `apply(ctx)` 的模块（或 `Service` 子类）。`inject` 声明依赖的服务，框架等所有依赖就绪后才调用 `apply`。
- `ctx` 是服务仓库：`ctx.<key>`（如 `ctx.llm`、`ctx.tools`）按名取服务；`ctx.get(name)` 是软读取，服务不存在返回 `undefined`（本插件据此降级到启发式）。
- 一切注册都是可逆副作用：`ctx.effect(fn)` 返回的清理函数在插件卸载/热重载时执行；经 `ctx` 注册的监听器、定时器会自动清理。热重载能工作的前提就是每个注册都走 effect。
- 事件有四种派发模式：`emit`（观察）、`waterfall`（环绕中间件，`(...args, next)`，不调 `next()` 即短路）、`parallel`、`serial`。拦截/策略用事件，直接能力调用用服务方法。

**打包与分发（bundle / profile）**
- **bundle** 是发布单元：`package.json` 声明 `dsh.bundle.patch` 指向 `cordis.patch.yml`，patch 的 YAML 行用包名引用插件。**profile** 是用户的可运行组合（`$DSH_HOME/profiles/<name>`），由 `dsh plugin` 命令维护，勿手写。
- 配置分层顺序：base 及各 bundle patch（按安装序）→ profile 自己的 `cordis.patch.yml` → `$DSH_HOME/cordis.patch.yml` → 命令行 `--patch`。后层按行（`id`）覆盖前层，且 `config` 整体替换不深合并。
- 本地调试可不发包：`dsh --profile web --patch ./overlay.yml`（插件路径必须绝对路径），或 `dsh plugin --profile web add ./本地目录`（pnpm link）。
- 从 git 安装拿到的是源码，需要 `prepare` 脚本 + 用户在 `pnpm-workspace.yaml` 里 `allowBuilds` 放行；发 npm 预构建包（本仓库走 `prepack` 构建 `lib/`）则完全免除这些。

**客户端模块机制（`dsh.client`）**
- host 侧扫描声明了 `dsh.client`（`platform: 'web'`，可选 `inject` 依赖边）且 `exports["./client"]` 指向构建产物的包，组合成 `window.__DSH_BOOT__` 启动图，并把每个 bundle 挂在 `/plugins/<id>/client.js` 提供。
- 声明缺陷的失败姿态分两种：启动时聚合成一个大错误直接 FAIL；运行中坏包只告警不拖垮别人。包元数据缓存不过期——增删插件需重启。
- 开发模式下 `dsh-client-hmr` 会轮询各 bundle 文件、内容变化时推送浏览器（SSE），所以 `pnpm build` 后客户端可能自动热更新，不一定要手动刷新。

**防御性约定（官方 bug-class 规则，节选）**
- 正交结果各自上报（超时和退出码是两件事，不要嵌套判断）。
- 清理必须等到静止态：dispose 要 await 子任务真正退出，且先关监听再杀任务。
- 派发回调要 try/catch 包住，一个坏监听器不能拖垮其余监听器。
- `LlmAdapter.stream()` 的模型侧失败以终止 `finish {kind:'error'|'aborted'}` chunk 暴露，不以异常暴露（本插件 `askAgent` 已按此处理）。

## Agent skills

### Issue tracker

议题在本仓库的 GitHub Issues 跟踪（`gh` CLI）。见 `docs/agents/issue-tracker.md`。

### Triage labels

使用默认五标签词表（needs-triage / needs-info / ready-for-agent / ready-for-human / wontfix）。见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文布局：根 `CONTEXT.md` + `docs/adr/`。见 `docs/agents/domain.md`。

## 约定

- 全部游戏内文案（bot 人设、日志、UI 标签、talk 约束）是简体中文；代码注释用英文。
- 筹码单位叫 "tokens"（盲注 10000/20000，起始 2000000），是主题梗，不要改成 chips。
