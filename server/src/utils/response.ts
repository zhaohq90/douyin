/**
 * 响应工具函数
 */

import type { Response } from 'express'
import type { ApiResponse } from '../types/index.js'

export function success<T>(res: Response, data: T, msg = ''): void {
  const response: ApiResponse<T> = {
    code: 200,
    msg,
    data,
    success: true
  }
  res.json(response)
}

export function error(res: Response, code: number, msg: string): void {
  const response: ApiResponse = {
    code,
    msg,
    data: null as unknown,
    success: false
  }
  res.status(code >= 500 ? 500 : code).json(response)
}

export function pageSuccess<T>(
  res: Response,
  list: T[],
  total: number,
  pageNo?: number,
  pageSize?: number
): void {
  success(res, {
    total,
    pageNo,
    pageSize,
    list
  })
}
