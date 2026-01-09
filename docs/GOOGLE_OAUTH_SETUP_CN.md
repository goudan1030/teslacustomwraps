# Google OAuth 登录配置详细教程

本教程将指导您如何在 Tesla Custom Wraps 项目中配置 Google OAuth 登录功能。

## 📋 目录

- [前置要求](#前置要求)
- [步骤一：创建Google Cloud项目](#步骤一创建google-cloud项目)
- [步骤二：配置OAuth同意屏幕](#步骤二配置oauth同意屏幕)
- [步骤三：创建OAuth 2.0客户端ID](#步骤三创建oauth-20客户端id)
- [步骤四：配置授权域名](#步骤四配置授权域名)
- [步骤五：获取客户端ID和密钥](#步骤五获取客户端id和密钥)
- [步骤六：配置项目环境变量](#步骤六配置项目环境变量)
- [步骤七：测试登录功能](#步骤七测试登录功能)
- [常见问题排查](#常见问题排查)
- [安全注意事项](#安全注意事项)

## 📌 前置要求

- 拥有一个 Google 账号
- 能够访问 [Google Cloud Console](https://console.cloud.google.com/)
- 项目已安装并可以运行

## 🔧 步骤一：创建Google Cloud项目

### 1.1 访问Google Cloud Console

1. 打开浏览器，访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 使用您的 Google 账号登录

### 1.2 创建新项目

1. 点击页面顶部的项目选择器（显示当前项目名称的下拉菜单）
2. 点击 **"新建项目"** 按钮
3. 填写项目信息：
  - **项目名称**：例如 `Tesla Custom Wraps` 或 `WrapGenius AI`
  - **项目ID**：系统会自动生成，也可以自定义（全局唯一）
  - **位置**：选择组织或"无组织"（根据您的需求）
4. 点击 **"创建"** 按钮
5. 等待项目创建完成（通常需要几秒钟）

### 1.3 选择项目

创建完成后，确保在项目选择器中选择了刚创建的项目。

## 🔐 步骤二：配置OAuth同意屏幕

### 2.1 进入API和服务

1. 在左侧导航菜单中，点击 **"API和服务"**
2. 选择 **"OAuth同意屏幕"**

### 2.2 选择用户类型

1. 选择用户类型：
  - **外部**：允许任何拥有Google账号的用户登录（推荐用于测试和公开应用）
  - **内部**：仅限您组织内的用户（需要Google Workspace）
2. 点击 **"创建"**

### 2.3 填写应用信息

填写以下必填信息：

**应用信息：**

- **应用名称**：`Tesla Custom Wraps`（显示给用户的应用名称）
- **用户支持电子邮件**：选择您的邮箱地址
- **应用徽标**：可选，上传应用图标（建议 120x120 像素）

**应用域名：**

- **应用首页链接**：`https://teslacustomwraps.com`（或您的实际域名）
- **应用隐私政策链接**：`https://teslacustomwraps.com/privacy`（可选，但推荐）
- **应用服务条款链接**：`https://teslacustomwraps.com/terms`（可选）

**已获授权的网域：**

- 添加您的域名：`teslacustomwraps.com`（不带 www）
- 如果使用其他域名，也要添加

**开发者联系信息：**

- **电子邮件地址**：输入您的开发者邮箱

### 2.4 添加作用域（Scopes）

1. 点击 **"添加或移除作用域"**
2. 在左侧选择以下作用域：
  - ✅ `email` - 查看用户的电子邮件地址
  - ✅ `profile` - 查看用户的基本配置文件信息
  - ✅ `openid` - 使用OpenID Connect进行身份验证
3. 点击 **"更新"**，然后点击 **"保存并继续"**

### 2.5 添加测试用户（如果选择"外部"用户类型）

如果应用尚未发布，需要添加测试用户：

1. 在"测试用户"部分，点击 **"添加用户"**
2. 输入要测试的 Google 账号邮箱地址
3. 点击 **"添加"**
4. 可以添加多个测试用户
5. 点击 **"保存并继续"**

### 2.6 完成配置

1. 查看摘要信息
2. 点击 **"返回到信息中心"**

## 🔑 步骤三：创建OAuth 2.0客户端ID

### 3.1 启用必要的API

1. 在左侧导航菜单，点击 **"API和服务"** → **"库"**
2. 搜索 **"Google+ API"** 或 **"Google Identity Services"**
3. 如果未启用，点击 **"启用"**

### 3.2 创建凭据

1. 在左侧导航菜单，点击 **"API和服务"** → **"凭据"**
2. 点击页面顶部的 **"+ 创建凭据"** 按钮
3. 选择 **"OAuth 2.0 客户端 ID"**

### 3.3 配置OAuth客户端

**应用类型：**

- 选择 **"Web 应用"**

**名称：**

- 输入客户端名称，例如：`Tesla Custom Wraps Web Client`

**已授权的JavaScript来源：**
添加以下URL（每行一个）：

```
http://localhost:3000
http://127.0.0.1:3000
https://teslacustomwraps.top
https://www.teslacustomwraps.top
```

**注意**：根据您的实际部署域名添加所有需要支持的域名。

**已授权的重定向URI：**
添加以下URI（每行一个）：

```
http://localhost:3000
http://127.0.0.1:3000
https://teslacustomwraps.top
https://www.teslacustomwraps.top
```

**说明：**

- 对于开发环境，添加 `http://localhost:3000`
- 对于生产环境，添加您的实际域名
- 确保使用 `http://` 或 `https://`，不要遗漏协议
- 不要添加尾部斜杠 `/`

### 3.4 创建客户端

1. 点击 **"创建"** 按钮
2. 系统会显示一个对话框，包含：
  - **客户端ID**：类似于 `123456789-abcdefghijklmnop.apps.googleusercontent.com`
  - **客户端密钥**：类似于 `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`

## 📝 步骤四：配置授权域名

### 4.1 设置授权域名

1. 返回 **"OAuth同意屏幕"** 页面
2. 在 **"已获授权的网域"** 部分
3. 添加您的域名（不带协议和路径）：
  - `teslacustomwraps.com`
  - `localhost`（用于开发测试）

## 🗝️ 步骤五：获取客户端ID和密钥

### 5.1 查看凭据

1. 进入 **"API和服务"** → **"凭据"**
2. 找到刚创建的 OAuth 2.0 客户端ID
3. 点击客户端ID名称或编辑图标

### 5.2 复制凭据信息

- **客户端ID**：复制完整的客户端ID
- **客户端密钥**：如果需要服务器端验证，也复制客户端密钥
  - **注意**：客户端密钥只能查看一次，如果丢失需要重新创建

## ⚙️ 步骤六：配置项目环境变量

### 6.1 编辑 .env.local 文件

打开项目根目录下的 `.env.local` 文件，添加或更新以下内容：

```env
# DeepSeek API Key (必需)
VITE_DEEPSEEK_API_KEY=sk-b2ec3f0aab3c40118bcb84f5f850ace3

# Google Analytics Measurement ID (可选)
VITE_GA_MEASUREMENT_ID=G-LJLJZMLN6G

# Google OAuth 2.0 Client ID (可选，如需使用登录功能)
VITE_GOOGLE_CLIENT_ID=你的客户端ID.apps.googleusercontent.com

# Google OAuth 2.0 Client Secret (可选，仅服务器端需要)
VITE_GOOGLE_CLIENT_SECRET=你的客户端密钥
```

### 6.2 替换占位符

将以下占位符替换为实际值：

- `你的客户端ID.apps.googleusercontent.com` → 替换为步骤5.2中复制的客户端ID
- `你的客户端密钥` → 替换为步骤5.2中复制的客户端密钥（如果需要）

### 6.3 保存文件

保存 `.env.local` 文件。

## 🧪 步骤七：测试登录功能

### 7.1 重启开发服务器

如果开发服务器正在运行：

1. 在终端中按 `Ctrl+C` 停止服务器
2. 运行 `npm run dev` 重新启动

### 7.2 测试登录

1. 打开浏览器，访问 `http://localhost:3000`
2. 点击右上角的 **"登录"** 或 **"Sign In"** 按钮
3. 应该会弹出Google登录窗口
4. 选择要用于测试的Google账号
5. 如果看到权限请求页面，点击 **"允许"**
6. 登录成功后，应该能看到：
  - 您的Google账号头像
  - 按钮文字变为 **"登出"** 或 **"Sign Out"**

### 7.3 验证功能

- ✅ 登录按钮显示用户头像
- ✅ 点击登出可以正常退出
- ✅ 刷新页面后登录状态保持（如果实现了会话持久化）

## 🔍 常见问题排查

### 问题1：点击登录按钮没有反应

**可能原因：**

- Google API脚本未正确加载
- 客户端ID配置错误

**解决方法：**

1. 检查浏览器控制台是否有错误信息
2. 确认 `.env.local` 文件中的 `VITE_GOOGLE_CLIENT_ID` 配置正确
3. 确认已重启开发服务器
4. 检查网络连接，确保可以访问 `accounts.google.com`

### 问题2：显示"错误 400：redirect_uri_mismatch"

**可能原因：**

- 重定向URI未正确配置
- 当前访问的URL与配置的授权来源不匹配

**解决方法：**

1. 检查Google Cloud Console中的"已授权的JavaScript来源"
2. 确保添加了 `http://localhost:3000`（开发环境）
3. 确保添加了生产域名（生产环境）
4. 检查URL协议（http vs https）是否正确
5. 保存更改后，等待几分钟让配置生效

### 问题3：显示"此应用未经验证"

**可能原因：**

- OAuth同意屏幕配置不完整
- 应用未发布到生产环境

**解决方法：**

1. 对于开发测试：添加测试用户到OAuth同意屏幕
2. 对于生产环境：完成应用验证流程（需要Google审核）
3. 临时解决方案：在"OAuth同意屏幕"中添加测试用户

### 问题4：无法获取用户信息

**可能原因：**

- 作用域配置不正确
- API未启用

**解决方法：**

1. 检查OAuth同意屏幕中是否正确添加了 `email`、`profile`、`openid` 作用域
2. 确认已启用 Google Identity Services API
3. 检查浏览器控制台的错误信息

### 问题5：开发环境可以登录，但生产环境不行

**可能原因：**

- 生产域名未添加到授权来源
- 使用了 `http` 但生产环境是 `https`

**解决方法：**

1. 在Google Cloud Console中添加生产域名到"已授权的JavaScript来源"：
  - `https://teslacustomwraps.top`
  - `https://www.teslacustomwraps.top`
2. 同样添加到"已授权的重定向URI"
3. 确保使用正确的协议（生产环境使用 `https://`）
4. 清除浏览器缓存和Cookie后重试
5. 注意：配置更改可能需要5分钟到几小时才能生效

## 🔒 安全注意事项

### 1. 保护客户端密钥

- **重要**：客户端密钥（Client Secret）不应该暴露在客户端代码中
- 如果需要在服务器端验证，请将密钥保存在安全的服务器环境中
- 不要在Git仓库中提交包含真实密钥的 `.env.local` 文件
- 确保 `.env.local` 已在 `.gitignore` 中

### 2. 配置授权域名

- 只添加您实际使用的域名
- 不要添加通配符域名（除非必要）
- 定期审查已授权的域名列表

### 3. 限制API访问

- 在Google Cloud Console中设置API配额限制
- 监控API使用情况
- 设置预算警报

### 4. 用户数据保护

- 遵守隐私法规（如GDPR、CCPA等）
- 实施适当的数据保护措施
- 提供清晰的隐私政策

## 📚 相关资源

- [Google Identity Services 文档](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 最佳实践](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth同意屏幕指南](https://support.google.com/cloud/answer/10311615)

## ✅ 检查清单

配置完成后，请确认：

- Google Cloud项目已创建
- OAuth同意屏幕已配置
- OAuth 2.0 客户端ID已创建
- 授权域名已添加（包括localhost和生产域名）
- 客户端ID已添加到 `.env.local`
- 开发服务器已重启
- 登录功能测试通过
- 登出功能测试通过
- 生产环境域名已配置（如已部署）

---

**配置完成后，您的用户就可以使用Google账号登录 Tesla Custom Wraps 应用了！**

如有任何问题，请参考常见问题排查部分或查看Google官方文档。