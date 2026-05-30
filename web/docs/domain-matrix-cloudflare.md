# 域名矩阵（Cloudflare Pages）

目标策略：

- 主品牌域名：`https://frontendnext.com`
- 周刊子站域名：`https://frontendweekly.cn`

## 已落地规则

规则文件：`web/public/_redirects`

核心行为：

- `frontendnext.com/weekly*` 全部 301 到 `frontendweekly.cn/weekly*`
- `frontendweekly.cn/` 301 到 `frontendweekly.cn/weekly`
- `frontendweekly.cn` 非 `/weekly*` 路径全部 301 回 `frontendnext.com`

## 为什么这样配

- **SEO 归一**：周刊内容只在 `frontendweekly.cn/weekly*` 作为 canonical 入口。
- **导流闭环**：用户从周刊站访问其他功能页会自动回主站。
- **品牌聚合**：主站承担资讯、每日、路线图、付费等主业务入口。

## 部署与验证

1. 确保 Pages 项目绑定了两个自定义域名：`frontendnext.com`、`frontendweekly.cn`
2. 部署当前分支（`_redirects` 会被带到静态产物）
3. 验证 301：

```bash
curl -I https://frontendnext.com/weekly
curl -I https://frontendnext.com/weekly/467
curl -I https://frontendweekly.cn/
curl -I https://frontendweekly.cn/live
curl -I https://frontendweekly.cn/weekly/467
```

预期：

- 前四条返回 `301` 且 `Location` 与策略一致
- `https://frontendweekly.cn/weekly/467` 返回 `200`
