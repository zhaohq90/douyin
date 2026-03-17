# Douyin-Vue 项目总结

> 最后更新：2026-03-17

## 项目概述

Douyin-Vue 是一个模仿抖音/TikTok 的移动端短视频项目，基于 Vue 3 + Vite 5 + Pinia 实现，提供了媲美原生 App 的丝滑流畅体验。

### 核心特性

- 🎬 **短视频滑动播放** - 类似抖音的无限滑动视频流
- 📱 **移动端优先** - 完美的移动端交互体验
- 🔄 **Mock 数据支持** - 本地 JSON 数据模拟真实后端
- 🖥️ **后端服务** - Express + SQLite 真实后端支持
- 📦 **Electron 兼容** - 支持打包为桌面应用

---

## 技术栈

### 前端

| 技术       | 版本   | 用途         |
| ---------- | ------ | ------------ |
| Vue 3      | 3.5.13 | 核心框架     |
| Vite       | 5.4.21 | 构建工具     |
| Pinia      | 2.1.7  | 状态管理     |
| Vue Router | 4.3.0  | 路由管理     |
| Axios      | 1.12.0 | HTTP 请求    |
| Less       | 4.1.3  | CSS 预处理器 |
| TypeScript | 5.3.3  | 类型支持     |

### 后端

| 技术           | 版本    | 用途          |
| -------------- | ------- | ------------- |
| Express        | 4.22.1  | Web 框架      |
| better-sqlite3 | 11.10.0 | SQLite 数据库 |
| Drizzle ORM    | 0.33.0  | ORM 框架      |
| Zod            | 3.25.76 | 参数验证      |
| YAML           | 2.8.2   | 配置文件解析  |

---

## 已实现功能

### 一、前端功能（90+ 页面组件，37+ 通用组件）

#### 1. 核心视频功能

- [x] 视频无限滑动播放（SlideVerticalInfinite）
- [x] 视频自动播放/暂停控制
- [x] 视频进度条显示
- [x] 视频封面预加载
- [x] 视频点赞、收藏、分享
- [x] 视频评论系统
- [x] 视频背景音乐显示

#### 2. 页面模块

| 模块    | 页面数 | 功能描述                     |
| ------- | ------ | ---------------------------- |
| home    | 12+    | 首页视频流、音乐、直播、发布 |
| me      | 30+    | 个人中心、设置、收藏、历史   |
| login   | 12+    | 登录、注册、验证码           |
| message | 12+    | 消息、通知、粉丝列表         |
| people  | 6+     | 用户主页、关注/粉丝          |
| shop    | 2+     | 商城、商品详情               |

#### 3. 核心组件

```
src/components/
├── slide/              # 滑动组件
│   ├── SlideVerticalInfinite.vue   # 无限垂直滑动
│   ├── SlideHorizontal.vue         # 水平滑动
│   ├── BaseVideo.vue               # 视频播放器
│   ├── ItemToolbar.vue             # 视频工具栏
│   └── ItemDesc.vue                # 视频描述
├── dialog/             # 对话框组件
│   ├── ConfirmDialog.vue
│   ├── FromBottomDialog.vue
│   └── SelectDialog.vue
├── Comment.vue         # 评论组件
├── Share.vue           # 分享组件
├── UserPanel.vue       # 用户面板
├── Search.vue          # 搜索组件
└── ...
```

#### 4. 路由系统

- [x] 50+ 路由配置
- [x] 路由懒加载
- [x] 页面切换动画
- [x] 条件路由缓存

#### 5. 数据 Mock

- [x] axios-mock-adapter 拦截请求
- [x] 本地 JSON 数据存储
- [x] Mock/真实接口动态切换

### 二、后端功能（新增）

#### 1. 数据库设计

已创建 9 张数据库表：

| 表名          | 说明     | 数据量 |
| ------------- | -------- | ------ |
| users         | 用户信息 | 13 条  |
| videos        | 视频信息 | 832 条 |
| comments      | 评论数据 | 638 条 |
| music         | 音乐信息 | -      |
| posts         | 图文帖子 | 62 条  |
| goods         | 商品信息 | 42 条  |
| user_collects | 用户收藏 | -      |
| user_likes    | 用户点赞 | -      |
| view_history  | 观看历史 | -      |

