import { Router } from 'express'
import { success, error, pageSuccess } from '../utils/response.js'
import * as commentService from '../services/comment.service.js'

const router = Router()

router.get('/video/:videoId', async (req, res, next) => {
  try {
    const pageNo = Number(req.query.pageNo) || 0
    const pageSize = Number(req.query.pageSize) || 20
    const result = await commentService.getCommentsByVideoId(req.params.videoId, pageNo, pageSize)
    pageSuccess(res, result.list, result.total, result.pageNo)
  } catch (err) {
    next(err)
  }
})

router.post('/video/:videoId', async (req, res, next) => {
  try {
    const { content, userId, nickname, avatar } = req.body
    if (!content) {
      error(res, 400, '评论内容不能为空')
      return
    }
    const result = await commentService.createComment({
      awemeId: req.params.videoId,
      userId: userId || 'anonymous',
      content,
      nickname,
      avatar
    })
    success(res, result, '评论成功')
  } catch (err) {
    next(err)
  }
})

export default router
