import { Router } from 'express'
import { success, pageSuccess } from '../utils/response.js'
import * as postService from '../services/post.service.js'

const router = Router()

router.get('/recommended', async (req, res, next) => {
  try {
    const pageNo = Number(req.query.pageNo) || 0
    const pageSize = Number(req.query.pageSize) || 10
    const result = await postService.getRecommendedPosts(pageNo, pageSize)
    pageSuccess(res, result.list, result.total, result.pageNo)
  } catch (err) {
    next(err)
  }
})

export default router
