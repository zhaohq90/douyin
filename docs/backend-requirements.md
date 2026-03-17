# 后端服务需求文档

> 基于 SQLite 数据库的真实后端接口设计与实现规划

## 一、项目背景

### 1.1 当前状态

项目目前使用 `axios-mock-adapter` 拦截前端请求，返回本地 JSON 文件数据。这种方式的局限性：

- 无法实现真正的用户交互（点赞、收藏、评论等）
- 数据更新需要重新部署
- 无法支持多用户、权限管理等高级功能

### 1.2 目标

实现一个轻量级后端服务，支持：

- SQLite 数据库存储
- Mock 模式与真实接口可配置切换
- 支持本地路径和 HTTP 直链的混合资源管理
- 为 Electron 桌面应用提供兼容支持

---

## 二、技术选型

### 2.1 后端技术栈

| 技术     | 选型                    | 说明                                 |
| -------- | ----------------------- | ------------------------------------ |
| 运行时   | Node.js                 | 与前端技术栈统一，便于 Electron 集成 |
| 框架     | Express / Fastify       | 轻量级，易扩展                       |
| 数据库   | SQLite (better-sqlite3) | 无需独立服务，适合桌面应用           |
| ORM      | Prisma / Drizzle        | 类型安全，迁移方便                   |
| 文件处理 | Multer                  | 支持文件上传                         |

### 2.2 Electron 兼容性考虑

```
┌─────────────────────────────────────────────────────────────────┐
│                    Electron 架构兼容方案                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    IPC/HTTP    ┌─────────────────────────┐    │
│  │  渲染进程    │ ◄────────────► │  主进程（后端服务）       │    │
│  │  (Vue 前端)  │                │  - Express Server       │    │
│  └─────────────┘                │  - SQLite 数据库        │    │
│                                 │  - 本地文件服务          │    │
│                                 └─────────────────────────┘    │
│                                                                 │
│  资源存储方案：                                                  │
│  ├── 本地模式：file:// 协议 + 相对路径                           │
│  └── 远程模式：http(s):// 协议 + 配置化 BASE_URL                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、API 接口设计

### 3.1 接口清单

基于现有 Mock 实现，设计以下 RESTful API：

#### 视频模块 `/api/video`

| 方法   | 路径                | 说明         | 参数             |
| ------ | ------------------- | ------------ | ---------------- |
| GET    | `/recommended`      | 推荐视频列表 | start, pageSize  |
| GET    | `/long/recommended` | 长视频推荐   | pageNo, pageSize |
| GET    | `/:id/comments`     | 视频评论列表 | id               |
| GET    | `/private`          | 私密视频列表 | pageNo, pageSize |
| GET    | `/like`             | 点赞视频列表 | pageNo, pageSize |
| GET    | `/my`               | 我的视频列表 | pageNo, pageSize |
| GET    | `/history`          | 历史记录     | pageNo, pageSize |
| POST   | `/:id/like`         | 点赞视频     | id               |
| DELETE | `/:id/like`         | 取消点赞     | id               |
| POST   | `/:id/collect`      | 收藏视频     | id               |
| DELETE | `/:id/collect`      | 取消收藏     | id               |

#### 用户模块 `/api/user`

| 方法 | 路径          | 说明         | 参数 |
| ---- | ------------- | ------------ | ---- |
| GET  | `/panel`      | 当前用户信息 | -    |
| GET  | `/friends`    | 好友列表     | -    |
| GET  | `/collect`    | 收藏列表     | -    |
| GET  | `/:id/videos` | 用户视频列表 | id   |
| PUT  | `/panel`      | 更新用户信息 | body |

#### 评论模块 `/api/comment`

| 方法   | 路径              | 说明         | 参数          |
| ------ | ----------------- | ------------ | ------------- |
| GET    | `/video/:videoId` | 视频评论列表 | videoId       |
| POST   | `/video/:videoId` | 发表评论     | videoId, body |
| POST   | `/:id/like`       | 点赞评论     | id            |
| DELETE | `/:id`            | 删除评论     | id            |

#### 帖子模块 `/api/post`

| 方法 | 路径           | 说明         | 参数             |
| ---- | -------------- | ------------ | ---------------- |
| GET  | `/recommended` | 推荐帖子列表 | pageNo, pageSize |

#### 商品模块 `/api/shop`

| 方法 | 路径           | 说明         | 参数             |
| ---- | -------------- | ------------ | ---------------- |
| GET  | `/recommended` | 推荐商品列表 | pageNo, pageSize |

#### 音乐模块 `/api/music`

| 方法   | 路径           | 说明     | 参数 |
| ------ | -------------- | -------- | ---- |
| GET    | `/list`        | 音乐列表 | -    |
| POST   | `/:id/collect` | 收藏音乐 | id   |
| DELETE | `/:id/collect` | 取消收藏 | id   |

### 3.2 统一响应格式

```typescript
interface ApiResponse<T = any> {
  code: number // 200 成功，其他为错误码
  msg: string // 错误信息
  data: T // 响应数据
  success: boolean // 是否成功
}

