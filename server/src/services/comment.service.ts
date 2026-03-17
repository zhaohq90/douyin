import { db, comments } from '../database/index.js'
import { eq, desc } from 'drizzle-orm'
import type { Comment } from '../database/schema.js'
import { getPagination } from '../utils/pagination.js'
import { resolveResource } from '../utils/resource-path.js'

function formatComment(comment: Comment) {
  return {
    comment_id: comment.commentId,
    create_time: comment.createTime || 0,
    ip_location: comment.ipLocation || '',
    aweme_id: comment.awemeId,
    content: comment.content,
    is_author_digged: Boolean(comment.isAuthorDigged),
    is_folded: Boolean(comment.isFolded),
    is_hot: Boolean(comment.isHot),
    user_buried: Boolean(comment.userBuried),
    user_digged: comment.userDigged || 0,
    digg_count: String(comment.diggCount || 0),
    user_id: comment.userId,
    sec_uid: comment.secUid || '',
    short_user_id: '',
    user_unique_id: comment.userUniqueId || '',
    user_signature: comment.userSignature || '',
    nickname: comment.nickname || '',
    avatar: resolveResource(comment.avatar),
    sub_comment_count: String(comment.subCommentCount || 0)
  }
}

export async function getCommentsByVideoId(videoId: string, pageNo: number, pageSize: number) {
  const pagination = getPagination({ pageNo, pageSize })

  const commentList = await db
    .select()
    .from(comments)
    .where(eq(comments.awemeId, videoId))
    .orderBy(desc(comments.diggCount))
    .limit(pagination.limit)
    .offset(pagination.offset)

  const totalResult = await db
    .select({ count: comments.id })
    .from(comments)
    .where(eq(comments.awemeId, videoId))

  return {
    total: commentList.length,
    pageNo: pagination.pageNo,
    list: commentList.map(formatComment)
  }
}

export async function createComment(data: {
  awemeId: string
  userId: string
  content: string
  nickname?: string
  avatar?: string
}) {
  const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  await db.insert(comments).values({
    commentId,
    awemeId: data.awemeId,
    userId: data.userId,
    content: data.content,
    nickname: data.nickname || '匿名用户',
    avatar: data.avatar || '',
    createTime: Math.floor(Date.now() / 1000),
    diggCount: 0,
    subCommentCount: 0,
    isHot: 0,
    isAuthorDigged: 0,
    isFolded: 0,
    userDigged: 0,
    userBuried: 0
  })

  return { commentId }
}
