原文：Seamless PWA origin migration: Change domains without losing users
链接：https://developer.chrome.com/blog/seamless-pwa-origin-migration
翻译：TUARAN

# 无缝 PWA 域名迁移：更改网域而不损失用户

渐进式 Web 应用（PWA）通过提供类似应用的体验彻底改变了 Web。不过，PWA 的一大优势也一直是一个持续存在的挑战：**应用身份与网站源（origin）紧密绑定。**

如果你需要更改品牌或重组架构（例如，从 `www.example.com/social` 迁移到 `social.example.com`），你会面临一个令人痛苦的两难境地：**你无法"移动"已安装的 PWA。** 用户不得不手动卸载旧应用，然后找到新应用的安装按钮。

好消息是，Chrome 150 中推出了 **PWA 来源迁移**（PWA Origin Migration）。借助这项新的平台功能，你可以将已安装的 PWA 无缝迁移到新的同网站来源，最大限度地减少对用户的干扰。

---

## 来源迁移的功能

通过这项功能，你可以修改网站架构而不会破坏用户体验：

- **技术架构自由**：更改应用的子网域或路径。
- **修复"拆分应用"问题**：解决在没有稳定 `id` 的情况下更改 `start_url` 意外创建重复应用安装的问题。

用户通过一个简单的更新对话框完成迁移。他们以与标准应用更新类似的方式获知迁移情况。**只需点击一下**，旧应用就会被卸载，新应用就会被安装并启动。

---

## 如何迁移 PWA

迁移流程分为以下步骤：

1. **部署双向握手**：
   - 将 `migrate_from` 添加到新应用清单
   - 将 `allow_migration` 字段添加到旧来源的 `/.well-known/web-app-origin-association` 文件
2. **选择迁移行为**：`suggest`（默认）避免中断用户；`force` 在用户无法继续使用旧网址时强制迁移
3. **保持旧应用可更新**：如果旧网站重定向到新网站，使用 `migrate_from` 中的 `install_url` 属性
4. **在目标清单中实现 `id`**：Chrome 要求目标应用清单包含 `id` 字段，防止创建"拆分应用"

---

## 双向握手：安全机制

为确保安全并防止恶意接管，迁移需要旧来源和新来源之间进行**安全握手**。这确保两个网站都由同一实体控制。

> **重要提示**：此功能目前仅限于**同网站**迁移（共享相同的 eTLD+1），降低了应用从一个组织完全迁移到另一个组织的风险。

### 第 1 步：新应用声明前身（必需）

```json
// Manifest at https://fileman.google.com/manifest.json
{
  "name": "File Manager",
  "id": "/files/",
  "start_url": "/files/index.html",
  "migrate_from": [
    "https://drive.google.com/"
  ]
}
```

### 第 2 步：旧来源确认迁移（必需）

```json
// File at https://drive.google.com/.well-known/web-app-origin-association
{
  "https://fileman.google.com/files/": {
    "allow_migration": true
  }
}
```

### 第 3 步：主动发出信号（可选）

更新旧应用的清单以指向新应用：

```json
// Manifest at https://drive.google.com/manifest.json
{
  "name": "Drive",
  "start_url": "/",
  "migrate_to": {
    "id": "https://fileman.google.com/files/",
    "install_url": "https://fileman.google.com/drive/installwebapp?usp=migrate"
  }
}
```

### 第 4 步：处理重定向（可选）

如果你将旧应用网址重定向到新应用，在 `migrate_from` 内设置 `install_url`，告知浏览器获取旧清单的正确网址：

```json
{
  "migrate_from": [
    {
      "id": "https://drive.google.com/",
      "install_url": "https://drive.google.com/drive/installwebapp?usp=migrate"
    }
  ]
}
```

完成后，用户体验与应用更新一样流畅——用户在应用窗口右上角收到通知，点击查看更新后看到名称和网址变更的确认对话框。

---

## 控制用户体验

通过 `behavior` 标志选择迁移的激进程度：

- **`suggest`（默认）**：用户收到被动通知，可以选择更新、卸载或忽略
- **`force`**：下次启动时用户看到阻止对话框，必须更新或卸载

```json
"migrate_from": [
  { 
    "id": "https://example.com/social/",
    "behavior": "force"
  }
]
```

---

## 总结

借助 PWA 迁移功能，开发者终于可以自由地重构 Web 应用架构——更换域名、重组路径——而不必担心流失已安装的用户。这是 PWA 走向"一等公民"的又一个里程碑，解决了长期困扰 PWA 部署的最实际的问题之一。
