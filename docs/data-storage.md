# 📊 数据存储架构分析报告

> 本文档分析 douyin-vue 项目的数据存储实现方式

## 一、项目概述

这是一个名为 `douyin-vue` 的抖音/TikTok 风格的移动端短视频项目，使用 **Vue3 + Vite5 + Pinia** 技术栈。数据存储采用**本地 JSON 文件**方式，通过 `axios-mock-adapter` 拦截 API 请求并返回本地数据，模拟真实后端请求。

---

## 二、数据存储方式

### 1. 核心技术方案

| 技术                   | 用途                                   |
| ---------------------- | -------------------------------------- |
| **JSON 文件**          | 存储所有静态数据（视频、用户、评论等） |
| **axios-mock-adapter** | 拦截 HTTP 请求，返回本地 JSON 数据     |
| **Pinia Store**        | 前端状态管理，缓存用户数据             |
| **远程 CDN**           | 图片、视频等媒体资源存储在远程服务器   |

### 2. Mock 实现原理

```typescript
// src/mock/index.ts 核心逻辑
import MockAdapter from 'axios-mock-adapter'
const mock = new MockAdapter(axiosInstance)

// 拦截 API 请求，返回本地 JSON 数据
mock.onGet(/video\/recommended/).reply(async (config) => {
  return [200, { data: { list: allRecommendVideos.slice(start, start + pageSize) } }]
})
```

---

## 三、数据目录结构

```
项目根目录/
├── public/data/                    # 主要数据存储目录（部署后可访问）
│   ├── videos.json / videos.md     # 视频数据（128554行，约数万条视频）
│   ├── users.json / users.md       # 用户数据
│   ├── posts.json / posts.md       # 帖子/笔记数据（小红书风格）
│   ├── goods.json / goods.md       # 商品数据
│   ├── comments/                   # 评论数据目录
│   │   └── video_id_xxx.json       # 按视频ID分组的评论
│   └── user_video_list/            # 用户视频列表目录
│       └── user-xxx.json           # 按用户ID分组的视频列表
│
├── src/assets/data/                # 前端静态资源数据
│   ├── posts6.json                 # 预置视频数据（初始加载）
│   ├── resource.js                 # 本地资源（好友列表、音乐等）
│   └── lyrics/                     # 歌词数据
│
└── node/                           # 数据处理脚本目录（开发工具）
    ├── user/                       # 用户数据处理
    │   ├── process-user.js         # 数据清洗脚本
    │   └── user.json               # 原始用户数据
    ├── post/                       # 帖子数据处理
    │   ├── process-post.js         # 数据清洗脚本
    │   └── data/                   # 处理后的帖子数据
    └── comment/                    # 评论数据处理
        ├── process.js              # 数据分割脚本
        └── data/                   # 评论原始数据
```

---

## 四、数据类型与结构

### 1. 视频数据 (`public/data/videos.json`)

```json
{
  "aweme_id": "7265649807396474112",      // 视频唯一ID
  "desc": "放弃自己喜欢的人会遗憾吗?",      // 视频描述
  "author_user_id": "68310389333",        // 作者ID
  "video": {
    "play_addr": { "url_list": [...] },   // 播放地址
    "cover": { "url_list": [...] },       // 封面
    "duration": 12934,                     // 时长（毫秒）
    "width": 3840, "height": 2160         // 尺寸
  },
  "music": { ... },                        // 背景音乐
  "statistics": {                          // 统计数据
    "comment_count": 23255,
    "digg_count": 1362256,
    "share_count": 71465
  }
}
```

### 2. 用户数据 (`public/data/users.json`)

```json
{
  "uid": "68310389333",                   // 用户唯一ID
  "nickname": "李子柒",                    // 昵称
  "unique_id": "",                         // 唯一标识
  "short_id": "71158770",                  // 短ID
  "avatar_168x168": { "url_list": [...] }, // 头像
  "follower_count": 40201989,              // 粉丝数
  "following_count": 1,                    // 关注数
  "aweme_count": 772,                      // 作品数
  "signature": "李家有女，人称子柒",         // 签名
  "province": "四川", "city": "绵阳"       // 地理位置
}
```

### 3. 评论数据 (`public/data/comments/video_id_xxx.json`)

评论按视频 ID 分文件存储，每个文件包含该视频的所有评论。

### 4. 帖子数据 (`public/data/posts.json`）

来源于小红书的图文笔记数据：

```json
{
  "id": "62ff8ad3000000001e008fa1",
  "note_card": {
    "type": "video",
    "display_title": "孕前的腰围56cm希望卸货后不影响",
    "user": { "nickname": "一只小羊🐑" },
    "image_list": [...]
  }
}
```

### 5. 商品数据 (`public/data/goods.json`)

```json
{
  "name": "小米电视6 65\" OLED",
  "cover": "g6-0.jpg",
  "price": 6699,
  "real_price": 399,
  "sold": 863
}
```

---

## 五、数据流向

```
┌─────────────────────────────────────────────────────────────────┐
│                         数据流向图                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [public/data/*.json]  ─────┐                                   │
│                             │                                   │
│  [src/assets/data/*]   ─────┼──▶ [axios-mock-adapter] ──▶ API   │
│                             │         │                         │
│  [远程CDN/服务器]      ─────┘         │                         │
│                                       ▼                         │
│                              [Vue 组件]                         │
│                                   │                             │
│                                   ▼                             │
│                              [Pinia Store]                      │
│                              （状态缓存）                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 六、配置说明

### URL 配置 (`src/config/index.ts`)

```typescript
export const BASE_URL = '' // 根据部署环境自动适配
export const FILE_URL = BASE_URL + '/data/' // 数据文件路径
```

### 状态管理 (`src/store/pinia.ts`)

- 使用 Pinia 管理全局状态
- `users` 数组缓存用户列表
- `userinfo` 对象存储当前用户信息
- `init()` 方法从 Mock API 初始化数据

---

## 七、数据处理工具 (`node/` 目录）

这些是 Node.js 脚本，用于处理和清洗原始数据：

| 脚本                        | 功能                            |
| --------------------------- | ------------------------------- |
| `node/user/process-user.js` | 过滤用户数据字段，保留必要信息  |
| `node/post/process-post.js` | 处理视频/帖子数据，提取关键字段 |
| `node/comment/process.js`   | 按视频ID分割评论数据            |

---

## 八、优缺点分析

### ✅ 优点

- 无需后端服务器，部署简单
- 静态数据可部署到任意静态托管服务
- 前端开发调试方便

### ❌ 缺点

- 数据量受限于 JSON 文件大小
- 无法实现真正的用户交互（点赞、评论等）
- 数据更新需要重新部署

---

## 九、总结

本项目采用**本地 JSON 文件 + Mock API** 的数据存储方案，适合学习和演示项目。主要数据存储在 `public/data/` 目录，包括视频、用户、评论、商品等类型。通过 `axios-mock-adapter` 拦截请求返回本地数据，实现了无需后端的完整功能演示。