// 分页响应
interface PageResponse<T> {
  total: number // 总数
  pageNo: number // 当前页
  pageSize: number // 每页数量
  list: T[] // 数据列表
}
```

---

## 四、数据库设计

### 4.1 ER 图

```
┌─────────────────┐       ┌─────────────────┐
│     users       │       │     videos      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ uid             │   │   │ aweme_id        │
│ nickname        │   │   │ author_user_id  │───┐
│ avatar          │   │   │ desc            │   │
│ signature       │   │   │ video_url       │   │
│ follower_count  │   │   │ cover_url       │   │
│ ...             │   │   │ music_id (FK)   │───┼──┐
└─────────────────┘   │   │ statistics      │   │  │
                      │   │ ...             │   │  │
                      │   └─────────────────┘   │  │
                      │                         │  │
┌─────────────────┐   │   ┌─────────────────┐   │  │
│    comments     │   │   │     music       │   │  │
├─────────────────┤   │   ├─────────────────┤   │  │
│ id (PK)         │   │   │ id (PK)         │◄──┘  │
│ comment_id      │   │   │ title           │      │
│ video_id (FK)   │◄──┼───│ author          │      │
│ user_id (FK)    │───┘   │ play_url        │      │
│ content         │       │ cover_url       │      │
│ digg_count      │       │ duration        │      │
│ ...             │       │ ...             │      │
└─────────────────┘       └─────────────────┘      │
                                                  │
┌─────────────────┐       ┌─────────────────┐     │
│     posts       │       │     goods       │     │
├─────────────────┤       ├─────────────────┤     │
│ id (PK)         │       │ id (PK)         │     │
│ post_id         │       │ name            │     │
│ type            │       │ cover           │     │
│ title           │       │ price           │     │
│ cover_url       │       │ real_price      │     │
│ user_id (FK)    │───────│ imgs            │     │
│ ...             │       │ sold            │     │
└─────────────────┘       └─────────────────┘     │
                                                  │
┌─────────────────┐       ┌─────────────────┐     │
│  user_videos    │       │ user_collects   │     │
├─────────────────┤       ├─────────────────┤     │
│ id (PK)         │       │ id (PK)         │     │
│ user_id (FK)    │       │ user_id (FK)    │─────┘
│ video_id (FK)   │       │ target_type     │  (video/music)
│ type            │       │ target_id       │
└─────────────────┘       └─────────────────┘
```

### 4.2 数据表结构

#### 4.2.1 用户表 `users`

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT UNIQUE NOT NULL,              -- 抖音用户ID
  unique_id TEXT,                        -- 唯一标识
  short_id TEXT,                         -- 短ID
  nickname TEXT NOT NULL,                -- 昵称
  avatar TEXT,                           -- 头像路径
  avatar_168 TEXT,                       -- 168x168 头像
  avatar_300 TEXT,                       -- 300x300 头像
  signature TEXT,                        -- 签名
  province TEXT,                         -- 省份
  city TEXT,                             -- 城市
  country TEXT DEFAULT '中国',           -- 国家
  gender INTEGER DEFAULT 0,              -- 性别 0未知 1男 2女
  birthday TEXT,                         -- 生日
  follower_count INTEGER DEFAULT 0,      -- 粉丝数
  following_count INTEGER DEFAULT 0,     -- 关注数
  aweme_count INTEGER DEFAULT 0,         -- 作品数
  favoriting_count INTEGER DEFAULT 0,    -- 获赞数
  cover_url TEXT,                        -- 背景图
  white_cover_url TEXT,                  -- 白色背景图
  ip_location TEXT,                      -- IP属地
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_uid ON users(uid);
CREATE INDEX idx_users_nickname ON users(nickname);
```

