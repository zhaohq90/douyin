/**
 * 数据库 Schema 定义
 * 使用 Drizzle ORM 定义 SQLite 数据库表结构
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

/**
 * 用户表
 * 存储抖音用户信息
 */
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uid: text('uid').unique().notNull(), // 抖音用户ID
  uniqueId: text('unique_id'), // 唯一标识
  shortId: text('short_id'), // 短ID
  nickname: text('nickname').notNull(), // 昵称
  avatar: text('avatar'), // 头像路径
  avatar168: text('avatar_168'), // 168x168 头像
  avatar300: text('avatar_300'), // 300x300 头像
  signature: text('signature'), // 签名
  province: text('province'), // 省份
  city: text('city'), // 城市
  country: text('country').default('中国'), // 国家
  gender: integer('gender').default(0), // 性别 0未知 1男 2女
  birthday: text('birthday'), // 生日
  followerCount: integer('follower_count').default(0), // 粉丝数
  followingCount: integer('following_count').default(0), // 关注数
  awemeCount: integer('aweme_count').default(0), // 作品数
  favoritingCount: integer('favoriting_count').default(0), // 获赞数
  coverUrl: text('cover_url'), // 背景图
  whiteCoverUrl: text('white_cover_url'), // 白色背景图
  ipLocation: text('ip_location'), // IP属地
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * 音乐表
 * 存储视频背景音乐信息
 */
