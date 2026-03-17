import { Router } from 'express'
import { success } from '../utils/response.js'
import * as musicService from '../services/music.service.js'

const router = Router()

router.get('/list', async (req, res, next) => {
  try {
    const list = await musicService.getMusicList()
    success(res, list)
  } catch (err) {
    next(err)
  }
})

export default router
