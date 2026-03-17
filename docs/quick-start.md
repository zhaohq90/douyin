# 快速启动指南

## 一、环境准备

```bash
# 1. 安装后端依赖
cd server && pnpm install

# 2. 初始化数据库并迁移数据（首次运行）
pnpm migrate-data

# 3. 启动后端服务
pnpm dev
```

## 二、启动方式

### 方式一：Mock 模式（默认，无需后端）

```bash
# 在项目根目录
pnpm dev
```

前端会使用 Mock 数据，无需启动后端服务。

### 方式二：真实后端模式

```bash
# 终端 1：启动后端
pnpm server:dev

# 终端 2：启动前端
pnpm dev
```

修改 `env/.env.development`：

```
VITE_MOCK_ENABLED=false
```

## 三、配置说明

### 环境变量

| 变量                     | 说明          | 默认值  |
| ------------------------ | ------------- | ------- |
| `VITE_MOCK_ENABLED`      | 是否启用 Mock | `true`  |
| `VITE_API_BASE_URL`      | API 基础路径  | `/api`  |
| `VITE_RESOURCE_BASE_URL` | 资源基础路径  | `/data` |

### 配置文件

- `config/default.yaml` - 默认配置
- `config/development.yaml` - 开发环境
- `config/production.yaml` - 生产环境

## 四、后端 API

### 视频模块

```
GET /api/video/recommended     # 推荐视频（分页）
GET /api/video/long/recommended # 长视频推荐
GET /api/video/:id             # 视频详情
GET /api/video/:id/comments    # 视频评论
GET /api/video/private         # 私密视频
GET /api/video/like            # 点赞视频
GET /api/video/my              # 我的视频
GET /api/video/history         # 历史记录
```

### 用户模块

```
GET /api/user/panel            # 当前用户信息
GET /api/user/friends          # 好友列表
GET /api/user/collect          # 收藏列表
GET /api/user/video_list       # 用户视频列表
```

### 其他模块

```
GET /api/comment/video/:videoId # 视频评论
GET /api/post/recommended      # 推荐帖子
GET /api/shop/recommended      # 推荐商品
GET /api/music/list            # 音乐列表
```

## 五、数据库

### 表结构

- `users` - 用户表
- `videos` - 视频表
- `comments` - 评论表
- `music` - 音乐表
- `posts` - 帖子表
- `goods` - 商品表
- `user_collects` - 用户收藏
- `user_likes` - 用户点赞
- `view_history` - 观看历史

### 数据库文件

```
data/douyin.db  # SQLite 数据库
```

## 六、目录结构

```
├── server/                # 后端服务
│   ├── src/
│   │   ├── index.ts       # 入口
│   │   ├── app.ts         # Express 应用
│   │   ├── config/        # 配置
│   │   ├── database/      # 数据库
│   │   ├── routes/        # 路由
│   │   ├── services/      # 服务
│   │   └── utils/         # 工具
│   └── scripts/           # 脚本
│
├── config/                # 配置文件
├── env/                   # 环境变量
├── data/                  # 数据目录
│   └── douyin.db          # SQLite 数据库
│
└── src/                   # 前端代码
```

## 七、常见问题

### 1. 后端启动报错

```bash
# 检查依赖是否安装
cd server && pnpm install
```

### 2. 数据库为空

```bash
# 运行数据迁移
cd server && pnpm migrate-data
```

### 3. 前端请求 404

检查 `VITE_MOCK_ENABLED` 配置：

- `true`：使用 Mock 数据
- `false`：使用真实后端（需启动后端服务）

---

_更多信息请参考 `docs/backend-requirements.md` 和 `docs/development-plan.md`_
