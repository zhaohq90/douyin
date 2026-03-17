import { db, goods } from '../database/index.js'
import { desc } from 'drizzle-orm'
import type { Good } from '../database/schema.js'
import { getPagination } from '../utils/pagination.js'
import { resolveResource } from '../utils/resource-path.js'

function formatGood(good: Good) {
  let imgs: string[] = []
  try {
    if (good.imgs) {
      imgs = JSON.parse(good.imgs)
    }
  } catch {
    imgs = []
  }

  return {
    id: good.id,
    name: good.name,
    cover: resolveResource(good.cover),
    imgs: imgs.map((img) => resolveResource(img)),
    price: good.price || 0,
    real_price: good.realPrice || 0,
    isLowPrice: Boolean(good.isLowPrice),
    discount: good.discount || '',
    sold: good.sold || 0,
    description: good.description || ''
  }
}

export async function getRecommendedGoods(pageNo: number, pageSize: number) {
  const pagination = getPagination({ pageNo, pageSize })

  const goodList = await db
    .select()
    .from(goods)
    .orderBy(desc(goods.sold))
    .limit(pagination.limit)
    .offset(pagination.offset)

  const totalResult = await db.select().from(goods)

  return {
    total: totalResult.length,
    list: goodList.map(formatGood)
  }
}