export const music = sqliteTable('music', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  musicId: text('music_id').unique(), // 音乐ID（来自抖音）
  title: text('title').notNull(), // 音乐标题
  author: text('author'), // 作者
  coverMedium: text('cover_medium'), // 中等封面
  coverThumb: text('cover_thumb'), // 缩略封面
  playUrl: text('play_url'), // 播放地址
  duration: integer('duration'), // 时长（秒）
  userCount: integer('user_count').default(0), // 使用人数
  ownerId: text('owner_id'), // 创建者ID
  ownerNickname: text('owner_nickname'), // 创建者昵称
  isOriginal: integer('is_original').default(0), // 是否原创
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * 视频表
 * 存储视频信息
 */
export const videos = sqliteTable('videos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  awemeId: text('aweme_id').unique().notNull(), // 视频唯一ID
  authorUserId: text('author_user_id').notNull(), // 作者用户ID

  // 基础信息
  desc: text('desc'), // 视频描述
  createTime: integer('create_time'), // 创建时间戳

  // 视频资源
  videoUrl: text('video_url'), // 视频播放地址
  videoUri: text('video_uri'), // 视频URI标识
  coverUrl: text('cover_url'), // 封面图地址
  coverUri: text('cover_uri'), // 封面URI
  posterUrl: text('poster_url'), // 海报图地址
  width: integer('width'), // 视频宽度
  height: integer('height'), // 视频高度
  duration: integer('duration'), // 时长（毫秒）
  ratio: text('ratio'), // 分辨率标识
  horizontalType: integer('horizontal_type').default(0), // 横竖屏

  // 音乐信息（冗余存储）
  musicId: text('music_id'), // 音乐ID
  musicTitle: text('music_title'), // 音乐标题
  musicAuthor: text('music_author'), // 音乐作者
  musicPlayUrl: text('music_play_url'), // 音乐播放地址
  musicCoverUrl: text('music_cover_url'), // 音乐封面
  musicDuration: integer('music_duration'), // 音乐时长

  // 统计数据
  diggCount: integer('digg_count').default(0), // 点赞数
  commentCount: integer('comment_count').default(0), // 评论数
  collectCount: integer('collect_count').default(0), // 收藏数
  shareCount: integer('share_count').default(0), // 分享数
  playCount: integer('play_count').default(0), // 播放数

  // 状态
  isDelete: integer('is_delete').default(0), // 是否删除
  isTop: integer('is_top').default(0), // 是否置顶
  privateStatus: integer('private_status').default(0), // 私密状态
  allowShare: integer('allow_share').default(1), // 是否允许分享
  allowComment: integer('allow_comment').default(1), // 是否允许评论

  // 分类
  type: text('type').default('recommend-video'), // 视频类型

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * 评论表
 * 存储视频评论信息，支持二级评论
 */
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  commentId: text('comment_id').unique().notNull(), // 评论唯一ID
  awemeId: text('aweme_id').notNull(), // 视频ID
  userId: text('user_id').notNull(), // 评论用户ID

  // 用户信息（冗余存储）
  nickname: text('nickname'), // 昵称
  avatar: text('avatar'), // 头像
  secUid: text('sec_uid'), // 安全UID
  userUniqueId: text('user_unique_id'), // 用户唯一ID
  userSignature: text('user_signature'), // 用户签名

  // 评论内容
  content: text('content').notNull(), // 评论内容
  ipLocation: text('ip_location'), // IP属地
  createTime: integer('create_time'), // 创建时间戳

  // 互动数据
  diggCount: integer('digg_count').default(0), // 点赞数
  subCommentCount: integer('sub_comment_count').default(0), // 子评论数

  // 状态
  isHot: integer('is_hot').default(0), // 是否热门
  isAuthorDigged: integer('is_author_digged').default(0), // 作者是否点赞
  isFolded: integer('is_folded').default(0), // 是否折叠
  userDigged: integer('user_digged').default(0), // 当前用户是否点赞
  userBuried: integer('user_buried').default(0), // 是否被埋

  // 父评论（支持二级评论）
  parentId: integer('parent_id'), // 父评论ID
  replyUserId: text('reply_user_id'), // 回复用户ID

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * 帖子表
 * 存储小红书风格的图文帖子
 */
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: text('post_id').unique(), // 帖子ID
  modelType: text('model_type').default('note'), // 模型类型
  type: text('type').default('normal'), // 类型 video/normal

  title: text('title'), // 标题
  displayTitle: text('display_title'), // 展示标题

  // 用户信息
  userId: text('user_id'), // 用户ID
  nickname: text('nickname'), // 昵称
  avatar: text('avatar'), // 头像

  // 图片资源
  coverUrl: text('cover_url'), // 封面
  imageList: text('image_list'), // 图片列表（JSON）

  // 互动
  liked: integer('liked').default(0), // 是否点赞
  likedCount: integer('liked_count').default(0), // 点赞数

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * 商品表
 * 存储商城商品信息
 */
export const goods = sqliteTable('goods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), // 商品名称
  cover: text('cover'), // 封面图
  imgs: text('imgs'), // 图片列表（JSON）
  price: real('price'), // 原价
  realPrice: real('real_price'), // 实际价格
  isLowPrice: integer('is_low_price').default(0), // 是否低价
  discount: text('discount'), // 折扣信息
  sold: integer('sold').default(0), // 已售数量
  description: text('description'), // 商品描述

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * 用户收藏表
 * 记录用户的视频、音乐收藏
 */
export const userCollects = sqliteTable('user_collects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // 用户ID
  targetType: text('target_type').notNull(), // 目标类型: video/music/post
  targetId: text('target_id').notNull(), // 目标ID
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * 用户点赞表
 * 记录用户对视频、评论的点赞
 */
export const userLikes = sqliteTable('user_likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // 用户ID
  targetType: text('target_type').notNull(), // 目标类型: video/comment
  targetId: text('target_id').notNull(), // 目标ID
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

/**
 * 观看历史表
 * 记录用户的视频观看历史
 */
export const viewHistory = sqliteTable('view_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(), // 用户ID
  videoId: text('video_id').notNull(), // 视频ID
  viewDuration: integer('view_duration').default(0), // 观看时长（毫秒）
  viewProgress: real('view_progress').default(0), // 观看进度（百分比）
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

// 导出类型
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Music = typeof music.$inferSelect
export type NewMusic = typeof music.$inferInsert
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Good = typeof goods.$inferSelect
export type NewGood = typeof goods.$inferInsert
export type UserCollect = typeof userCollects.$inferSelect
export type UserLike = typeof userLikes.$inferSelect
export type ViewHistory = typeof viewHistory.$inferSelect
