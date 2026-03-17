/**
 * 资源路径解析器
 * 支持本地路径、远程URL和混合模式
 */

import { config } from '../config/index.js'
import { join } from 'path'

type ResourceMode = 'local' | 'remote' | 'hybrid'

class ResourcePathResolver {
  private mode: ResourceMode
  private localPath: string
  private remoteUrl: string

  constructor() {
    this.mode = config.resource.mode
    this.localPath = config.resource.localPath
    this.remoteUrl = config.resource.remoteUrl
  }

  resolve(path: string | undefined | null): string {
    if (!path) return ''

    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file://')) {
      return path
    }

    switch (this.mode) {
      case 'local':
        return this.resolveLocal(path)
      case 'remote':
        return this.resolveRemote(path)
      case 'hybrid':
        return this.resolveRemote(path)
      default:
        return path
    }
  }

  private resolveLocal(path: string): string {
    return join(this.localPath, path)
  }

  private resolveRemote(path: string): string {
    const baseUrl = this.remoteUrl.replace(/\/$/, '')
    const cleanPath = path.replace(/^\//, '')
    return `${baseUrl}/${cleanPath}`
  }

  resolveBatch(paths: (string | undefined | null)[]): string[] {
    return paths.map((p) => this.resolve(p))
  }

  resolveUrlList(urlList: string[] | undefined): string[] {
    if (!urlList || urlList.length === 0) return []
    return urlList.map((url) => this.resolve(url))
  }

  updateConfig(mode: ResourceMode, localPath?: string, remoteUrl?: string): void {
    this.mode = mode
    if (localPath) this.localPath = localPath
    if (remoteUrl) this.remoteUrl = remoteUrl
  }
}

export const resourcePath = new ResourcePathResolver()

export function resolveResource(path: string | undefined | null): string {
  return resourcePath.resolve(path)
}
