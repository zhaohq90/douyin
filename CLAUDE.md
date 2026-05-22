# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Douyin-Vue 是一个模仿抖音/TikTok 的移动端短视频应用，基于 Vue 3、Vite 5 和 Pinia 构建。具有流畅的视频滑动、缓存功能，支持 Mock 数据和真实后端服务器两种模式。

## 常用命令

```bash
# 开发模式（仅前端，默认使用 Mock 数据）
pnpm dev

# 开发模式（前后端联调）
pnpm dev              # 终端1：前端服务，端口 3000
pnpm server:dev       # 终端2：后端服务，端口 3001

# 构建
pnpm build            # 生产环境构建
pnpm build-gitee-pages # Gitee Pages 构建

# 代码质量
pnpm lint             # ESLint 检查并自动修复
pnpm format           # Prettier 格式化
pnpm type-check       # TypeScript 类型检查

# 后端服务（server/ 目录）
pnpm server:start     # 启动后端服务
pnpm server:migrate   # 将 JSON 数据迁移到 SQLite
pnpm db:init          # 初始化后端数据库

# 提交代码
pnpm commit           # 使用 commitizen 交互式提交
```

## 架构说明

### 数据模式

项目支持两种数据模式，通过环境变量控制：

- **Mock 模式**（开发默认）：`VITE_MOCK_ENABLED=true` - 使用 `axios-mock-adapter` 拦截 API 请求，返回 `public/data/` 中的本地 JSON 数据
- **真实后端模式**：`VITE_MOCK_ENABLED=false` - 将 `/api/*` 请求代理到 Express 服务器（端口 3001）

环境配置文件位于 `env/` 目录，由 `.env.development` 或 `.env.production` 决定当前模式。

### 前端结构

- **`src/pages/`** - 按功能划分的页面组件：
  - `home/` - 主页视频流、音乐、直播、搜索
  - `me/` - 用户个人中心及设置
  - `message/` - 消息和通知
  - `shop/` - 电商功能
  - `login/` - 登录认证流程

- **`src/components/slide/`** - 核心视频滑动组件：
  - `SlideVerticalInfinite.vue` - 无限垂直视频滚动
  - `BaseVideo.vue` - 带控制功能的视频播放器
  - `SlideHorizontal.vue` - 视频详情页的水平滑动

- **`src/router/`** - Vue Router 配置，支持条件性 keep-alive 缓存。路由通过追踪导航深度来管理 Pinia store 中的 `excludeNames`，控制哪些组件在返回时不应被缓存。

- **`src/store/pinia.ts`** - 单一 Pinia store（`useBaseStore`），管理用户信息、好友列表和路由缓存状态。

- **`src/api/`** - API 函数，使用 `src/utils/request.ts` 中封装的 axios 实例。所有响应遵循 `{ success: boolean, data: T, code: number }` 格式。

### 后端结构（`server/`）

基于 Express + SQLite（better-sqlite3）+ Drizzle ORM 的后端服务：

- `server/src/routes/` - API 路由定义
- `server/src/services/` - 业务逻辑
- `server/src/database/` - Drizzle schema 和数据库连接
- `server/data/` - SQLite 数据库文件

### 关键技术细节

1. **视频滑动**：在 `src/utils/slide.ts` 和 `src/components/slide/` 中实现了自定义的触摸滑动，未使用 Swiper 等外部库。

2. **路由缓存**：应用使用 Vue 的 `<keep-alive>` 配合动态 `exclude` 属性。路由的 `beforeEach` 守卫根据导航方向（前进/后退）从 `excludeNames` 中添加/移除组件名称。

3. **点击处理**：`main.ts` 中对 `HTMLElement.prototype.addEventListener` 进行了代理，防止滚动/拖拽过程中的点击事件触发（通过检查 `window.isMoved`）。

4. **Rem/VH 单位**：`App.vue` 中动态计算视口高度，设置 `--vh` CSS 变量以兼容移动端。

5. **静音状态**：全局 `window.isMuted` 和 `window.showMutedNotice` 处理初始静音状态（浏览器要求用户交互后才能取消静音）。

## 浏览器测试

这是一个移动端优先的应用。在桌面浏览器测试时：
1. 打开开发者工具（F12）
2. 切换设备工具栏（Ctrl+Shift+M）
3. 选择一个移动设备配置

前端开发服务器运行在 3000 端口。