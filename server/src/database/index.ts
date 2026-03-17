/**
 * 数据库连接模块
 * 使用 better-sqlite3 + Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema.js'
import { config } from '../config/index.js'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// 确保数据目录存在
const dbDir = join(process.cwd(), 'data')
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

// 数据库文件路径
const dbPath = join(process.cwd(), config.database.path)

console.log(`[数据库] 初始化 SQLite 数据库: ${dbPath}`)

// 创建 SQLite 连接
const sqlite = new Database(dbPath)

// 启用 WAL 模式以提升并发性能
sqlite.pragma('journal_mode = WAL')

// 创建 Drizzle ORM 实例
export const db = drizzle(sqlite, { schema })

// 导出 schema 供其他模块使用
export * from './schema.js'

/**
 * 关闭数据库连接
 */
export function closeDatabase() {
  sqlite.close()
  console.log('[数据库] 连接已关闭')
}

/**
 * 初始化数据库表（如果不存在）
 */
export function initDatabase() {
  console.log('[数据库] 初始化表结构...')

  // 创建用户表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid TEXT UNIQUE NOT NULL,
      unique_id TEXT,
      short_id TEXT,
      nickname TEXT NOT NULL,
      avatar TEXT,
      avatar_168 TEXT,
      avatar_300 TEXT,
      signature TEXT,
      province TEXT,
      city TEXT,
      country TEXT DEFAULT '中国',
      gender INTEGER DEFAULT 0,
      birthday TEXT,
      follower_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      aweme_count INTEGER DEFAULT 0,
      favoriting_count INTEGER DEFAULT 0,
      cover_url TEXT,
      white_cover_url TEXT,
      ip_location TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
    CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
  `)

  // 创建音乐表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS music (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      music_id TEXT UNIQUE,
      title TEXT NOT NULL,
      author TEXT,
      cover_medium TEXT,
      cover_thumb TEXT,
      play_url TEXT,
      duration INTEGER,
      user_count INTEGER DEFAULT 0,
      owner_id TEXT,
      owner_nickname TEXT,
      is_original INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_music_id ON music(music_id);
  `)

  // 创建视频表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aweme_id TEXT UNIQUE NOT NULL,
      author_user_id TEXT NOT NULL,
      desc TEXT,
      create_time INTEGER,
      video_url TEXT,
      video_uri TEXT,
      cover_url TEXT,
      cover_uri TEXT,
      poster_url TEXT,
      width INTEGER,
      height INTEGER,
      duration INTEGER,
      ratio TEXT,
      horizontal_type INTEGER DEFAULT 0,
      music_id TEXT,
      music_title TEXT,
      music_author TEXT,
      music_play_url TEXT,
      music_cover_url TEXT,
      music_duration INTEGER,
      digg_count INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      collect_count INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      play_count INTEGER DEFAULT 0,
      is_delete INTEGER DEFAULT 0,
      is_top INTEGER DEFAULT 0,
      private_status INTEGER DEFAULT 0,
      allow_share INTEGER DEFAULT 1,
      allow_comment INTEGER DEFAULT 1,
      type TEXT DEFAULT 'recommend-video',
      created_at INTEGER,
      updated_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_videos_aweme_id ON videos(aweme_id);
    CREATE INDEX IF NOT EXISTS idx_videos_author ON videos(author_user_id);
    CREATE INDEX IF NOT EXISTS idx_videos_create_time ON videos(create_time DESC);
  `)

  // 创建评论表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id TEXT UNIQUE NOT NULL,
      aweme_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT,
      sec_uid TEXT,
      user_unique_id TEXT,
      user_signature TEXT,
      content TEXT NOT NULL,
      ip_location TEXT,
      create_time INTEGER,
      digg_count INTEGER DEFAULT 0,
      sub_comment_count INTEGER DEFAULT 0,
      is_hot INTEGER DEFAULT 0,
      is_author_digged INTEGER DEFAULT 0,
      is_folded INTEGER DEFAULT 0,
      user_digged INTEGER DEFAULT 0,
      user_buried INTEGER DEFAULT 0,
      parent_id INTEGER,
      reply_user_id TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_comments_aweme_id ON comments(aweme_id);
    CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_create_time ON comments(create_time DESC);
  `)

  // 创建帖子表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT UNIQUE,
      model_type TEXT DEFAULT 'note',
      type TEXT DEFAULT 'normal',
      title TEXT,
      display_title TEXT,
      user_id TEXT,
      nickname TEXT,
      avatar TEXT,
      cover_url TEXT,
      image_list TEXT,
      liked INTEGER DEFAULT 0,
      liked_count INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
  `)

  // 创建商品表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS goods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      cover TEXT,
      imgs TEXT,
      price REAL,
      real_price REAL,
      is_low_price INTEGER DEFAULT 0,
      discount TEXT,
      sold INTEGER DEFAULT 0,
      description TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
  `)

  // 创建用户收藏表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS user_collects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      created_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_collects_user ON user_collects(user_id);
    CREATE INDEX IF NOT EXISTS idx_collects_target ON user_collects(target_type, target_id);
  `)

  // 创建用户点赞表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS user_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      created_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_likes_user ON user_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_likes_target ON user_likes(target_type, target_id);
  `)

  // 创建观看历史表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS view_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      view_duration INTEGER DEFAULT 0,
      view_progress REAL DEFAULT 0,
      created_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_history_user ON view_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_history_time ON view_history(created_at DESC);
  `)

  console.log('[数据库] 表结构初始化完成')
}
