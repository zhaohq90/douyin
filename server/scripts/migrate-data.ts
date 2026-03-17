import Database from 'better-sqlite3'
import { readFileSync, existsSync, readdirSync, mkdirSync } from 'fs'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'data/douyin.db')
// 数据源路径：项目根目录的 public/data
const PUBLIC_DATA_PATH = join(process.cwd(), '../public/data')

function createDatabase(): Database.Database {
  const dbDir = join(process.cwd(), 'data')
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  return db
}

function createTables(db: Database.Database) {
  db.exec(`
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
  `)

  db.exec(`
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
  `)

  db.exec(`
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
  `)

  db.exec(`
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
  `)

  db.exec(`
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

  db.exec(`
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

  console.log('[数据库] 表结构创建完成')
}

function getFirstUrl(urlList: unknown): string {
  if (!urlList) return ''
  if (Array.isArray(urlList) && urlList.length > 0) {
    const first = urlList[0]
    if (typeof first === 'string') return first
    if (typeof first === 'object' && first && 'url' in first) return (first as { url: string }).url
  }
  return ''
}

function migrateUsers(db: Database.Database) {
  const usersPath = join(PUBLIC_DATA_PATH, 'users.json')
  if (!existsSync(usersPath)) {
    console.log('[迁移] users.json 不存在，跳过')
    return
  }

  const usersData = JSON.parse(readFileSync(usersPath, 'utf-8'))
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users 
    (uid, unique_id, short_id, nickname, avatar, avatar_168, avatar_300, signature, 
     province, city, country, gender, follower_count, following_count, aweme_count, 
     favoriting_count, cover_url, white_cover_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((users: any[]) => {
    for (const user of users) {
      stmt.run(
        user.uid || '',
        user.unique_id || '',
        user.short_id || '',
        user.nickname || '',
        getFirstUrl(user.avatar_168x168?.url_list) || user.avatar || '',
        getFirstUrl(user.avatar_168x168?.url_list),
        getFirstUrl(user.avatar_300x300?.url_list),
        user.signature || '',
        user.province || '',
        user.city || '',
        user.country || '中国',
        user.gender || 0,
        user.follower_count || 0,
        user.following_count || 0,
        user.aweme_count || 0,
        user.total_favorited || user.favoriting_count || 0,
        getFirstUrl(user.cover_url?.[0]?.url_list),
        getFirstUrl(user.white_cover_url?.[0]?.url_list),
        Date.now(),
        Date.now()
      )
    }
  })

  insertMany(usersData)
  console.log(`[迁移] 用户数据: ${usersData.length} 条`)
}

function migrateVideos(db: Database.Database) {
  const videosPath = join(PUBLIC_DATA_PATH, 'videos.json')
  if (!existsSync(videosPath)) {
    console.log('[迁移] videos.json 不存在，跳过')
    return
  }

  const videosData = JSON.parse(readFileSync(videosPath, 'utf-8'))
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO videos 
    (aweme_id, author_user_id, desc, create_time, video_url, video_uri, cover_url, cover_uri,
     width, height, duration, ratio, horizontal_type, music_id, music_title, music_author,
     music_play_url, music_cover_url, music_duration, digg_count, comment_count, collect_count,
     share_count, play_count, is_delete, is_top, private_status, allow_share, allow_comment, type,
     created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((videos: any[]) => {
    for (const video of videos) {
      const playAddr = video.video?.play_addr || {}
      const cover = video.video?.cover || {}
      const music = video.music || {}
      const stats = video.statistics || {}

      stmt.run(
        video.aweme_id || '',
        String(video.author_user_id || video.author?.uid || ''),
        video.desc || '',
        video.create_time || 0,
        getFirstUrl(playAddr.url_list),
        playAddr.uri || '',
        getFirstUrl(cover.url_list),
        cover.uri || '',
        video.video?.width || playAddr.width || 0,
        video.video?.height || playAddr.height || 0,
        video.video?.duration || video.duration || 0,
        video.video?.ratio || '720p',
        video.video?.horizontal_type || 0,
        String(music.id || ''),
        music.title || '',
        music.author || '',
        getFirstUrl(music.play_url?.url_list),
        getFirstUrl(music.cover_medium?.url_list),
        music.duration || 0,
        stats.digg_count || 0,
        stats.comment_count || 0,
        stats.collect_count || 0,
        stats.share_count || 0,
        stats.play_count || 0,
        video.status?.is_delete ? 1 : 0,
        video.is_top ? 1 : 0,
        video.status?.private_status || 0,
        video.status?.allow_share !== false ? 1 : 0,
        video.aweme_control?.can_comment !== false ? 1 : 0,
        video.type || 'recommend-video',
        Date.now(),
        Date.now()
      )
    }
  })

  insertMany(videosData)
  console.log(`[迁移] 视频数据: ${videosData.length} 条`)
}

function migrateComments(db: Database.Database) {
  const commentsDir = join(PUBLIC_DATA_PATH, 'comments')
  if (!existsSync(commentsDir)) {
    console.log('[迁移] comments 目录不存在，跳过')
    return
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO comments 
    (comment_id, aweme_id, user_id, nickname, avatar, sec_uid, user_unique_id, user_signature,
     content, ip_location, create_time, digg_count, sub_comment_count, is_hot, is_author_digged,
     is_folded, user_digged, user_buried, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const files = readdirSync(commentsDir).filter((f) => f.endsWith('.json'))
  let totalCount = 0

  for (const file of files) {
    const commentsData = JSON.parse(readFileSync(join(commentsDir, file), 'utf-8'))

    const insertMany = db.transaction((comments: any[]) => {
      for (const comment of comments) {
        stmt.run(
          comment.comment_id || '',
          comment.aweme_id || '',
          comment.user_id || '',
          comment.nickname || '',
          comment.avatar || '',
          comment.sec_uid || '',
          comment.user_unique_id || '',
          comment.user_signature || '',
          comment.content || '',
          comment.ip_location || '',
          comment.create_time || 0,
          parseInt(comment.digg_count) || 0,
          parseInt(comment.sub_comment_count) || 0,
          comment.is_hot ? 1 : 0,
          comment.is_author_digged ? 1 : 0,
          comment.is_folded ? 1 : 0,
          comment.user_digged || 0,
          comment.user_buried ? 1 : 0,
          Date.now(),
          Date.now()
        )
      }
    })

    insertMany(commentsData)
    totalCount += commentsData.length
  }

  console.log(`[迁移] 评论数据: ${totalCount} 条 (${files.length} 个文件)`)
}

function migratePosts(db: Database.Database) {
  const postsPath = join(PUBLIC_DATA_PATH, 'posts.json')
  if (!existsSync(postsPath)) {
    console.log('[迁移] posts.json 不存在，跳过')
    return
  }

  const postsData = JSON.parse(readFileSync(postsPath, 'utf-8'))
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO posts 
    (post_id, model_type, type, display_title, user_id, nickname, avatar, cover_url, 
     image_list, liked, liked_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((posts: any[]) => {
    for (const post of posts) {
      const noteCard = post.note_card || {}
      const user = noteCard.user || {}

      let imageList = ''
      if (noteCard.image_list && Array.isArray(noteCard.image_list)) {
        const urls = noteCard.image_list
          .map((img: any) => img.info_list?.[0]?.url || '')
          .filter(Boolean)
        imageList = JSON.stringify(urls)
      }

      stmt.run(
        post.id || '',
        post.model_type || 'note',
        noteCard.type || 'normal',
        noteCard.display_title || '',
        user.user_id || '',
        user.nickname || '',
        user.avatar || '',
        noteCard.cover?.url_default || '',
        imageList,
        noteCard.interact_info?.liked ? 1 : 0,
        parseInt(noteCard.interact_info?.liked_count) || 0,
        Date.now(),
        Date.now()
      )
    }
  })

  insertMany(postsData)
  console.log(`[迁移] 帖子数据: ${postsData.length} 条`)
}

function migrateGoods(db: Database.Database) {
  const goodsPath = join(PUBLIC_DATA_PATH, 'goods.json')
  if (!existsSync(goodsPath)) {
    console.log('[迁移] goods.json 不存在，跳过')
    return
  }

  const goodsData = JSON.parse(readFileSync(goodsPath, 'utf-8'))
  const stmt = db.prepare(`
    INSERT INTO goods 
    (name, cover, imgs, price, real_price, is_low_price, discount, sold, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertMany = db.transaction((goods: any[]) => {
    for (const item of goods) {
      stmt.run(
        item.name || '',
        item.cover || '',
        JSON.stringify(item.imgs || []),
        item.price || 0,
        item.real_price || 0,
        item.isLowPrice ? 1 : 0,
        item.discount || '',
        item.sold || 0,
        Date.now(),
        Date.now()
      )
    }
  })

  insertMany(goodsData)
  console.log(`[迁移] 商品数据: ${goodsData.length} 条`)
}

async function main() {
  console.log('[开始] 数据迁移...')
  console.log(`[路径] 数据库: ${DB_PATH}`)
  console.log(`[路径] 数据源: ${PUBLIC_DATA_PATH}`)

  const db = createDatabase()

  try {
    createTables(db)

    migrateUsers(db)
    migrateVideos(db)
    migrateComments(db)
    migratePosts(db)
    migrateGoods(db)

    const stats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number },
      videos: db.prepare('SELECT COUNT(*) as count FROM videos').get() as { count: number },
      comments: db.prepare('SELECT COUNT(*) as count FROM comments').get() as { count: number },
      posts: db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number },
      goods: db.prepare('SELECT COUNT(*) as count FROM goods').get() as { count: number }
    }

    console.log('\n[统计] 迁移完成:')
    console.log(`  - 用户: ${stats.users.count} 条`)
    console.log(`  - 视频: ${stats.videos.count} 条`)
    console.log(`  - 评论: ${stats.comments.count} 条`)
    console.log(`  - 帖子: ${stats.posts.count} 条`)
    console.log(`  - 商品: ${stats.goods.count} 条`)
  } finally {
    db.close()
  }

  console.log('\n[完成] 数据迁移结束')
}

main().catch(console.error)