#### 4.2.2 视频表 `videos`

```sql
CREATE TABLE videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aweme_id TEXT UNIQUE NOT NULL,         -- 视频唯一ID
  author_user_id TEXT NOT NULL,          -- 作者用户ID
  desc TEXT,                             -- 视频描述
  create_time INTEGER,                   -- 创建时间戳

  -- 视频资源
  video_url TEXT,                        -- 视频播放地址（支持本地/远程）
  video_uri TEXT,                        -- 视频URI标识
  cover_url TEXT,                        -- 封面图地址
  cover_uri TEXT,                        -- 封面URI
  poster_url TEXT,                       -- 海报图地址
  width INTEGER,                         -- 视频宽度
  height INTEGER,                        -- 视频高度
  duration INTEGER,                      -- 时长（毫秒）
  ratio TEXT,                            -- 分辨率标识
  horizontal_type INTEGER DEFAULT 0,     -- 横竖屏 0竖屏 1横屏

  -- 音乐信息（冗余存储，便于快速展示）
  music_id TEXT,                         -- 音乐ID
  music_title TEXT,                      -- 音乐标题
  music_author TEXT,                     -- 音乐作者
  music_play_url TEXT,                   -- 音乐播放地址
  music_cover_url TEXT,                  -- 音乐封面
  music_duration INTEGER,                -- 音乐时长

  -- 统计数据
  digg_count INTEGER DEFAULT 0,          -- 点赞数
  comment_count INTEGER DEFAULT 0,       -- 评论数
  collect_count INTEGER DEFAULT 0,       -- 收藏数
  share_count INTEGER DEFAULT 0,         -- 分享数
  play_count INTEGER DEFAULT 0,          -- 播放数

  -- 状态
  is_delete INTEGER DEFAULT 0,           -- 是否删除
  is_top INTEGER DEFAULT 0,              -- 是否置顶
  private_status INTEGER DEFAULT 0,      -- 私密状态 0公开 1私密
  allow_share INTEGER DEFAULT 1,         -- 是否允许分享
  allow_comment INTEGER DEFAULT 1,       -- 是否允许评论

  -- 分类标签
  type TEXT DEFAULT 'recommend-video',   -- 视频类型

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (author_user_id) REFERENCES users(uid)
);

CREATE INDEX idx_videos_aweme_id ON videos(aweme_id);
CREATE INDEX idx_videos_author ON videos(author_user_id);
CREATE INDEX idx_videos_create_time ON videos(create_time DESC);
```

#### 4.2.3 评论表 `comments`

