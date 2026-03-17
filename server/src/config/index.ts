/**
 * 应用配置模块
 * 支持从环境变量和配置文件加载配置
 */

import { z } from 'zod'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { parse as parseYaml } from 'yaml'

// 配置 Schema 定义
const configSchema = z.object({
  // 应用配置
  app: z.object({
    mode: z.enum(['web', 'electron']).default('web'),
    port: z.number().default(3001),
    host: z.string().default('localhost')
  }),

  // 数据库配置
  database: z.object({
    type: z.literal('sqlite').default('sqlite'),
    path: z.string().default('data/douyin.db')
  }),

  // Mock 配置
  mock: z.object({
    enabled: z.boolean().default(true),
    mockPaths: z.array(z.string()).default([])
  }),

  // 资源配置
  resource: z.object({
    mode: z.enum(['local', 'remote', 'hybrid']).default('hybrid'),
    baseUrl: z.string().default(''),
    localPath: z.string().default('./public/data'),
    remoteUrl: z.string().default('https://dy.ttentau.top')
  }),

  // 日志配置
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    file: z.string().optional()
  })
})

export type AppConfig = z.infer<typeof configSchema>

// 默认配置
const defaultConfig: AppConfig = {
  app: {
    mode: 'web',
    port: 3001,
    host: 'localhost'
  },
  database: {
    type: 'sqlite',
    path: 'data/douyin.db'
  },
  mock: {
    enabled: true,
    mockPaths: []
  },
  resource: {
    mode: 'hybrid',
    baseUrl: '',
    localPath: './public/data',
    remoteUrl: 'https://dy.ttentau.top'
  },
  logging: {
    level: 'info'
  }
}

/**
 * 加载 YAML 配置文件
 */
function loadYamlConfig(filename: string): Partial<AppConfig> | null {
  const configPath = join(process.cwd(), 'config', filename)
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, 'utf-8')
      return parseYaml(content)
    } catch (error) {
      console.warn(`[配置] 加载配置文件失败: ${configPath}`, error)
    }
  }
  return null
}

/**
 * 从环境变量读取配置
 */
function loadEnvConfig(): Partial<AppConfig> {
  const envConfig: Partial<AppConfig> = {}

  // 应用配置
  if (process.env.APP_MODE) {
    envConfig.app = { ...envConfig.app, mode: process.env.APP_MODE as 'web' | 'electron' }
  }
  if (process.env.APP_PORT) {
    envConfig.app = { ...envConfig.app, port: parseInt(process.env.APP_PORT, 10) }
  }
  if (process.env.APP_HOST) {
    envConfig.app = { ...envConfig.app, host: process.env.APP_HOST }
  }

  // 数据库配置
  if (process.env.DB_PATH) {
    envConfig.database = { type: 'sqlite', path: process.env.DB_PATH }
  }

  // Mock 配置
  if (process.env.MOCK_ENABLED !== undefined) {
    envConfig.mock = { enabled: process.env.MOCK_ENABLED === 'true', mockPaths: [] }
  }

  // 资源配置
  if (process.env.RESOURCE_MODE) {
    envConfig.resource = {
      ...envConfig.resource,
      mode: process.env.RESOURCE_MODE as 'local' | 'remote' | 'hybrid'
    }
  }
  if (process.env.RESOURCE_BASE_URL) {
    envConfig.resource = { ...envConfig.resource, baseUrl: process.env.RESOURCE_BASE_URL }
  }
  if (process.env.RESOURCE_LOCAL_PATH) {
    envConfig.resource = { ...envConfig.resource, localPath: process.env.RESOURCE_LOCAL_PATH }
  }
  if (process.env.RESOURCE_REMOTE_URL) {
    envConfig.resource = { ...envConfig.resource, remoteUrl: process.env.RESOURCE_REMOTE_URL }
  }

  return envConfig
}

/**
 * 深度合并配置对象
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target }
  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null
      ) {
        result[key] = deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        ) as T[Extract<keyof T, string>]
      } else {
        result[key] = source[key] as T[Extract<keyof T, string>]
      }
    }
  }
  return result
}

/**
 * 加载并合并所有配置源
 */
function loadConfig(): AppConfig {
  let config = { ...defaultConfig }

  // 1. 加载默认配置文件
  const defaultYaml = loadYamlConfig('default.yaml')
  if (defaultYaml) {
    config = deepMerge(config, defaultYaml)
  }

  // 2. 根据环境加载环境配置
  const env = process.env.NODE_ENV || 'development'
  const envYaml = loadYamlConfig(`${env}.yaml`)
  if (envYaml) {
    config = deepMerge(config, envYaml)
  }

  // 3. 环境变量覆盖
  const envConfig = loadEnvConfig()
  if (Object.keys(envConfig).length > 0) {
    config = deepMerge(config, envConfig)
  }

  // 4. 验证配置
  const result = configSchema.safeParse(config)
  if (!result.success) {
    console.error('[配置] 配置验证失败:', result.error.errors)
    throw new Error('配置验证失败')
  }

  return result.data
}

// 导出配置实例
export const config = loadConfig()

console.log('[配置] 加载完成:', {
  app: config.app,
  database: config.database,
  mock: config.mock,
  resource: config.resource
})