#### 2. API 接口

| 模块    | 路由                             | 功能         |
| ------- | -------------------------------- | ------------ |
| video   | GET /api/video/recommended       | 推荐视频列表 |
|         | GET /api/video/long/recommended  | 长视频分页   |
|         | GET /api/video/:id               | 视频详情     |
|         | GET /api/video/private           | 私密视频     |
|         | GET /api/video/like              | 点赞视频     |
|         | GET /api/video/history           | 观看历史     |
| user    | GET /api/user/:id                | 用户信息     |
|         | GET /api/user/friends            | 好友列表     |
|         | GET /api/user/collect            | 用户收藏     |
| comment | GET /api/comment/video/:videoId  | 视频评论     |
|         | POST /api/comment/video/:videoId | 发表评论     |
| post    | GET /api/post/list               | 帖子列表     |
| shop    | GET /api/shop/list               | 商品列表     |
| music   | GET /api/music/list              | 音乐列表     |

#### 3. 配置系统

- [x] YAML 配置文件（default/development/production）
- [x] 环境变量覆盖
- [x] Zod 配置验证

#### 4. 资源路径

- [x] local 模式 - 本地文件路径
- [x] remote 模式 - HTTP CDN 地址
- [x] hybrid 模式 - 优先本地，回退远程

#### 5. 数据迁移

- [x] JSON → SQLite 数据迁移脚本
- [x] 表结构自动创建
- [x] 数据统计报告

---

## 未来计划

### Phase 2: 用户系统与互动（优先级：高）

#### 1. 用户认证

- [ ] JWT Token 认证
- [ ] 微信/QQ 第三方登录
- [ ] 短信验证码登录
- [ ] 用户权限管理

#### 2. 社交互动

- [ ] 关注/取关功能
- [ ] 点赞同步到数据库
- [ ] 收藏同步到数据库
- [ ] 评论回复（二级评论）
- [ ] @提及功能
- [ ] 私信系统

#### 3. 内容创作

- [ ] 视频上传
- [ ] 视频压缩转码
- [ ] 图文帖子发布
- [ ] 草稿箱功能

### Phase 3: Electron 桌面应用

#### 1. 桌面集成

- [ ] Electron 主进程开发
- [ ] 本地文件服务
- [ ] 系统托盘
- [ ] 自动更新

#### 2. 本地存储

- [ ] 本地视频缓存
- [ ] 离线观看支持
- [ ] 下载管理

#### 3. 性能优化

- [ ] 原生视频播放器
- [ ] 硬件加速
- [ ] 内存优化

### Phase 4: 高级功能

#### 1. 推荐算法

- [ ] 用户行为分析
- [ ] 个性化推荐
- [ ] 热门榜单

#### 2. 搜索功能

- [ ] 全文搜索
- [ ] 用户搜索
- [ ] 音乐搜索
- [ ] 话题标签

#### 3. 通知系统

- [ ] WebSocket 实时推送
- [ ] 系统通知
- [ ] 互动消息

---

## 可优化点

### 一、代码质量

#### 1. 类型定义

```
问题：部分组件使用 any 类型，缺少严格类型检查
建议：
- 为所有 API 响应定义 TypeScript 接口
- 使用 zod 进行运行时类型验证
- 移除所有 as any 类型断言
```

#### 2. 组件设计

```
问题：部分组件过大（如 Comment.vue 17KB、UserPanel.vue 26KB）
建议：
- 拆分为更小的子组件
- 提取公共逻辑到 composables
- 使用 defineAsyncComponent 懒加载
```

#### 3. 状态管理

```
问题：pinia.ts 文件较为简单，缺少模块化
建议：
- 按功能模块拆分 store
- 添加持久化插件
- 使用 getters 计算派生状态
```

### 二、性能优化

#### 1. 视频播放

