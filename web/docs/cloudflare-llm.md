# Cloudflare 部署：配置 OpenAI 兼容大模型

> 目标：在 Cloudflare 部署环境中，为 Web 工具提供可选的大模型翻译能力（OpenAI 兼容接口）。

## 1. 准备环境变量

在 Cloudflare 的项目设置中添加以下环境变量（不要提交到仓库）：

- `OPENAI_BASE_URL`：OpenAI 兼容接口地址
- `OPENAI_API_KEY`：访问密钥
- `OPENAI_MODEL`：模型名称
- `OPENAI_ENABLE_TRANSLATION`：是否启用（`true`/`false`）

示例：

- `OPENAI_BASE_URL` = `https://api.gptsapi.net/v1`
- `OPENAI_API_KEY` = `YOUR_API_KEY`
- `OPENAI_MODEL` = `gpt-4o-mini`
- `OPENAI_ENABLE_TRANSLATION` = `true`

## 2. 代码调用位置

服务端调用位于：

- [web/app/api/tool/jobs/route.ts](web/app/api/tool/jobs/route.ts)

当前仅预留了调用方法，启用后可在抓取流程里接入翻译逻辑。

## 3. Python SDK 参考（本地调试）

以下是 OpenAI 兼容接口的 Python 调用示例（请替换自己的 key）：

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.gptsapi.net/v1",
    api_key="YOUR_API_KEY"
)
```

## 4. 注意事项

- 请勿把密钥写入代码或提交到仓库。
- Cloudflare 环境变量分为 `Production`/`Preview`/`Development`，请按需设置。
- 若未开启 `OPENAI_ENABLE_TRANSLATION`，服务端会跳过翻译逻辑。
