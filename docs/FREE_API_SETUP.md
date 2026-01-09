# 免费API设置指南 / Free API Setup Guide

本项目现在支持多种AI服务提供商，包括**完全免费的选项**！

## 免费选项

### 1. Hugging Face (推荐 - 完全免费)

Hugging Face提供免费的Stable Diffusion模型推理API。

**获取API密钥：**
1. 访问 https://huggingface.co/
2. 注册/登录账号（免费）
3. 访问 https://huggingface.co/settings/tokens
4. 创建新的Access Token
5. 复制Token到 `.env.local` 文件

**配置：**
```env
VITE_HUGGINGFACE_API_KEY=your_huggingface_token_here
```

**优点：**
- ✅ 完全免费
- ✅ 使用Stable Diffusion模型
- ✅ 无需信用卡

**限制：**
- 某些模型首次使用时需要加载（约20-30秒）
- 有速率限制，但通常足够个人使用

---

### 2. Replicate (免费额度)

Replicate提供Stable Diffusion API，有免费的月度额度。

**获取API Token：**
1. 访问 https://replicate.com/
2. 注册/登录账号
3. 访问 https://replicate.com/account/api-tokens
4. 创建新的API Token
5. 复制Token到 `.env.local` 文件

**配置：**
```env
VITE_REPLICATE_API_TOKEN=your_replicate_token_here
```

**优点：**
- ✅ 有免费额度（每月）
- ✅ 高质量的模型
- ✅ 响应速度快

**限制：**
- 免费额度有限，超出后需要付费

---

## 付费选项（高级）

### OpenAI (可选)

如果您想要更高质量的图像生成，可以使用OpenAI的DALL-E 3。

**配置：**
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**优点：**
- ✅ 最高质量的图像生成
- ✅ GPT-4 Vision + DALL-E 3组合

**缺点：**
- ❌ 需要付费
- ❌ 价格较高

---

## 自动模式（推荐）

系统默认使用"自动模式"，会按以下顺序尝试：

1. **如果有OpenAI密钥** → 使用OpenAI（最高质量）
2. **如果没有OpenAI或失败** → 使用免费服务（Hugging Face或Replicate）

这样您可以：
- 免费使用（仅配置Hugging Face）
- 或升级到付费（添加OpenAI密钥）

---

## 完整配置示例

`.env.local` 文件示例：

```env
# 免费选项（至少配置一个）
VITE_HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxx
# 或者
VITE_REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx

# 付费选项（可选）
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# 其他配置
VITE_GA_MEASUREMENT_ID=G-LJLJZMLN6G
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 推荐配置

**完全免费：**
```env
VITE_HUGGINGFACE_API_KEY=your_token
```

**最佳体验（免费+付费备用）：**
```env
VITE_OPENAI_API_KEY=your_key
VITE_HUGGINGFACE_API_KEY=your_token
```

这样系统会优先使用OpenAI，如果失败会自动降级到免费的Hugging Face。