```sql
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id TEXT UNIQUE NOT NULL,       -- 评论唯一ID
  aweme_id TEXT NOT NULL,                -- 视频ID
  user_id TEXT NOT NULL,                 -- 评论用户ID

  -- 用户信息（冗余存储）
  nickname TEXT,                         -- 昵称
  avatar TEXT,                           -- 头像
  sec_uid TEXT,                          -- 安全UID
  user_unique_id TEXT,                   -- 用户唯一ID
  user_signature TEXT,                   -- 用户签名

  -- 评论内容
  content TEXT NOT NULL,                 -- 评论内容
  ip_location TEXT,                      -- IP属地
  create_time INTEGER,                   -- 创建时间戳

  -- 互动数据
  digg_count INTEGER DEFAULT 0,          -- 点赞数
  sub_comment_count INTEGER DEFAULT 0,   -- 子评论数

  -- 状态
  is_hot INTEGER DEFAULT 0,              -- 是否热门
  is_author_digged INTEGER DEFAULT 0,    -- 作者是否点赞
  is_folded INTEGER DEFAULT 0,           -- 是否折叠
  user_digged INTEGER DEFAULT 0,         -- 当前用户是否点赞
  user_buried INTEGER DEFAULT 0,         -- 是否被埋

  -- 父评论（支持二级评论）
  parent_id INTEGER DEFAULT NULL,        -- 父评论ID
  reply_user_id TEXT,                    -- 回复用户ID

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (aweme_id) REFERENCES videos(aweme_id),
  FOREIGN KEY (user_id) REFERENCES users(uid),
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);

CREATE INDEX idx_comments_aweme_id ON comments(aweme_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_create_time ON comments(create_time DESC);
```

#### 4.2.4 音乐表 `music`

```sql
CREATE TABLE music (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  music_id TEXT UNIQUE,                  -- 音乐ID（来自抖音）
  title TEXT NOT NULL,                   -- 音乐标题
  author TEXT,                           -- 作者
  cover_medium TEXT,                     -- 中等封面
  cover_thumb TEXT,                      -- 缩略封面
  play_url TEXT,                         -- 播放地址
  duration INTEGER,                      -- 时长（秒）
  user_count INTEGER DEFAULT 0,          -- 使用人数
  owner_id TEXT,                         -- 创建者ID
  owner_nickname TEXT,                   -- 创建者昵称
  is_original INTEGER DEFAULT 0,         -- 是否原创

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_music_id ON music(music_id);
```

#### 4.2.5 帖子表 `posts`

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT UNIQUE,                   -- 帖子ID
  model_type TEXT DEFAULT 'note',        -- 模型类型
  type TEXT DEFAULT 'normal',            -- 类型 video/normal

  title TEXT,                            -- 标题
  display_title TEXT,                    -- 展示标题

  -- 用户信息
  user_id TEXT,                          -- 用户ID
  nickname TEXT,                         -- 昵称
  avatar TEXT,                           -- 头像

  -- 图片资源
  cover_url TEXT,                        -- 封面
  image_list TEXT,                       -- 图片列表（JSON）

  -- 互动
  liked INTEGER DEFAULT 0,               -- 是否点赞
  liked_count INTEGER DEFAULT 0,         -- 点赞数

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
```

#### 4.2.6 商品表 `goods`

```sql
CREATE TABLE goods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- 商品名称
  cover TEXT,                            -- 封面图
  imgs TEXT,                             -- 图片列表（JSON）
  price REAL,                            -- 原价
  real_price REAL,                       -- 实际价格
  is_low_price INTEGER DEFAULT 0,        -- 是否低价
  discount TEXT,                         -- 折扣信息
  sold INTEGER DEFAULT 0,                -- 已售数量
  description TEXT,                      -- 商品描述

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.2.7 用户收藏表 `user_collects`

```sql
CREATE TABLE user_collects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,                 -- 用户ID
  target_type TEXT NOT NULL,             -- 目标类型: video/music/post
  target_id TEXT NOT NULL,               -- 目标ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, target_type, target_id),
  FOREIGN KEY (user_id) REFERENCES users(uid)
);

CREATE INDEX idx_collects_user ON user_collects(user_id);
CREATE INDEX idx_collects_target ON user_collects(target_type, target_id);
```

#### 4.2.8 用户点赞表 `user_likes`

```sql
CREATE TABLE user_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,                 -- 用户ID
  target_type TEXT NOT NULL,             -- 目标类型: video/comment
  target_id TEXT NOT NULL,               -- 目标ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, target_type, target_id),
  FOREIGN KEY (user_id) REFERENCES users(uid)
);

CREATE INDEX idx_likes_user ON user_likes(user_id);
CREATE INDEX idx_likes_target ON user_likes(target_type, target_id);
```

#### 4.2.9 观看历史表 `view_history`

