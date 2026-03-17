import { Router } from 'express'
import { success, error, pageSuccess } from '../utils/response.js'
import * as userService from '../services/user.service.js'

const router = Router()

router.get('/panel', async (req, res, next) => {
  try {
    const user = await userService.getUserPanel()
    if (!user) {
      error(res, 404, '用户不存在')
      return
    }
    success(res, user)
  } catch (err) {
    next(err)
  }
})

router.get('/friends', async (req, res, next) => {
  try {
    const users = await userService.getFriends()
    success(res, users)
  } catch (err) {
    next(err)
  }
})

router.get('/collect', async (req, res, next) => {
  try {
    const pageNo = Number(req.query.pageNo) || 0
    const pageSize = Number(req.query.pageSize) || 10
    const userId = 'current_user'
    const result = await userService.getUserCollects(userId, pageNo, pageSize)
    success(res, result)
  } catch (err) {
    next(err)
  }
})

router.get('/video_list', async (req, res, next) => {
  try {
    const id = req.query.id as string
    if (!id) {
      error(res, 400, '缺少用户ID')
      return
    }
    const pageNo = Number(req.query.pageNo) || 0
    const pageSize = Number(req.query.pageSize) || 10
    const result = await import('../services/video.service.js').then((m) =>
      m.getVideosByUserId(id, pageNo, pageSize)
    )
    pageSuccess(res, result.list, result.total, result.pageNo)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id)
    if (!user) {
      error(res, 404, '用户不存在')
      return
    }
    success(res, user)
  } catch (err) {
    next(err)
  }
})

export default router
