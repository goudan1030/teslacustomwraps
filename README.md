<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# WrapGenius AI

一个专业的AI驱动车辆贴膜设计工具，使用Google Gemini 2.5 Flash Image模型生成设计，并支持2D和3D预览。

A professional AI-powered vehicle wrap designer that uses Google Gemini 2.5 Flash Image model to generate designs with 2D and 3D preview support.

## 功能特性 / Features

- 🎨 **AI驱动设计生成** / AI-Powered Design Generation
- 🌓 **明亮/暗黑模式** / Light/Dark Mode Theme
- 🌐 **中英文切换** / Chinese/English Language Toggle
- 🔐 **Google登录** / Google OAuth Login
- 📊 **Google Analytics集成** / Google Analytics Integration
- 🎮 **3D交互预览** / Interactive 3D Preview
- 📱 **响应式设计** / Responsive Design

## 本地运行 / Run Locally

**前置要求 / Prerequisites:** Node.js 18+

### 1. 安装依赖 / Install Dependencies

```bash
npm install
```

### 2. 配置环境变量 / Configure Environment Variables

创建 `.env.local` 文件并配置以下变量：

Create `.env.local` file and configure the following variables:

```env
# Google Gemini API Key (必需 / Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Analytics Measurement ID (可选 / Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google OAuth 2.0 Client ID (可选 / Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Google OAuth 2.0 Client Secret (可选，仅服务器端需要 / Optional, only needed for server-side)
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### 3. 获取API密钥 / Get API Keys

#### Google Gemini API Key
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的API密钥
3. 复制密钥到 `.env.local` 文件

#### Google Analytics (可选)
1. 访问 [Google Analytics](https://analytics.google.com/)
2. 创建新的属性或使用现有属性
3. 复制Measurement ID (格式: G-XXXXXXXXXX)

#### Google OAuth Client ID (可选)
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建OAuth 2.0客户端ID
5. 添加授权的JavaScript源: `http://localhost:3000`
6. 复制客户端ID到 `.env.local` 文件

### 4. 运行应用 / Run the App

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

The app will start at `http://localhost:3000`

## 项目结构 / Project Structure

```
wrapgenius-ai/
├── components/          # React组件
│   ├── Header.tsx      # 顶部导航栏
│   ├── Button.tsx      # 按钮组件
│   ├── PromptInput.tsx # 提示词输入框
│   └── ThreeDPreview.tsx # 3D预览组件
├── contexts/           # React Context
│   ├── ThemeContext.tsx    # 主题上下文
│   ├── LanguageContext.tsx # 语言上下文
│   └── AuthContext.tsx     # 认证上下文
├── services/           # 服务层
│   └── geminiService.ts    # Gemini API服务
├── utils/              # 工具函数
│   ├── i18n.ts        # 国际化配置
│   ├── image.ts       # 图片处理
│   └── analytics.ts   # Google Analytics工具
└── App.tsx            # 主应用组件
```

## 主要功能说明 / Key Features

### 主题切换 / Theme Toggle
点击右上角的主题图标可以在明亮模式和暗黑模式之间切换。主题偏好会保存在本地存储中。

Click the theme icon in the top right corner to toggle between light and dark mode. Theme preference is saved in local storage.

### 语言切换 / Language Toggle
点击右上角的语言按钮可以切换中英文。语言偏好会保存在本地存储中。

Click the language button in the top right corner to toggle between Chinese and English. Language preference is saved in local storage.

### Google登录 / Google Login
使用Google账户登录以保存您的设计和偏好设置（需要配置Google OAuth Client ID）。

Sign in with Google account to save your designs and preferences (requires Google OAuth Client ID configuration).

### Google Analytics
自动跟踪页面浏览、用户操作和事件（需要配置GA Measurement ID）。

Automatically tracks page views, user actions, and events (requires GA Measurement ID configuration).

## 技术栈 / Tech Stack

- **React 18.2.0** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Three.js + React Three Fiber** - 3D渲染
- **Google Gemini API** - AI图像生成
- **Tailwind CSS** - 样式框架

## 许可证 / License

MIT