```
问题：视频预加载策略简单，可能导致卡顿
建议：
- 实现智能预加载（基于用户行为预测）
- 添加视频缓存池
- 优化视频解码性能
- 支持多码率切换
```

#### 2. 首屏加载

```
问题：首屏资源较大，加载时间较长
建议：
- 路由级别代码分割
- 图片懒加载优化
- 关键 CSS 内联
- 预连接 CDN 域名
```

#### 3. 内存管理

```
问题：无限滑动可能导致内存持续增长
建议：
- 实现虚拟列表，只渲染可视区域
- 销毁离开视口的视频实例
- 定期清理无用的事件监听器
```

### 三、后端优化

#### 1. 数据库

```
问题：缺少数据库索引优化
建议：
- 为常用查询字段添加索引
- 使用 EXPLAIN 分析慢查询
- 考虑读写分离（如需要）
```

#### 2. API 设计

```
问题：部分 API 返回数据冗余
建议：
- 实现 GraphQL 或字段选择
- 添加 API 版本控制
- 实现请求缓存（ETag）
```

#### 3. 安全性

```
问题：缺少安全防护措施
建议：
- 添加请求频率限制
- 实现 CORS 白名单
- 添加 SQL 注入防护
- 敏感数据加密存储
```

### 四、开发体验

#### 1. 测试

```
问题：缺少自动化测试
建议：
- 添加 Vitest 单元测试
- 添加 Playwright E2E 测试
- 实现 API 集成测试
```

#### 2. 文档

```
问题：API 文档不完善
建议：
- 使用 Swagger/OpenAPI 生成 API 文档
- 添加组件使用文档
- 完善 README 快速开始指南
```

#### 3. CI/CD

```
问题：缺少自动化部署流程
建议：
- 配置 GitHub Actions
- 实现 Docker 容器化
- 添加自动化测试流水线
```

### 五、用户体验

#### 1. 离线支持

```
建议：
- 实现 Service Worker 缓存
- 添加离线提示
- 支持离线观看已缓存视频
```

#### 2. 无障碍

```
建议：
- 添加 ARIA 标签
- 支持键盘导航
- 优化屏幕阅读器支持
```

#### 3. 国际化

```
建议：
- 使用 vue-i18n
- 支持多语言切换
- 日期/数字本地化
```

---

## 项目结构

```
douyin-vue/
├── src/                      # 前端源码
│   ├── pages/                # 页面组件（90+ 文件）
│   │   ├── home/             # 首页模块
│   │   ├── me/               # 个人中心
│   │   ├── login/            # 登录注册
│   │   ├── message/          # 消息模块
│   │   ├── people/           # 用户主页
│   │   └── shop/             # 商城模块
│   ├── components/           # 通用组件（37+ 文件）
│   │   ├── slide/            # 滑动组件
│   │   └── dialog/           # 对话框组件
│   ├── router/               # 路由配置
│   ├── store/                # 状态管理
│   ├── utils/                # 工具函数
│   ├── api/                  # API 接口
│   ├── mock/                 # Mock 数据
│   └── assets/               # 静态资源
├── server/                   # 后端服务
│   ├── src/
│   │   ├── routes/           # API 路由
│   │   ├── services/         # 业务逻辑
│   │   ├── database/         # 数据库
│   │   ├── config/           # 配置
│   │   └── utils/            # 工具
│   └── scripts/              # 脚本
├── public/                   # 静态文件
│   └── data/                 # JSON 数据源
├── config/                   # 后端配置文件
├── docs/                     # 文档
└── env/                      # 环境变量
```

---

## 快速开始

### 前端开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（Mock 模式）
pnpm dev

# 启动开发服务器（真实后端）
VITE_MOCK_ENABLED=false pnpm dev
```

### 后端开发

```bash
# 初始化后端
pnpm db:init

# 启动后端服务
pnpm server:dev

# 数据迁移
pnpm server:migrate
```

### 访问地址

- 前端：http://localhost:3000
- 后端：http://localhost:3001
- 健康检查：http://localhost:3001/health

---

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 许可协议

[GPL](LICENSE)
