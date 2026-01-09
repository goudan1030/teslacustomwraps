# Hugging Face API 配置指南

本指南将帮助您配置 Hugging Face API，作为免费的图像生成备用服务。

## 步骤1：创建 Access Token

1. **访问 Token 创建页面**
   - 您当前已经在：https://huggingface.co/settings/tokens
   - 如果没有，请访问并登录您的 Hugging Face 账号

2. **选择 Token 类型**
   - 选择 **"Fine-grained"** 标签（细粒度权限，推荐）
   - 或选择 **"Read"** 标签（只读权限，简单但权限较少）

3. **填写 Token 信息**
   - **Token name**: 输入名称，例如 `tesla-custom-wraps`
   - Token name 可以随意命名，建议使用项目相关名称

## 步骤2：配置权限（Fine-grained Token）

如果选择了 Fine-grained token，需要配置以下权限：

### 必需权限：

#### User permissions（用户权限）

1. **Inference（推理）** ✅ 必需
   - ✅ Make calls to Inference Providers（调用推理提供商）
   - ✅ Make calls to your Inference Endpoints（调用您的推理端点）
   - ⚠️ Manage your Inference Endpoints（管理端点）- 可选，如果只需要调用则不需要

### 可选权限（根据需求）：

2. **Repositories（仓库）** - 可选
   - 如果您需要使用私有模型，可以勾选
   - 对于公开模型（如 Stable Diffusion），不需要

3. **其他权限** - 不需要
   - Webhooks、Discussions、Collections、Billing、Jobs 都不需要

### Repositories permissions（仓库权限）

- **通常不需要配置**，除非您要使用特定的私有仓库

### Org permissions（组织权限）

- **不需要配置**，除非您在组织中使用

## 步骤3：创建 Token

1. 确认已勾选必需的 **Inference** 权限
2. 点击页面底部的 **"Create token"** 按钮
3. **重要**：创建后立即复制 Token，您将无法再次查看完整 Token！

## 步骤4：配置到项目

1. **打开项目根目录的 `.env.local` 文件**
   - 如果文件不存在，请创建它

2. **添加 Hugging Face Token**
   ```env
   VITE_HUGGINGFACE_API_KEY=your_huggingface_token_here
   ```
   
   将 `your_huggingface_token_here` 替换为您刚才复制的 Token
   
   **示例**：
   ```env
   VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **保存文件**

4. **重启开发服务器**
   ```bash
   # 停止当前服务器（Ctrl+C）
   # 然后重新启动
   npm run dev
   ```

## 步骤5：验证配置

1. 在浏览器中打开应用
2. 尝试生成设计
3. 打开浏览器控制台（F12）
4. 查看日志，应该看到：
   ```
   Attempting Google Gemini...
   Gemini failed, trying next provider: ...
   Using free service (Hugging Face/Replicate)...
   Trying Hugging Face...
   ```

## 完整的 .env.local 示例

```env
# Gemini API (主要服务)
VITE_GEMINI_API_KEY=AIzaSyC1h2uv2unqeJmrwtZmppkz8tDE-RRlYgY

# Hugging Face (免费备用服务)
VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 其他配置
VITE_GA_MEASUREMENT_ID=G-LJLJZMLN6G
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 注意事项

⚠️ **重要提示**：

1. **Token 安全**
   - 不要将 Token 提交到 Git 仓库
   - `.env.local` 文件已在 `.gitignore` 中，不会被提交
   - 如果 Token 泄露，立即在 Hugging Face 中删除并重新创建

2. **权限最小化**
   - 只勾选必需的权限（Inference）
   - 这样可以提高安全性

3. **模型加载时间**
   - 某些模型首次使用时需要加载（约 20-30 秒）
   - 这是正常的，请耐心等待

4. **速率限制**
   - Hugging Face 有速率限制
   - 免费用户通常有足够的配额
   - 如果遇到限制，可以稍后再试

## 故障排除

### 问题1：403 Forbidden 错误
- **原因**：Token 权限不足
- **解决**：确保已勾选 "Make calls to Inference Providers" 权限
- **操作**：删除旧 Token，重新创建并确保权限正确

### 问题2：401 Unauthorized 错误
- **原因**：Token 无效或未配置
- **解决**：检查 `.env.local` 文件中的 Token 是否正确
- **操作**：确认 Token 没有多余空格，并且已重启服务器

### 问题3：模型加载超时
- **原因**：模型首次使用需要加载
- **解决**：等待 20-30 秒后重试
- **操作**：如果持续超时，可以尝试其他模型

### 问题4：Token 格式错误
- **原因**：Token 格式不正确
- **解决**：Hugging Face Token 通常以 `hf_` 开头
- **操作**：确保复制的是完整的 Token，包括 `hf_` 前缀

## 获取帮助

如果遇到问题：
1. 检查 Hugging Face 文档：https://huggingface.co/docs/api-inference/index
2. 查看项目文档：`docs/FREE_API_SETUP.md`
3. 检查控制台错误信息
