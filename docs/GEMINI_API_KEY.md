# Gemini API Key 配置说明

本项目已创建专用的 Google Gemini API Key，专门用于 Tesla Custom Wraps 项目。

## API Key 信息

- **API Key**: `AIzaSyC1h2uv2unqeJmrwtZmppkz8tDE-RRlYgY`
- **名称**: tesla
- **项目名称**: projects/917722245090
- **项目编号**: 917722245090

## 配置方法

### 方法1：直接在 `.env.local` 文件中添加

创建或编辑项目根目录下的 `.env.local` 文件，添加以下内容：

```env
VITE_GEMINI_API_KEY=AIzaSyC1h2uv2unqeJmrwtZmppkz8tDE-RRlYgY
```

### 方法2：通过环境变量

如果不想将 key 存储在文件中，可以通过环境变量设置：

```bash
export VITE_GEMINI_API_KEY=AIzaSyC1h2uv2unqeJmrwtZmppkz8tDE-RRlYgY
```

## 验证配置

配置完成后，重启开发服务器：

```bash
npm run dev
```

然后在浏览器中测试生成功能，查看控制台是否显示：
```
Using AI provider: auto
Attempting Google Gemini...
```

如果看到这些日志，说明 Gemini API Key 已成功配置。

## 安全注意事项

⚠️ **重要提示**：
- `.env.local` 文件已添加到 `.gitignore`，不会被提交到 Git
- 请勿将 API Key 提交到公共代码仓库
- 如果 key 泄露，请立即在 Google AI Studio 中删除并重新创建

## API Key 管理

如果需要查看或管理这个 API Key：
1. 访问 https://aistudio.google.com/app/apikey
2. 登录您的 Google 账号
3. 找到名为 "tesla" 的 API Key
4. 可以查看详情、复制 key 或删除 key

## 使用限制

- **免费额度**: 60 requests/minute
- **模型**: Gemini 2.0 Flash 或 Gemini 1.5 Pro
- **超出限制**: 超出免费额度后需要付费

## 故障排除

如果遇到问题：

1. **检查 key 是否正确**: 确认 `.env.local` 中的 key 没有多余的空格或换行
2. **重启服务器**: 修改 `.env.local` 后需要重启开发服务器
3. **查看控制台**: 检查浏览器控制台是否有错误信息
4. **验证 key 有效性**: 在 Google AI Studio 中确认 key 是否仍然有效

## 支持

如有问题，请查看项目文档或联系开发团队。
