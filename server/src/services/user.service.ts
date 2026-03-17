import { db, users, videos, userCollects, music } from '../database/index.js'
import { eq, desc, sql, inArray } from 'drizzle-orm'
import type { User, Video, Music } from '../database/schema.js'
import { getPagination } from '../utils/pagination.js'
import { resolveResource } from '../utils/resource-path.js'

function formatUser(user: User) {
  return {
    uid: user.uid,
    unique_id: user.uniqueId || '',
    short_id: user.shortId || '',
    nickname: user.nickname,
    avatar_168x168: {
      height: 720,
      uri: user.avatar168 || '',
      url_list: user.avatar168 ? [resolveResource(user.avatar168)] : [],
      width: 720
    },
    avatar_300x300: {
      height: 720,
      uri: user.avatar300 || '',
      url_list: user.avatar300 ? [resolveResource(user.avatar300)] : [],
      width: 720
    },
    signature: user.signature || '',
    province: user.province || '',
    city: user.city || '',
    country: user.country || '中国',
    gender: user.gender || 0,
    follower_count: user.followerCount || 0,
    following_count: user.followingCount || 0,
    aweme_count: user.awemeCount || 0,
    favoriting_count: user.favoritingCount || 0,
    cover_url: user.coverUrl ? [{ url_list: [resolveResource(user.coverUrl)] }] : [],
    white_cover_url: user.whiteCoverUrl
      ? [{ url_list: [resolveResource(user.whiteCoverUrl)] }]
      : [],
    ip_location: user.ipLocation || ''
  }
}

function formatMusicItem(m: Music) {
  return {
    id: String(m.musicId || m.id),
    name: m.title,
    mp3: resolveResource(m.playUrl),
    cover: resolveResource(m.coverMedium),
    author: m.author || '',
    duration: m.duration || 60,
    use_count: m.userCount || 0,
    is_collect: false,
    is_play: false
  }
}

export async function getUserPanel() {
  const userList = await db.select().from(users).orderBy(desc(users.followerCount)).limit(1)

  if (userList.length === 0) return null
  return formatUser(userList[0])
}

export async function getFriends() {
  const userList = await db.select().from(users).orderBy(desc(users.followerCount)).limit(20)

  return userList.map(formatUser)
}

export async function getUserById(uid: string) {
  const user = await db.select().from(users).where(eq(users.uid, uid)).limit(1)

  if (user.length === 0) return null
  return formatUser(user[0])
}

export async function getUserCollects(userId: string, pageNo: number, pageSize: number) {
  const pagination = getPagination({ pageNo, pageSize })

  const collects = await db
    .select()
    .from(userCollects)
    .where(eq(userCollects.userId, userId))
    .limit(pagination.limit)
    .offset(pagination.offset)

  const videoCollects = collects.filter((c) => c.targetType === 'video')
  const musicCollects = collects.filter((c) => c.targetType === 'music')

  let videoList: Video[] = []
  if (videoCollects.length > 0) {
    const videoIds = videoCollects.map((c) => c.targetId)
    videoList = await db.select().from(videos).where(inArray(videos.awemeId, videoIds))
  }

  let musicList: Music[] = []
  if (musicCollects.length > 0) {
    const musicIds = musicCollects.map((c) => c.targetId)
    musicList = await db.select().from(music).where(inArray(music.musicId, musicIds))
  }

  return {
    video: {
      total: videoList.length,
      list: videoList.map((v) => ({
        aweme_id: v.awemeId,
        desc: v.desc,
        type: v.type || 'recommend-video'
      }))
    },
    music: {
      total: musicList.length,
      list: musicList.map(formatMusicItem)
    }
  }
}
