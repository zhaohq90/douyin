import { db, videos, users } from '../database/index.js'
import { eq, desc, sql, inArray } from 'drizzle-orm'
import type { Video, User } from '../database/schema.js'
import { getPagination, getStartPagination } from '../utils/pagination.js'
import { resolveResource } from '../utils/resource-path.js'

function formatVideoAuthor(user: User | undefined) {
  if (!user) return undefined
  return {
    uid: user.uid,
    nickname: user.nickname,
    avatar_168x168: { url_list: user.avatar168 ? [resolveResource(user.avatar168)] : [] },
    avatar_300x300: { url_list: user.avatar300 ? [resolveResource(user.avatar300)] : [] },
    signature: user.signature,
    follower_count: user.followerCount,
    cover_url: user.coverUrl ? [{ url_list: [resolveResource(user.coverUrl)] }] : [],
    white_cover_url: user.whiteCoverUrl ? [{ url_list: [resolveResource(user.whiteCoverUrl)] }] : []
  }
}

function formatVideo(video: Video, author?: User) {
  return {
    aweme_id: video.awemeId,
    desc: video.desc || '',
    create_time: video.createTime || 0,
    author_user_id: video.authorUserId,
    author: formatVideoAuthor(author),
    video: {
      play_addr: {
        uri: video.videoUri || '',
        url_list: video.videoUrl ? [resolveResource(video.videoUrl)] : [],
        width: video.width || 0,
        height: video.height || 0
      },
      cover: {
        uri: video.coverUri || '',
        url_list: video.coverUrl ? [resolveResource(video.coverUrl)] : [],
        width: 720,
        height: 720
      },
      duration: video.duration || 0,
      width: video.width || 0,
      height: video.height || 0,
      ratio: video.ratio || '720p',
      horizontal_type: video.horizontalType || 0
    },
    music: {
      id: video.musicId || '',
      title: video.musicTitle || '',
      author: video.musicAuthor || '',
      cover_medium: { url_list: video.musicCoverUrl ? [resolveResource(video.musicCoverUrl)] : [] },
      cover_thumb: { url_list: [] },
      play_url: { url_list: video.musicPlayUrl ? [resolveResource(video.musicPlayUrl)] : [] },
      duration: video.musicDuration || 0
    },
    statistics: {
      admire_count: 0,
      comment_count: video.commentCount || 0,
      digg_count: video.diggCount || 0,
      collect_count: video.collectCount || 0,
      play_count: video.playCount || 0,
      share_count: video.shareCount || 0
    },
    status: {
      is_delete: Boolean(video.isDelete),
      allow_share: Boolean(video.allowShare),
      is_prohibited: false,
      private_status: video.privateStatus || 0
    },
    share_url: '',
    type: video.type || 'recommend-video'
  }
}

export async function getRecommendedVideos(start: number, pageSize: number) {
  const pagination = getStartPagination(start, pageSize)

  const videoList = await db
    .select()
    .from(videos)
    .where(eq(videos.isDelete, 0))
    .orderBy(desc(videos.createTime))
    .limit(pagination.limit)
    .offset(pagination.offset)

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(eq(videos.isDelete, 0))

  const total = Number(totalResult[0]?.count || 0)

  const userIds = [...new Set(videoList.map((v) => v.authorUserId))]
  const userList =
    userIds.length > 0 ? await db.select().from(users).where(inArray(users.uid, userIds)) : []

  const userMap = new Map(userList.map((u) => [u.uid, u]))

  const formattedVideos = videoList.map((v) => formatVideo(v, userMap.get(v.authorUserId)))

  return {
    total,
    list: formattedVideos
  }
}

export async function getVideosByPage(pageNo: number, pageSize: number) {
  const pagination = getPagination({ pageNo, pageSize })

  const videoList = await db
    .select()
    .from(videos)
    .where(eq(videos.isDelete, 0))
    .orderBy(desc(videos.createTime))
    .limit(pagination.limit)
    .offset(pagination.offset)

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(eq(videos.isDelete, 0))

  const total = Number(totalResult[0]?.count || 0)

  const userIds = [...new Set(videoList.map((v) => v.authorUserId))]
  const userList =
    userIds.length > 0 ? await db.select().from(users).where(inArray(users.uid, userIds)) : []

  const userMap = new Map(userList.map((u) => [u.uid, u]))

  const formattedVideos = videoList.map((v) => formatVideo(v, userMap.get(v.authorUserId)))

  return {
    total,
    pageNo: pagination.pageNo,
    list: formattedVideos
  }
}

export async function getPrivateVideos(pageNo: number, pageSize: number) {
  const pagination = getPagination({ pageNo, pageSize })

  const videoList = await db
    .select()
    .from(videos)
    .where(eq(videos.privateStatus, 1))
    .orderBy(desc(videos.createTime))
    .limit(pagination.limit)
    .offset(pagination.offset)

  return {
    total: videoList.length,
    pageNo: pagination.pageNo,
    list: videoList.map((v) => formatVideo(v))
  }
}

export async function getLikeVideos(pageNo: number, pageSize: number) {
  return getVideosByPage(pageNo, pageSize)
}

export async function getMyVideos(pageNo: number, pageSize: number) {
  return getVideosByPage(pageNo, pageSize)
}

export async function getHistoryVideos(pageNo: number, pageSize: number) {
  return getVideosByPage(pageNo, pageSize)
}

export async function getVideoById(awemeId: string) {
  const video = await db.select().from(videos).where(eq(videos.awemeId, awemeId)).limit(1)

  if (video.length === 0) return null

  const user = await db.select().from(users).where(eq(users.uid, video[0].authorUserId)).limit(1)

  return formatVideo(video[0], user[0])
}

export async function getVideosByUserId(userId: string, pageNo: number, pageSize: number) {
  const pagination = getPagination({ pageNo, pageSize })

  const videoList = await db
    .select()
    .from(videos)
    .where(eq(videos.authorUserId, userId))
    .orderBy(desc(videos.createTime))
    .limit(pagination.limit)
    .offset(pagination.offset)

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(videos)
    .where(eq(videos.authorUserId, userId))

  const total = Number(totalResult[0]?.count || 0)

  const user = await db.select().from(users).where(eq(users.uid, userId)).limit(1)

  const formattedVideos = videoList.map((v) => formatVideo(v, user[0]))

  return {
    total,
    pageNo: pagination.pageNo,
    list: formattedVideos
  }
}
