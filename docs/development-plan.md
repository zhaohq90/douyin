# 后端服务开发计划

> 基于 SQLite 的真实后端接口开发里程碑

## 一、项目概览

### 1.1 目标

将现有的 Mock 数据方案升级为真实的后端服务，支持：

- SQLite 数据库存储
- Mock/真实接口可配置切换
- 本地/远程资源路径兼容
- Electron 桌面应用兼容

### 1.2 开发周期

预计 **3-4 周**完成核心功能开发。

---

## 二、技术选型确认

### 2.1 推荐技术栈

| 层级     | 技术选型                    | 备选方案     | 说明                        |
| -------- | --------------------------- | ------------ | --------------------------- |
| 后端框架 | **Express**                 | Fastify, Koa | 生态成熟，Electron 兼容性好 |
| 数据库   | **SQLite (better-sqlite3)** | sql.js       | 同步 API，性能优秀          |
| ORM      | **Drizzle ORM**             | Prisma       | 轻量级，TypeScript 原生支持 |
| 验证     | **Zod**                     | Joi          | 类型推导友好                |
| 配置     | **dotenv + yaml**           | convict      | 简单灵活                    |

### 2.2 为什么选择 Drizzle ORM

- **轻量级**：无运行时依赖，打包体积小
- **TypeScript 原生**：完整的类型推断
- **SQL-like 语法**：学习成本低
- **Electron 友好**：无额外进程依赖

---

## 三、开发阶段划分

### Phase 1：基础架构搭建（第1周）

#### 目标

- 搭建后端项目骨架
- 完成数据库设计与初始化
- 实现配置系统

#### 任务清单

| 序号 | 任务                              | 优先级 | 预计工时 |
| ---- | --------------------------------- | ------ | -------- |
| 1.1  | 初始化 server 目录结构            | P0     | 2h       |
| 1.2  | 配置 TypeScript + ESLint          | P0     | 1h       |
| 1.3  | 集成 Express 框架                 | P0     | 2h       |
| 1.4  | 设计并实现数据库 Schema           | P0     | 4h       |
| 1.5  | 实现 Drizzle ORM 集成             | P0     | 3h       |
| 1.6  | 创建数据库迁移脚本                | P0     | 2h       |
| 1.7  | 实现配置加载系统                  | P0     | 3h       |
| 1.8  | 编写数据迁移工具（JSON → SQLite） | P1     | 4h       |

#### 交付物

- [x] `server/` 目录结构
- [x] 数据库 Schema 文件
- [x] 配置加载模块
- [x] 数据迁移脚本

---

### Phase 2：核心 API 开发（第2周）

#### 目标

- 实现所有数据查询接口
- 支持分页、过滤功能
- 实现资源路径解析器

#### 任务清单

| 序号 | 任务               | 优先级 | 预计工时 |
| ---- | ------------------ | ------ | -------- |
| 2.1  | 实现视频模块 API   | P0     | 6h       |
| 2.2  | 实现用户模块 API   | P0     | 4h       |
| 2.3  | 实现评论模块 API   | P0     | 3h       |
| 2.4  | 实现帖子模块 API   | P1     | 2h       |
| 2.5  | 实现商品模块 API   | P1     | 2h       |
| 2.6  | 实现音乐模块 API   | P1     | 2h       |
| 2.7  | 实现资源路径解析器 | P0     | 3h       |
| 2.8  | 编写 API 单元测试  | P1     | 4h       |

#### API 详细任务

**2.1 视频模块 API**

```
GET  /api/video/recommended       # 推荐视频（分页）
GET  /api/video/long/recommended  # 长视频推荐（分页）
GET  /api/video/:id               # 视频详情
GET  /api/video/:id/comments      # 视频评论
GET  /api/video/private           # 私密视频
GET  /api/video/like              # 点赞视频
GET  /api/video/my                # 我的视频
GET  /api/video/history           # 历史记录
```

**2.2 用户模块 API**

