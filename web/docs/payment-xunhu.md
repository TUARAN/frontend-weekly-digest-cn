# 虎皮椒支付接入说明

这份说明对应当前站点里的支付实现，默认支付提供商为 `xunhu`。

## 当前实现了什么

- 下单接口：`/api/order`
- 虎皮椒异步通知：`/api/payments/xunhu/notify`
- 订单页：`/order`
- 订单持久化：`web/.orders/*.json`

支持两种支付方式：

- 微信支付：优先显示虎皮椒返回的二维码
- 支付宝：优先跳转到虎皮椒收银台

## 需要准备的环境变量

参考 [web/.env.example](/Users/tuaran/Documents/GitHub/frontend-weekly-digest-cn/web/.env.example:1)：

```bash
SITE_URL=https://your-domain.com
PAYMENT_PROVIDER=xunhu
NEXT_PUBLIC_PAYMENT_PROVIDER=xunhu

XUNHU_GATEWAY_URL=https://api.xunhupay.com/payment/do.html
XUNHU_QUERY_URL=https://api.xunhupay.com/payment/query.html

XUNHU_WECHAT_APP_ID=你的微信应用ID
XUNHU_WECHAT_APP_SECRET=你的微信应用密钥
XUNHU_ALIPAY_APP_ID=你的支付宝应用ID
XUNHU_ALIPAY_APP_SECRET=你的支付宝应用密钥
```

最少需要：

- `SITE_URL`
- 微信或支付宝任意一套虎皮椒凭证

如果两个都填，页面上微信 / 支付宝都会可用。

## 虎皮椒后台需要配置什么

以你的正式域名为例 `https://frontendweekly.cn`：

- 异步通知地址：
  - 微信：`https://frontendweekly.cn/api/payments/xunhu/notify?payMethod=wechat`
  - 支付宝：`https://frontendweekly.cn/api/payments/xunhu/notify?payMethod=alipay`
- 返回地址：
  - `https://frontendweekly.cn/order`

注意：

- `SITE_URL` 必须和外部访问域名一致
- 回调必须是公网 HTTPS
- 如果站点部署在 Vercel / Node 服务，确保 API 路由可被公网访问

## 现在的订单状态流转

1. 用户在 `/order` 填信息
2. 服务端创建本地订单，状态为 `created`
3. 服务端向虎皮椒创建支付会话，返回收银台链接或二维码
4. 用户支付成功后：
   - 虎皮椒异步通知回调到 `/api/payments/xunhu/notify`
   - 服务端把订单改为 `confirmed`
5. 订单页轮询 `/api/order?orderNo=...`，自动刷新到已支付状态

另外还有一层兜底：

- `/api/order` 的查询接口会尝试主动向虎皮椒查单
- 即使异步通知偶发失败，前端轮询时仍有机会把订单推进到 `confirmed`

## 本地开发注意事项

本地开发只能验证：

- 下单逻辑
- 支付会话创建逻辑
- 订单页状态切换

本地通常没法真正验证异步通知，除非你做内网穿透并把穿透域名配置到虎皮椒后台。

## 上线前检查清单

- 已填写 `SITE_URL`
- 已填写虎皮椒凭证
- 线上域名可公网访问
- `/api/payments/xunhu/notify` 可被 POST 访问
- 下单后 `.orders` 里能看到订单 JSON
- 支付成功后订单状态能从 `created` 变成 `confirmed`

## 后续可扩展方向

当前代码已经为多支付提供商预留了结构：

- `xunhu`
- `official`

后续如果你要切到收钱吧、Ping++、支付宝官方、微信官方，可以继续沿用：

- `web/lib/order-store.ts`
- `web/app/api/order/route.ts`
- `web/app/order/page.tsx`

只需要新增对应 provider 的实现，不需要重写整个订单流。
