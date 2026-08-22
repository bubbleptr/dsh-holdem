# 默认头像用 identicon，不提交肖像图

**Status**: superseded by ADR-0003

座位圆要有默认头像，但不能分发真人肖像，插件也没有 Tailwind/shadcn，不能把 dither-kit 的 `<DitherAvatar>` 原样装进来。默认头像按玩家 id 在本地用同一套 dither identicon 算法绘制（近黑圆底、彩色镜像像素），视觉对齐 tripwire.sh/dither-kit，源码收进本仓库，运行时不请求该站。覆盖头像仍是用户上传的栅格图。
