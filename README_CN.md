# Tesla Custom Wraps - AI驱动的车辆贴膜设计工具

<div align="center">

![Tesla Custom Wraps](https://img.shields.io/badge/Tesla-Custom%20Wraps-red?style=for-the-badge&logo=tesla)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=for-the-badge&logo=typescript)
![DeepSeek AI](https://img.shields.io/badge/AI-DeepSeek-green?style=for-the-badge)

一个专业的AI驱动车辆贴膜设计工具，使用DeepSeek AI模型生成设计，并支持2D和3D预览。专注于为Tesla车型创建定制化的贴膜设计。

[English README](./README.md) | [中文文档](#)

</div>

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [配置说明](#配置说明)
- [使用指南](#使用指南)
- [开发指南](#开发指南)
- [部署](#部署)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## ✨ 功能特性

### 核心功能
- 🤖 **AI驱动设计生成** - 使用DeepSeek AI模型，根据您的设计主题自动生成专业的车辆贴膜设计
- 🎨 **多种车型支持** - 支持9种Tesla车型，包括Cybertruck、Model 3、Model Y等
- 📐 **2D/3D预览** - 支持2D平面预览和3D交互式模型预览
- 🖼️ **模板选择** - 可从官方Tesla模板库选择或上传自定义模板
- 💾 **设计下载** - 一键下载生成的设计作品

### 用户体验
- 🌓 **明亮/暗黑模式** - 支持主题切换，适应不同使用场景
- 🌐 **中英文切换** - 完整的国际化支持
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **实时预览** - 即时查看设计效果
- 🎯 **简洁界面** - 现代化的用户界面设计

### 技术特性
- 🔐 **Google登录** - 支持Google OAuth登录（可选）
- 📊 **数据分析** - 集成Google Analytics，追踪用户行为
- 🔒 **类型安全** - 完整的TypeScript类型支持
- ⚡ **高性能** - 优化的渲染和加载性能
- 🎨 **Tailwind CSS** - 现代化的样式系统

## 🛠️ 技术栈

### 前端框架
- **React 18.2.0** - 现代化UI框架
- **TypeScript 5.8.2** - 类型安全的JavaScript超集
- **Vite 6.2.0** - 快速的前端构建工具

### 3D渲染
- **Three.js 0.164.1** - 3D图形库
- **React Three Fiber 8.16.2** - React的Three.js渲染器
- **@react-three/drei 9.105.4** - Three.js的实用工具库

### AI服务
- **DeepSeek API** - AI图像生成服务
- 支持视觉理解和图像生成

### 样式与UI
- **Tailwind CSS** - 实用优先的CSS框架
- **Inter字体** - 现代无衬线字体

### 其他工具
- **Google Analytics** - 网站分析
- **Google OAuth** - 身份认证（可选）

## 🚀 快速开始

### 前置要求

- **Node.js** 18.0 或更高版本
- **npm** 或 **yarn** 包管理器
- **DeepSeek API密钥**（必需）

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/goudan1030/teslacustomwraps.git
   cd teslacustomwraps
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   创建 `.env.local` 文件（如果不存在），并添加以下配置：
   ```env
   # DeepSeek API Key (必需)
   VITE_DEEPSEEK_API_KEY=sk-b2ec3f0aab3c40118bcb84f5f850ace3
   
   # Google Analytics Measurement ID (可选)
   VITE_GA_MEASUREMENT_ID=G-LJLJZMLN6G
   
   # Google OAuth 2.0 Client ID (可选)
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   
   # Google OAuth 2.0 Client Secret (可选)
   VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问：`http://localhost:3000`

## 📁 项目结构

```
teslacustomwraps/
├── components/              # React组件
│   ├── Button.tsx          # 按钮组件
│   ├── Header.tsx          # 顶部导航栏
│   ├── PromptInput.tsx     # 提示词输入框
│   ├── SEO.tsx             # SEO优化组件
│   ├── ThreeDPreview.tsx   # 3D预览组件
│   └── VehicleSelector.tsx # 车型选择组件
├── contexts/               # React Context
│   ├── AuthContext.tsx     # 认证上下文
│   ├── LanguageContext.tsx # 语言上下文
│   └── ThemeContext.tsx    # 主题上下文
├── services/               # 服务层
│   ├── deepseekService.ts  # DeepSeek AI服务
│   └── geminiService.ts    # Gemini服务（已弃用）
├── types/                  # TypeScript类型定义
│   ├── vehicle.ts          # 车型类型定义
│   └── types.ts            # 通用类型
├── utils/                  # 工具函数
│   ├── analytics.ts        # Google Analytics工具
│   ├── i18n.ts             # 国际化配置
│   └── image.ts            # 图片处理工具
├── public/                 # 静态资源
│   ├── robots.txt          # 搜索引擎爬虫配置
│   └── sitemap.xml         # 网站地图
├── App.tsx                 # 主应用组件
├── index.tsx               # 应用入口
├── index.html              # HTML模板
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
└── package.json            # 项目依赖配置
```

## ⚙️ 配置说明

### DeepSeek API密钥

1. 访问 [DeepSeek开放平台](https://platform.deepseek.com/)
2. 注册并登录您的账户
3. 在左侧导航栏中点击"API key"
4. 创建新的API密钥
5. 将密钥复制到 `.env.local` 文件中的 `VITE_DEEPSEEK_API_KEY`

### Google Analytics（可选）

1. 访问 [Google Analytics](https://analytics.google.com/)
2. 创建新的属性或使用现有属性
3. 复制Measurement ID（格式：G-XXXXXXXXXX）
4. 添加到 `.env.local` 文件中的 `VITE_GA_MEASUREMENT_ID`

**注意**：当前已默认配置为 `G-LJLJZMLN6G`，无需额外配置即可使用。

### Google OAuth登录（可选）

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建OAuth 2.0客户端ID
5. 添加授权的JavaScript源：`http://localhost:3000`（开发环境）
6. 复制客户端ID到 `.env.local` 文件

## 📖 使用指南

### 创建您的第一个设计

#### 方法一：选择车型模板

1. **选择车型**
   - 点击"选择车型"标签
   - 从列表中选择您想要的Tesla车型
   - 系统会自动加载该车型的官方模板

2. **输入设计主题**
   - 在"设计主题"输入框中描述您想要的设计
   - 例如："美国警车主题，高对比度黑白配色，现代简约字体"
   - 描述越详细，生成效果越好

3. **生成设计**
   - 点击"生成设计"按钮
   - 等待AI处理（通常需要几秒钟）
   - 在右侧预览区域查看生成的设计

4. **预览和下载**
   - 可以在2D和3D视图之间切换
   - 点击"保存"按钮下载设计文件

#### 方法二：上传自定义模板

1. **上传模板**
   - 点击"上传模板"标签
   - 点击上传区域选择您的模板图片
   - 支持PNG和JPG格式，最大5MB

2. **后续步骤同方法一**

### 设计提示词建议

好的设计提示词应该包含：

- **颜色方案**：例如"哑光黑色配亮光条纹"、"经典红白蓝配色"
- **视觉效果**：例如"高对比度"、"渐变效果"、"金属质感"
- **图形元素**：例如"几何图案"、"火焰图案"、"赛车条纹"
- **风格主题**：例如"赛博朋克"、"极简主义"、"复古风格"
- **特殊要求**：例如"添加公司标志"、"保留原轮廓"

**示例提示词**：
```
Matte black with gloss red racing stripes, cyberpunk aesthetic, 
minimal white logos, high contrast design
```

```
哑光黑色配亮光红色赛车条纹，赛博朋克美学，简约白色标志，高对比度设计
```

### 支持的车型

| 车型 | 中文名称 | 说明 |
|------|---------|------|
| Cybertruck | Cybertruck | 特斯拉电动皮卡 |
| Model 3 | Model 3 | 标准版Model 3 |
| Model 3 (2024+) Standard & Premium | Model 3 (2024+) 标准版 & 高级版 | 2024年新款标准版和高级版 |
| Model 3 (2024+) Performance | Model 3 (2024+) 性能版 | 2024年新款性能版 |
| Model Y | Model Y | 标准版Model Y |
| Model Y (2025+) Standard | Model Y (2025+) 标准版 | 2025年新款标准版 |
| Model Y (2025+) Premium | Model Y (2025+) 高级版 | 2025年新款高级版 |
| Model Y (2025+) Performance | Model Y (2025+) 性能版 | 2025年新款性能版 |
| Model Y L | Model Y L | Model Y长轴版 |

## 🔧 开发指南

### 开发环境设置

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **构建生产版本**
   ```bash
   npm run build
   ```

4. **预览生产构建**
   ```bash
   npm run preview
   ```

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 React Hooks 最佳实践
- 组件使用函数式组件
- 使用 Tailwind CSS 进行样式设计
- 遵循 ESLint 规则（如果配置了）

### 添加新功能

1. **添加新车型**
   - 编辑 `types/vehicle.ts` 文件
   - 在 `VEHICLE_MODELS` 数组中添加新车型配置
   - 确保GitHub仓库中有对应的模板文件

2. **添加新翻译**
   - 编辑 `utils/i18n.ts` 文件
   - 在对应的语言对象中添加新的翻译键值对

3. **添加新组件**
   - 在 `components/` 目录下创建新组件文件
   - 使用 TypeScript 定义组件Props类型
   - 遵循现有的组件结构模式

## 🌐 部署

### Vercel部署（推荐）

1. 将代码推送到GitHub仓库
2. 在 [Vercel](https://vercel.com/) 上导入项目
3. 配置环境变量
4. 点击部署

### Netlify部署

1. 将代码推送到GitHub仓库
2. 在 [Netlify](https://www.netlify.com/) 上导入项目
3. 构建命令：`npm run build`
4. 发布目录：`dist`
5. 配置环境变量
6. 部署

### 自托管部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署dist目录**
   - 将 `dist` 目录上传到您的Web服务器
   - 配置Web服务器指向 `dist/index.html`
   - 确保服务器支持单页应用（SPA）路由

3. **配置环境变量**
   - 在生产环境设置环境变量
   - 或使用构建时的环境变量注入

## ❓ 常见问题

### Q: 如何获取DeepSeek API密钥？
A: 访问 [DeepSeek开放平台](https://platform.deepseek.com/)，注册账户后即可创建API密钥。

### Q: 支持哪些图片格式？
A: 支持PNG和JPG格式的模板上传，生成的图片为PNG格式。

### Q: 生成的图片分辨率是多少？
A: 生成的图片保持与输入模板相同的分辨率，通常为512x512到1024x1024像素。

### Q: 可以商用吗？
A: 请查看项目的许可证文件，并根据DeepSeek API的使用条款确定是否可以商用。

### Q: 如何切换语言？
A: 点击页面右上角的语言切换按钮（EN/中文）即可切换界面语言。

### Q: 3D预览如何操作？
A: 在3D预览模式下，可以使用鼠标拖动旋转模型，滚轮缩放，点击拖拽平移视角。

### Q: 为什么生成的设计没有完全符合我的提示词？
A: AI生成的结果具有一定随机性，建议：
- 提供更详细的设计描述
- 多次尝试生成，选择最佳结果
- 结合上传自定义模板使用

### Q: 如何保存我的设计？
A: 在2D预览模式下，点击右上角的"保存"按钮即可下载PNG格式的设计文件。

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个Pull Request

### 贡献类型

- 🐛 报告Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🎨 改进UI/UX
- ⚡ 性能优化
- 🔧 代码重构

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Tesla](https://www.tesla.com/) - 提供车型模板
- [DeepSeek](https://www.deepseek.com/) - AI模型服务
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D渲染框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

## 📞 联系我们

- **GitHub Issues**: [提交问题](https://github.com/goudan1030/teslacustomwraps/issues)
- **邮箱**: （待添加）

## 🔄 更新日志

### v1.0.0 (2024-01-09)
- ✨ 初始版本发布
- ✨ 支持9种Tesla车型
- ✨ AI驱动设计生成
- ✨ 2D/3D预览功能
- ✨ 中英文国际化
- ✨ 明亮/暗黑模式
- ✨ Google登录集成
- ✨ Google Analytics集成
- ✨ SEO优化
- 🎨 响应式设计
- 🔧 DeepSeek AI服务集成

---

<div align="center">

**Made with ❤️ for Tesla enthusiasts**

[⬆ 返回顶部](#tesla-custom-wraps---ai驱动的车辆贴膜设计工具)

</div>
