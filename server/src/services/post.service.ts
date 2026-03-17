import { db, posts } from '../database/index.js'
import { desc } from 'drizzle-orm'
import type { Post } from '../database/schema.js'
import { getPagination } from '../utils/pagination.js'
import { resolveResource } from '../utils/resource-path.js'

function formatPost(post: Post) {
  let imageList: { info_list: { url: string }[] }[] = []
  try {
    if (post.imageList) {
      const parsed = JSON.parse(post.imageList)
      imageList = parsed.map((url: string) => ({
        info_list: [{ url: resolveResource(url) }]
      }))
    }
  } catch {
    // ignore
  }

  return {
    id: post.postId || String(post.id),
    model_type: post.modelType || 'note',
    note_card: {
      type: post.type || 'normal',
      display_title: post.displayTitle || post.title || '',
      user: {
        avatar: resolveResource(post.avatar),
        user_id: post.userId || '',
        nickname: post.nickname || ''
      },
      interact_info: {
        liked: Boolean(post.liked),
        liked_count: String(post.likedCount || 0)
      },
      cover: { url_default: resolveResource(post.coverUrl) },
      image_list: imageList
    }
  }
}

export async function getRecommendedPosts(pageNo: number, pageSize: number) {
  const pagination = getPagination({ pageNo, pageSize })

  const postList = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(pagination.limit)
    .offset(pagination.offset)

  const totalResult = await db.select().from(posts)

  return {
    total: totalResult.length,
    pageNo: pagination.pageNo,
    list: postList.map(formatPost)
  }
}
