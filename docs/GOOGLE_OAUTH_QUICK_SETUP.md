# Google OAuth 快速配置指南

针对域名 `https://teslacustomwraps.top` 的快速配置步骤。

## 📋 当前页面配置清单

根据您当前在Google Cloud Console的配置页面，请按以下步骤填写：

### ✅ 1. 应用类型
- **已选择**：`Web 应用` ✓

### ✅ 2. 名称
- **已填写**：`Tesla Custom Wraps` ✓

### 🔧 3. 已获授权的 JavaScript 来源（必填，当前有错误）

**请按以下顺序添加：**

点击 "URI 1 *" 输入框，输入：
```
http://localhost:3000
```

然后点击 **"+ 添加 URI"** 按钮，继续添加：

**URI 2：**
```
http://127.0.0.1:3000
```

**URI 3：**
```
https://teslacustomwraps.top
```

**URI 4：**
```
https://www.teslacustomwraps.top
```

### 🔧 4. 已获授权的重定向 URI（必填）

首先删除现有的 `https://www.example.com`（点击右侧的垃圾桶图标），然后添加：

**URI 1：**
```
http://localhost:3000
```

点击 **"+ 添加 URI"** 按钮，继续添加：

**URI 2：**
```
http://127.0.0.1:3000
```

**URI 3：**
```
https://teslacustomwraps.top
```

**URI 4：**
```
https://www.teslacustomwraps.top
```

## ⚠️ 重要注意事项

1. **不要添加尾部斜杠**：使用 `https://teslacustomwraps.top` 而不是 `https://teslacustomwraps.top/`

2. **协议要正确**：
   - 开发环境使用 `http://`
   - 生产环境使用 `https://`

3. **填写完成后检查**：
   - 确保没有红色错误提示
   - 所有必填字段都已填写
   - JavaScript来源至少有一个URI

## ✅ 配置完成后的步骤

1. **点击"创建"按钮**
2. **复制显示的客户端ID和密钥**
3. **配置项目环境变量**

## 📝 配置环境变量

在 `.env.local` 文件中添加：

```env
VITE_GOOGLE_CLIENT_ID=你复制的客户端ID.apps.googleusercontent.com
```

## 🔍 验证配置

配置完成后，测试：
- ✅ 本地开发环境：`http://localhost:3000` - 登录功能正常
- ✅ 生产环境：`https://teslacustomwraps.top` - 登录功能正常
- ✅ 带www：`https://www.teslacustomwraps.top` - 登录功能正常

---

**提示**：配置更改可能需要5分钟到几小时才能生效，请耐心等待。
