# 覆盖头像落在本机数据目录

牌局状态已经在 host 侧。覆盖头像若放进 localStorage，snapshot 带不上图，换浏览器即丢；若放进插件安装目录，一次升级就会清掉。覆盖头像因此写在本机 dsh 数据目录：刷新、Reset、重启 dsh、插件升级都还在；卸载插件或删除该目录才回到默认 identicon。Reset 只清牌局，不清头像。头像不进 LLM prompt。
