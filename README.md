# dsh-holdem

无限注德州扑克：**1 名玩家 + 5 位 LLM 智能体**。装上后，Web GUI 中间栏会出现「德州扑克」Tab，
会话区域还会浮着一个可拖动、可收起的小窗。

智能体只能看见自己的底牌；桌边闲话是中文，不会泄露推理或手牌。

![六人桌界面](docs/table.jpg)

## 安装

已有 DeepSeek Harness 时，两条命令：

```sh
dsh plugin --profile web add dsh-holdem
dsh --profile web
```

装的是 npm 上的预构建包，不用 clone、不用 build、不用 `allowBuilds`。

卸载：

```sh
dsh plugin --profile web remove dsh-holdem
```

## 开发

```sh
pnpm install
pnpm build
```

| 文件 | 作用 |
| --- | --- |
| `src/host.js` | Node 半区：牌局引擎 + `/dsh-holdem/*` JSON API；缺模型时回退启发式机器人 |
| `src/client.cjs` | 浏览器半区：`conversation.view` Tab + `shell.overlay` 悬浮小窗 |
| `cordis.patch.yml` | 往 web 组合插入本包 |

改 Host 后需要重启 `dsh --profile web`。改 Client 后重新 `pnpm build`、刷新页面。

## 悬浮小窗

除了中间栏的完整 Tab，插件还在会话区域浮着一个 360×520 的小窗（注册在 `shell.overlay`），
不切 Tab 也能看牌局：

- 拖标题栏移动；越界会被夹回可见区域，折叠状态的药丸同样可拖。
- 双击标题栏或点右上角 `—` 收起成药丸，单击药丸展开。位置、折叠态与当前分页
  都存在 `localStorage` 的 `dsh-holdem.mini` 里。
- 小窗内用「牌桌 / 时间线 / 头像」三个分页切换，牌桌是紧凑布局（座位、牌面、下注区整体缩小），
  下注区宽度不足时预设与滑杆自动换行。
- Tab 与小窗共用一个 snapshot 轮询：展开时 280ms，收起的药丸降到 2000ms，两处同时开着也不会翻倍请求。

## 主题与配色

界面颜色全部走 `hk-*` CSS 变量：浅色值定义在 `.hk-root`/`.hk-mini`，深色值定义在
`body[data-ds-dark-theme]` 下的同名选择器（悬浮小窗不在 `.hk-root` 里，所以调色板
选择器必须同时带上 `.hk-mini`）。深色取值对齐 dsh 自身的 `neutral-bluish`
色阶（`#151517` / `#1b1b1c` / `#232324` / `#e9ecf2` 等），因此在深色 dsh 里
看起来和宿主是一体的。牌面是刻意的例外：两种主题下都是白底。

改完配色后跑一次对比度检查（WCAG AA）：

```sh
pnpm check:contrast
```

浅色模式下有 5 处对比度不足是继承自上游的既有问题（`meta line`、`rail hint`、
`timeline hand header`、`seat stack`、`turn badge`），脚本把它们标成 `KNOWN`
而不是 `FAIL`，便于后续单独处理；深色模式 24 项全部达标。

## 本地 fork 开发流程

本机 profile 通过 `link:` 指向本仓库，所以改动会立刻生效，无需重新安装：

1. 改 `src/client-css.cjs` / `src/client.cjs` → `pnpm build` → 浏览器自动热重载
   （`dsh-client-hmr` 轮询 `lib/client.js`；插件 React state 会丢，牌局状态在 host 侧不受影响）。
2. 改 `src/host.js` → `pnpm build` → **重启** `dsh --profile web`。
3. 改包元数据（`package.json` 的 `dsh` 字段、`cordis.patch.yml`）→ 必须重启，
   客户端模块元数据有缓存。

`lib/` 是提交进 git 的构建产物：改完 `src/` 一定要 `pnpm build`，否则运行的是旧代码。

## 许可证

MIT