```sql
CREATE TABLE view_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,                 -- 用户ID
  video_id TEXT NOT NULL,                -- 视频ID
  view_duration INTEGER DEFAULT 0,       -- 观看时长（毫秒）
  view_progress REAL DEFAULT 0,          -- 观看进度（百分比）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, video_id),
  FOREIGN KEY (user_id) REFERENCES users(uid),
  FOREIGN KEY (video_id) REFERENCES videos(aweme_id)
);

CREATE INDEX idx_history_user ON view_history(user_id);
CREATE INDEX idx_history_time ON view_history(created_at DESC);
```

---

## 五、资源路径管理

### 5.1 路径策略

支持三种资源路径模式：

```typescript
// 配置示例
interface ResourceConfig {
  // 资源基础路径
  baseUrl: string

  // 路径模式: 'local' | 'remote' | 'hybrid'
  mode: 'local' | 'remote' | 'hybrid'

  // 本地资源目录（相对于应用根目录）
  localPath: string

  // 远程资源基础URL
  remoteUrl: string
}
```

### 5.2 路径处理规则

| 存储值示例              | 本地模式转换                  | 远程模式转换                             |
| ----------------------- | ----------------------------- | ---------------------------------------- |
| `a1.jpg`                | `file:///data/images/a1.jpg`  | `https://cdn.example.com/images/a1.jpg`  |
| `videos/123.mp4`        | `file:///data/videos/123.mp4` | `https://cdn.example.com/videos/123.mp4` |
| `https://xxx.com/a.mp4` | 保持不变                      | 保持不变                                 |

### 5.3 路径处理函数

```typescript
/**
 * 资源路径处理器
 */
class ResourcePathResolver {
  private config: ResourceConfig

  /**
   * 解析资源路径
   * @param path 原始路径
   * @returns 完整可访问路径
   */
  resolve(path: string): string {
    // 已经是完整URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file://')) {
      return path
    }

    switch (this.config.mode) {
      case 'local':
        return `file://${this.config.localPath}/${path}`
      case 'remote':
        return `${this.config.remoteUrl}/${path}`
      case 'hybrid':
        // 混合模式：优先本地，不存在则回退远程
        return this.resolveHybrid(path)
      default:
        return path
    }
  }

  /**
   * 批量解析路径
   */
  resolveBatch(paths: string[]): string[] {
    return paths.map((p) => this.resolve(p))
  }
}
```

---

## 六、配置系统设计

### 6.1 配置文件结构

```typescript
// config/app.config.ts
interface AppConfig {
  // 应用模式
  app: {
    mode: 'web' | 'electron' // 运行模式
    port: number // 服务端口
    host: string // 服务地址
  }

  // 数据库配置
  database: {
    type: 'sqlite'
    path: string // 数据库文件路径
  }

  // Mock 配置
  mock: {
    enabled: boolean // 是否启用 Mock
    mockPaths: string[] // Mock 拦截路径
  }

  // 资源配置
  resource: ResourceConfig

  // 日志配置
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    file: string
  }
}
```

### 6.2 配置文件示例

```yaml
# config/default.yaml
app:
  mode: web
  port: 3001
  host: localhost

database:
  type: sqlite
  path: ./data/douyin.db

mock:
  enabled: true # 开发时启用，生产环境关闭
  mockPaths:
    - /api/video/recommended
    - /api/user/panel

resource:
  mode: hybrid # local | remote | hybrid
  baseUrl: ''
  localPath: ./public/data
  remoteUrl: https://dy.ttentau.top

logging:
  level: debug
  file: ./logs/app.log
```

### 6.3 环境变量覆盖

```bash
# .env.development
APP_MODE=web
MOCK_ENABLED=true
RESOURCE_MODE=hybrid

# .env.production
APP_MODE=electron
MOCK_ENABLED=false
RESOURCE_MODE=local
```

---

## 七、前端适配方案

### 7.1 请求层改造

```typescript
// src/utils/request.ts
import axios from 'axios'

// 从配置读取是否启用 Mock
const MOCK_ENABLED = import.meta.env.VITE_MOCK_ENABLED === 'true'

