import { Router } from 'express'
import { success, error, pageSuccess } from '../utils/response.js'
import * as videoService from '../services/video.service.js'

const router = Router()

router.get('/recommended', async (req, res, next) => {
  try {
    const start = Number(req.query.start) || 0
    const pageSize = Number(req.query.pageSize) || 10
    const result = await videoService.getRecommendedVideos(start, pageSize)
    success(res, result)
  } catch (err) {
    next(err)
  }
})

router.get('/long/recommended', async (req, res, next) => {
  try {
    const pageNo = Number(req.query.pageNo) || 0
    const pageSize = Number(req.query.pageSize) || 10
    const result = await videoService.getVideosByPage(pageNo, pageSize)
    pageSuccess(res, result.list, result.total, result.pageNo)
  } catch (err) {
    next(err)
  }
})

router.get('/private', async (req, res, next) => {
  try {
    const pageNo = Number(req.query.pageNo) || 0
    const pageSize = Number(req.query.pageSize) || 10
    const result = await videoService.getPrivateVideos(pageNo, pageSize)
    pageSuccess(res, result.list, result.total, result.pageNo)
  } catch (err) {
    next(err)
  }
})

router.get('/like', async (req, res, next) => {
  try {
    const pageNo = Number(req.query.pageNo) || 0
    const pageSize = Number(req.query.pageSize) || 10
    const result = await videoService.getLikeVideos(pageNo, pageSize)
    pageSuccess(res, result.list, result.total, result.pageNo)
  } catch (err) {
    next(err)
  }
})

router.get('/my', async (req, res, next) => {
  try {
    const pageNo = Number(req.query.pageNo) || 0
    const pageSize = Number(req.query.pageSize) || 10
    const result = await videoService.getMyVideos(pageNo, pageSize)
    pageSuccess(res, result.list, result.total, result.pageNo)
  } catch (err) {
    next(err)
  }
})

router.get('/history', async (req, res, next) => {
  try {
    const pageNo = Number(req.query.pageNo) || 0
    const pageSize = Number(req.query.pageSize) || 10
    const result = await videoService.getHistoryVideos(pageNo, pageSize)
    pageSuccess(res, result.list, result.total, result.pageNo)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const video = await videoService.getVideoById(req.params.id)
    if (!video) {
      error(res, 404, '视频不存在')
      return
    }
    success(res, video)
  } catch (err) {
    next(err)
  }
})

export default router
