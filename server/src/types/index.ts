/**
 * 类型定义
 */

import type { Request, Response, NextFunction } from 'express'

/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
  success: boolean
}

/**
 * 分页请求参数
 */
export interface PageParams {
  pageNo?: number
  pageSize?: number
  start?: number
}

/**
 * 分页响应数据
 */
export interface PageData<T> {
  total: number
  pageNo?: number
  pageSize?: number
  list: T[]
}

/**
 * 视频列表响应
 */
export interface VideoListResponse {
  total: number
  list: VideoItem[]
}

/**
 * 视频项（前端展示格式）
 */
export interface VideoItem {
  aweme_id: string
  desc: string
  create_time: number
  author_user_id: string
  author?: AuthorInfo
  video: {
    play_addr: {
      uri: string
      url_list: string[]
      width: number
      height: number
    }
    cover: {
      uri: string
      url_list: string[]
      width: number
      height: number
    }
    duration: number
    width: number
    height: number
    ratio: string
    horizontal_type: number
  }
  music: MusicInfo
  statistics: {
    admire_count: number
    comment_count: number
    digg_count: number
    collect_count: number
    play_count: number
    share_count: number
  }
  status: {
    is_delete: boolean
    allow_share: boolean
    is_prohibited: boolean
    private_status: number
  }
  share_url: string
  type?: string
}

/**
 * 作者信息
 */
export interface AuthorInfo {
  uid: string
  nickname: string
  avatar?: string
  avatar_168x168?: { url_list: string[] }
  avatar_300x300?: { url_list: string[] }
  signature?: string
  follower_count?: number
  cover_url?: { url_list: string[] }[]
  white_cover_url?: { url_list: string[] }[]
}

/**
 * 音乐信息
 */
export interface MusicInfo {
  id: string | number
  title: string
  author: string
  cover_medium?: { url_list: string[] }
  cover_thumb?: { url_list: string[] }
  play_url?: { url_list: string[] }
  duration: number
  owner_id?: string
  owner_nickname?: string
}

/**
 * 评论项
 */
export interface CommentItem {
  comment_id: string
  create_time: number
  ip_location: string
  aweme_id: string
  content: string
  is_author_digged: boolean
  is_folded: boolean
  is_hot: boolean
  user_buried: boolean
  user_digged: number
  digg_count: string
  user_id: string
  sec_uid: string
  short_user_id: string
  user_unique_id: string
  user_signature: string
  nickname: string
  avatar: string
  sub_comment_count: string
}

/**
 * 帖子项
 */
export interface PostItem {
  id: string
  model_type: string
  note_card: {
    type: string
    display_title: string
    user: {
      avatar: string
      user_id: string
      nickname: string
    }
    interact_info: {
      liked: boolean
      liked_count: string
    }
    cover: { url_default: string }
    image_list: { info_list: { url: string }[] }[]
  }
}

/**
 * 商品项
 */
export interface GoodItem {
  id?: number
  name: string
  cover: string
  imgs: string[]
  price: number
  real_price: number
  isLowPrice: boolean
  discount: string
  sold: number
}

/**
 * 用户收藏响应
 */
export interface UserCollectResponse {
  video: {
    total: number
    list: VideoItem[]
  }
  music: {
    total: number
    list: MusicItem[]
  }
}

/**
 * 音乐项
 */
export interface MusicItem {
  id: string
  name: string
  mp3: string
  cover: string
  author: string
  duration: number
  use_count: number
  is_collect: boolean
  is_play: boolean
}

/**
 * Express 扩展
 */
export interface AuthRequest extends Request {
  userId?: string
}

/**
 * 路由处理器类型
 */
export type RouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void
