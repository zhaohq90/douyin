/**
 * 分页工具
 */

import type { PageParams } from '../types/index.js'

export interface PaginationResult {
  offset: number
  limit: number
  pageNo: number
  pageSize: number
}

export function getPagination(params: PageParams): PaginationResult {
  const pageNo = params.pageNo ?? 0
  const pageSize = params.pageSize ?? 10

  return {
    offset: pageNo * pageSize,
    limit: pageSize,
    pageNo,
    pageSize
  }
}

export function getStartPagination(start: number, pageSize: number): PaginationResult {
  const safeStart = Math.max(0, start)
  const safePageSize = Math.max(1, pageSize)
  const pageNo = Math.floor(safeStart / safePageSize)

  return {
    offset: safeStart,
    limit: safePageSize,
    pageNo,
    pageSize: safePageSize
  }
}
