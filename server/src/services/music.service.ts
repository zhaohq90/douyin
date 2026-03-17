import { db, music } from '../database/index.js'
import { desc } from 'drizzle-orm'
import type { Music } from '../database/schema.js'
import { resolveResource } from '../utils/resource-path.js'

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

export async function getMusicList() {
  const musicList = await db.select().from(music).orderBy(desc(music.userCount)).limit(100)

  return musicList.map(formatMusicItem)
}