```
GET  /api/user/panel              # 当前用户信息
GET  /api/user/friends            # 好友列表
GET  /api/user/collect            # 收藏列表
GET  /api/user/:id/videos         # 用户视频列表
PUT  /api/user/panel              # 更新用户信息
```

**2.3 评论模块 API**

```
GET  /api/comment/video/:videoId  # 视频评论列表
POST /api/comment/video/:videoId  # 发表评论
```

#### 交付物

- [x] 完整的 RESTful API
- [x] 资源路径解析器
- [x] API 单元测试

---

### Phase 3：前端适配与 Mock 切换（第3周）

#### 目标

- 改造前端请求层
- 实现 Mock/真实接口切换
- 端到端测试

#### 任务清单

| 序号 | 任务               | 优先级 | 预计工时 |
| ---- | ------------------ | ------ | -------- |
| 3.1  | 改造前端配置系统   | P0     | 2h       |
| 3.2  | 实现环境变量管理   | P0     | 2h       |
| 3.3  | 改造 axios 请求层  | P0     | 3h       |
| 3.4  | 实现 Mock 动态加载 | P0     | 3h       |
| 3.5  | Vite 代理配置      | P0     | 1h       |
| 3.6  | 集成测试           | P0     | 4h       |
| 3.7  | 编写开发文档       | P1     | 2h       |

#### 前端改造要点

**环境变量配置**

```bash
# .env.development
VITE_MOCK_ENABLED=true
VITE_API_BASE_URL=http://localhost:3001/api

# .env.production
VITE_MOCK_ENABLED=false
VITE_API_BASE_URL=/api
```

**请求层改造**

```typescript
// src/config/index.ts
export const API_CONFIG = {
  mockEnabled: import.meta.env.VITE_MOCK_ENABLED === 'true',
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api'
}

// src/main.ts
if (API_CONFIG.mockEnabled) {
  import('./mock').then(({ startMock }) => startMock())
}
```

#### 交付物

- [x] 前端配置改造
- [x] Mock 切换功能
- [x] 集成测试通过

---

### Phase 4：优化与文档（第4周）

#### 目标

- 性能优化
- 完善文档
- 准备 Electron 集成

#### 任务清单

| 序号 | 任务                  | 优先级 | 预计工时 |
| ---- | --------------------- | ------ | -------- |
| 4.1  | 数据库查询优化        | P1     | 4h       |
| 4.2  | 添加缓存层            | P2     | 4h       |
| 4.3  | 编写 API 文档         | P1     | 3h       |
| 4.4  | 编写部署文档          | P1     | 2h       |
| 4.5  | Electron 集成方案设计 | P2     | 4h       |
| 4.6  | 代码审查与重构        | P1     | 4h       |

#### 交付物

- [x] 性能优化报告
- [x] API 文档
- [x] 部署文档
- [x] Electron 集成方案

---

## 四、里程碑节点

```
Week 1 ──────────────────────────────────────────────────────
  │
  ├─ Day 1-2: 项目初始化、目录结构、TS配置
  ├─ Day 3-4: 数据库设计、Schema 实现
  └─ Day 5:   配置系统、数据迁移脚本
  │
  ▼ 里程碑 M1: 基础架构完成

Week 2 ──────────────────────────────────────────────────────
  │
  ├─ Day 1-2: 视频、用户 API
  ├─ Day 3:   评论、帖子、商品 API
  ├─ Day 4:   资源路径解析器
  └─ Day 5:   API 测试
  │
  ▼ 里程碑 M2: 核心 API 完成

Week 3 ──────────────────────────────────────────────────────
  │
  ├─ Day 1-2: 前端配置改造
  ├─ Day 3:   Mock 切换实现
  ├─ Day 4:   集成测试
  └─ Day 5:   Bug 修复
  │
  ▼ 里程碑 M3: 前后端联调完成

Week 4 ──────────────────────────────────────────────────────
  │
  ├─ Day 1-2: 性能优化
  ├─ Day 3:   文档编写
  └─ Day 4-5: Electron 方案设计、代码审查
  │
  ▼ 里程碑 M4: 项目交付
```

