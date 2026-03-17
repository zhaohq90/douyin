# 后端服务

基于 Express + SQLite + Drizzle ORM 的轻量级后端服务。

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产模式
pnpm start

# 数据库操作
pnpm db:generate  # 生成迁移
pnpm db:push      # 推送 schema
pnpm db:studio    # 打开管理界面

# 数据迁移
pnpm migrate-data # 从 JSON 迁移数据到 SQLite
```

## 目录结构

```
server/
├── src/
│   ├── index.ts          # 入口
│   ├── app.ts            # Express 应用
│   ├── config/           # 配置
│   ├── database/         # 数据库
│   ├── routes/           # 路由
│   ├── controllers/      # 控制器
│   ├── services/         # 服务
│   └── utils/            # 工具
├── scripts/              # 脚本
└── package.json
```

## 配置

配置文件位于 `config/` 目录，支持环境变量覆盖。