// 根据环境设置 baseURL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000
})

// 动态加载 Mock
if (MOCK_ENABLED) {
  import('@/mock').then(({ startMock }) => {
    startMock()
  })
}
```

### 7.2 环境变量配置

```bash
# .env.development - 开发环境（Mock 模式）
VITE_MOCK_ENABLED=true
VITE_API_BASE_URL=
VITE_RESOURCE_BASE_URL=

# .env.production - 生产环境（真实接口）
VITE_MOCK_ENABLED=false
VITE_API_BASE_URL=/api
VITE_RESOURCE_BASE_URL=/data
```

---

## 八、项目目录结构

```
项目根目录/
├── config/                          # 配置文件
│   ├── default.yaml                 # 默认配置
│   ├── development.yaml             # 开发环境配置
│   └── production.yaml              # 生产环境配置
│
├── server/                          # 后端服务
│   ├── src/
│   │   ├── index.ts                 # 入口文件
│   │   ├── app.ts                   # Express 应用
│   │   ├── config/                  # 配置加载
│   │   ├── database/                # 数据库
│   │   │   ├── index.ts             # 数据库连接
│   │   │   ├── migrations/          # 迁移文件
│   │   │   └── seeds/               # 种子数据
│   │   ├── routes/                  # 路由
│   │   │   ├── video.ts
│   │   │   ├── user.ts
│   │   │   ├── comment.ts
│   │   │   ├── post.ts
│   │   │   ├── shop.ts
│   │   │   └── music.ts
│   │   ├── controllers/             # 控制器
│   │   ├── services/                # 业务逻辑
│   │   ├── models/                  # 数据模型
│   │   ├── middlewares/             # 中间件
│   │   ├── utils/                   # 工具函数
│   │   └── types/                   # 类型定义
│   ├── prisma/                      # Prisma Schema（可选）
│   │   └── schema.prisma
│   └── package.json
│
├── src/                             # 前端代码（现有）
├── public/                          # 静态资源（现有）
├── data/                            # 数据目录
│   ├── douyin.db                    # SQLite 数据库文件
│   ├── images/                      # 本地图片资源
│   ├── videos/                      # 本地视频资源
│   └── export/                      # 数据导出目录
│
├── electron/                        # Electron 主进程（后期）
│   ├── main.ts
│   ├── preload.ts
│   └── electron-builder.json
│
└── scripts/                         # 脚本工具
    ├── migrate-data.ts              # 数据迁移脚本
    ├── export-data.ts               # 数据导出脚本
    └── seed-db.ts                   # 数据库初始化
```

---

## 九、安全考虑

### 9.1 数据安全

- SQLite 数据库文件权限控制
- 敏感数据加密存储（如用户密码）
- SQL 注入防护（使用参数化查询）

### 9.2 接口安全

- 请求频率限制
- 输入参数校验
- CORS 配置

---

## 十、性能优化

### 10.1 数据库优化

- 合理使用索引
- 分页查询优化
- 连接池管理

### 10.2 缓存策略

- 热门数据内存缓存
- 静态资源 CDN 加速
- 接口响应缓存

---

## 十一、扩展性设计

### 11.1 插件系统

支持通过插件扩展功能：

- 数据导入插件
- 存储后端插件（支持 MySQL、PostgreSQL 等）
- 认证插件

### 11.2 API 版本控制

```
/api/v1/video/recommended
/api/v2/video/recommended
```

---

## 十二、后续规划

### Phase 1（当前版本）

- [ ] SQLite 数据库设计与实现
- [ ] 后端 API 接口开发
- [ ] Mock 模式切换支持
- [ ] 数据迁移脚本

### Phase 2（下一版本）

- [ ] 用户认证系统
- [ ] 互动功能（点赞、评论、收藏）
- [ ] 数据同步机制

### Phase 3（Electron 版本）

- [ ] Electron 集成
- [ ] 本地文件服务
- [ ] 自动更新机制

---

_文档版本：v1.0_
_最后更新：2024年_
