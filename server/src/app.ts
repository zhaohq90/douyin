import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config/index.js'
import { initDatabase, closeDatabase } from './database/index.js'
import videoRoutes from './routes/video.js'
import userRoutes from './routes/user.js'
import commentRoutes from './routes/comment.js'
import postRoutes from './routes/post.js'
import shopRoutes from './routes/shop.js'
import musicRoutes from './routes/music.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (config.logging.level === 'debug') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/video', videoRoutes)
app.use('/api/user', userRoutes)
app.use('/api/comment', commentRoutes)
app.use('/api/post', postRoutes)
app.use('/api/shop', shopRoutes)
app.use('/api/music', musicRoutes)

app.use((_req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在', data: null, success: false })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[错误]', err.message)
  res.status(500).json({ code: 500, msg: '服务器内部错误', data: null, success: false })
})

export function startServer() {
  initDatabase()

  const server = app.listen(config.app.port, config.app.host, () => {
    console.log(`[服务] 启动成功: http://${config.app.host}:${config.app.port}`)
    console.log(`[配置] Mock 模式: ${config.mock.enabled ? '开启' : '关闭'}`)
    console.log(`[配置] 资源模式: ${config.resource.mode}`)
  })

  const gracefulShutdown = () => {
    console.log('\n[服务] 正在关闭...')
    server.close(() => {
      closeDatabase()
      console.log('[服务] 已关闭')
      process.exit(0)
    })
  }

  process.on('SIGTERM', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)

  return server
}

export default app
