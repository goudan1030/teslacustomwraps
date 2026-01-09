# 故障排除指南 / Troubleshooting Guide

## 常见问题

### 问题1: Hugging Face API 返回 410 (Gone)

**症状**: 请求 Hugging Face API 时返回 410 错误

**原因**: 请求的模型不存在或已被移除

**解决方案**:
1. 检查模型名称是否正确
2. 使用更稳定的模型，如 `runwayml/stable-diffusion-v1-5`
3. 如果持续 410，可能是模型被移除，需要更换模型

### 问题2: Gemini API 返回 404 (Not Found)

**症状**: 所有 Gemini 模型都返回 404

**原因**: 模型名称不正确或 API 版本不对

**解决方案**:
1. 确认使用的模型名称是否正确
2. 检查 API Key 是否有效
3. 确认 API 版本 (`v1beta`) 是否正确

### 问题3: 环境变量显示 "NOT SET" 但已配置

**症状**: `.env.local` 中已配置 API Key，但代码显示未配置

**原因**: 
- 开发服务器未重启
- 环境变量名称错误
- Vite 配置问题

**解决方案**:
1. **完全重启开发服务器**（重要！）
   ```bash
   # 停止服务器 (Ctrl+C 或 Cmd+C)
   # 重新启动
   npm run dev
   ```

2. **检查环境变量名称**
   - 必须使用 `VITE_` 前缀
   - 例如：`VITE_HUGGINGFACE_API_KEY` 而不是 `HUGGINGFACE_API_KEY`

3. **检查 .env.local 文件格式**
   - 不要有多余的空格
   - 不要使用引号（除非值本身包含引号）
   - 每行一个变量

4. **清除缓存并重新构建**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### 问题4: CORS 错误

**症状**: 浏览器控制台显示 CORS 错误

**原因**: 直接从浏览器调用外部 API

**解决方案**:
- 已配置 Vite 代理，确保重启服务器
- 请求会通过 `/api/huggingface` 代理转发
- 如果仍有 CORS 错误，检查 vite.config.ts 中的代理配置

### 问题5: 429 速率限制

**症状**: API 返回 429 (Too Many Requests)

**解决方案**:
- Gemini: 等待一段时间后重试（代码已自动处理）
- Hugging Face: 使用备用模型或等待
- 配置多个 API 服务，系统会自动切换

## 验证步骤

### 1. 检查环境变量是否加载

打开浏览器控制台（F12），应该看到：
```
API Keys loaded: {
  huggingface: "hf_nZHvci...",
  replicate: "NOT SET",
  env_keys: ["VITE_HUGGINGFACE_API_KEY"]
}
```

如果没有看到，说明环境变量未加载，需要重启服务器。

### 2. 检查 API Key 格式

- Hugging Face: 应该以 `hf_` 开头
- Gemini: 应该以 `AIza` 开头
- 长度应该合理（通常 30-50 个字符）

### 3. 测试 API 调用

在浏览器 Network 标签中查看：
- 请求 URL 是否正确
- 状态码是什么
- 响应内容是什么

## 快速修复清单

- [ ] `.env.local` 文件存在且格式正确
- [ ] 环境变量名称有 `VITE_` 前缀
- [ ] 开发服务器已完全重启
- [ ] 浏览器缓存已清除（Ctrl+Shift+R 或 Cmd+Shift+R）
- [ ] API Key 格式正确（没有多余空格）
- [ ] 检查浏览器控制台的调试日志

## 获取帮助

如果以上方法都无法解决问题，请提供：
1. 浏览器控制台的完整错误日志
2. Network 标签中的请求详情
3. `.env.local` 文件内容（隐藏实际 key，只显示格式）
