# BoHelp (博城帮)

## 项目简介

BoHelp（博城帮）是一个专为多村落社区打造的全栈互助平台，通过居民端小程序实现高龄友好化的任务悬赏、邻里报修与公告查看，并配套Web管理后台供村长进行数据监控、任务审核与社区治理，旨在用数字化手段重建熟人社会的邻里温情。

## 核心功能

### 居民端小程序
- **任务悬赏**：居民可发布悬赏任务，其他居民可揭榜接收
- **邻里报修**：居民可提交报修需求，上传图片描述问题
- **公告查看**：查看社区和各村落的公告信息
- **高龄模式**：专为老年人设计的大字体、简化操作界面
- **社区交流**：居民之间的文字聊天功能
- **实名认证**：可选的实名认证，提升社区信任度

### Web管理后台
- **数据监控**：实时监控社区数据，包括用户活跃度、任务完成率等
- **任务审核**：审核居民发布的任务和报修需求
- **社区治理**：发布公告、管理用户、处理反馈
- **数据统计**：生成社区数据报表，辅助决策

## 技术栈

### 前端
- **居民端**：Uni-app（跨平台小程序）
- **管理后台**：Vue3 + Vite + Element Plus

### 后端
- **框架**：NestJS
- **数据库**：MongoDB
- **认证**：JWT
- **缓存**：Redis

## 项目结构

```
BoHelp/
├── client/             # 前端代码
│   ├── miniprogram/    # 居民端小程序（Uni-app）
│   └── admin/          # Web管理后台（Vue3）
├── server/             # 后端代码（NestJS）
│   ├── src/            # 源代码
│   ├── config/          # 配置文件
│   └── package.json     # 依赖配置
├── docs/               # 项目文档
└── README.md           # 项目说明
```

## 快速开始

### 环境要求
- Node.js 16.x+
- MongoDB 5.x+
- Redis 7.x+
- 微信开发者工具（小程序开发）

### 后端安装与运行

1. **安装依赖**
   ```bash
   cd server
   npm install
   ```

2. **配置环境变量**
   创建 `.env` 文件，添加以下配置：
   ```
   # 服务器配置
   PORT=3000
   NODE_ENV=development
   
   # 数据库配置
   MONGODB_URI=mongodb://localhost:27017/bohelp
   
   # Redis配置
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # JWT配置
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   
   # 密码加密配置
   BCRYPT_SALT_ROUNDS=10
   ```

3. **启动服务**
   ```bash
   npm run start:dev
   ```

### 前端安装与运行

#### 居民端小程序
1. **安装依赖**
   ```bash
   cd client/miniprogram
   npm install
   ```

2. **运行开发环境**
   ```bash
   npm run dev:mp-weixin
   ```

3. **在微信开发者工具中导入项目**
   打开微信开发者工具，导入 `client/miniprogram/dist/dev/mp-weixin` 目录

#### Web管理后台
1. **安装依赖**
   ```bash
   cd client/admin
   npm install
   ```

2. **运行开发环境**
   ```bash
   npm run dev
   ```

3. **访问管理后台**
   打开浏览器，访问 `http://localhost:5173`

## 部署

### 后端部署
1. **构建生产版本**
   ```bash
   cd server
   npm run build
   ```

2. **启动生产服务**
   ```bash
   npm run start:prod
   ```

### 前端部署
#### 居民端小程序
1. **构建生产版本**
   ```bash
   cd client/miniprogram
   npm run build:mp-weixin
   ```

2. **在微信开发者工具中上传**
   打开微信开发者工具，导入 `client/miniprogram/dist/build/mp-weixin` 目录，然后上传代码

#### Web管理后台
1. **构建生产版本**
   ```bash
   cd client/admin
   npm run build
   ```

2. **部署到服务器**
   将 `client/admin/dist` 目录上传到服务器，配置Nginx或Apache作为静态文件服务器

## 技术文档

- [需求分析与功能规划](./docs/需求分析与功能规划.md)
- [项目可行性分析](./docs/项目可行性分析.md)
- [技术栈选择](./docs/技术栈选择.md)
- [架构设计](./docs/架构设计.md)
- [前端开发步骤](./docs/前端开发步骤.md)
- [后端开发步骤](./docs/后端开发步骤.md)
- [后端管理系统设计](./docs/后端管理系统设计.md)
- [测试与部署](./docs/测试与部署.md)
- [学习资源推荐](./docs/学习资源推荐.md)

## 贡献指南

1. **Fork 本仓库**
2. **创建特性分支**：`git checkout -b feature/AmazingFeature`
3. **提交更改**：`git commit -m 'Add some AmazingFeature'`
4. **推送到分支**：`git push origin feature/AmazingFeature`
5. **打开 Pull Request**

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 联系方式

- 项目地址：[https://github.com/yourusername/BoHelp](https://github.com/yourusername/BoHelp)
- 开发者：[Your Name](https://github.com/yourusername)
- 邮箱：your.email@example.com

---

**博城帮** - 用科技连接邻里，用温情温暖社区！