---

## 五、文件创建清单

### 5.1 后端核心文件

```
server/
├── package.json                    # 依赖配置
├── tsconfig.json                   # TS 配置
├── src/
│   ├── index.ts                    # 入口
│   ├── app.ts                      # Express 应用
│   ├── config/
│   │   ├── index.ts                # 配置加载
│   │   └── schema.ts               # 配置 Schema (Zod)
│   ├── database/
│   │   ├── index.ts                # 数据库连接
│   │   ├── schema.ts               # Drizzle Schema
│   │   └── migrations/             # 迁移文件
│   ├── routes/
│   │   ├── index.ts                # 路由汇总
│   │   ├── video.ts                # 视频路由
│   │   ├── user.ts                 # 用户路由
│   │   ├── comment.ts              # 评论路由
│   │   ├── post.ts                 # 帖子路由
│   │   ├── shop.ts                 # 商品路由
│   │   └── music.ts                # 音乐路由
│   ├── controllers/
│   │   ├── video.controller.ts
│   │   ├── user.controller.ts
│   │   ├── comment.controller.ts
│   │   ├── post.controller.ts
│   │   ├── shop.controller.ts
│   │   └── music.controller.ts
│   ├── services/
│   │   ├── video.service.ts
│   │   ├── user.service.ts
│   │   ├── comment.service.ts
│   │   ├── post.service.ts
│   │   ├── shop.service.ts
│   │   └── music.service.ts
│   ├── utils/
│   │   ├── response.ts             # 响应格式化
│   │   ├── pagination.ts           # 分页工具
│   │   └── resource-path.ts        # 资源路径解析
│   └── types/
│       └── index.ts                # 类型定义
└── scripts/
    ├── migrate-data.ts             # 数据迁移
    └── seed-db.ts                  # 数据初始化
```

### 5.2 配置文件

```
config/
├── default.yaml                    # 默认配置
├── development.yaml                # 开发环境
└── production.yaml                 # 生产环境

env/
├── .env.development                # 开发环境变量
└── .env.production                 # 生产环境变量
```

### 5.3 前端修改文件

```
src/
├── config/
│   └── index.ts                    # 修改：添加 API 配置
├── main.ts                         # 修改：Mock 动态加载
├── mock/
│   └── index.ts                    # 修改：条件启用
└── utils/
    └── request.ts                  # 修改：baseURL 配置

vite.config.ts                      # 修改：代理配置
```

---

## 六、风险与应对

### 6.1 技术风险

| 风险            | 影响 | 应对措施                |
| --------------- | ---- | ----------------------- |
| SQLite 并发性能 | 中   | 使用 WAL 模式，读写分离 |
| 大文件迁移耗时  | 低   | 分批迁移，进度显示      |
| 路径兼容性问题  | 中   | 充分测试各平台路径处理  |

### 6.2 进度风险

| 风险     | 影响 | 应对措施               |
| -------- | ---- | ---------------------- |
| 需求变更 | 高   | 预留缓冲时间，迭代开发 |
| 技术难点 | 中   | 提前调研，备选方案     |

---

## 七、验收标准

### 7.1 功能验收

- [ ] 所有 API 接口正常响应
- [ ] Mock 模式切换正常工作
- [ ] 资源路径本地/远程均可访问
- [ ] 数据迁移完整性验证

### 7.2 性能验收

- [ ] API 响应时间 < 200ms（本地）
- [ ] 支持 100+ 并发请求
- [ ] 数据库查询有合理索引

### 7.3 文档验收

- [ ] API 文档完整
- [ ] 部署文档可操作
- [ ] 配置说明清晰

---

## 八、后续迭代规划

### V1.1 版本

- 用户认证系统
- 点赞、收藏、评论交互功能
- 数据导入导出

### V1.2 版本

- Electron 桌面应用集成
- 本地文件管理服务
- 离线数据同步

### V2.0 版本

- 多用户支持
- 云端同步
- 插件系统

---

_文档版本：v1.0_
_最后更新：2024年_
