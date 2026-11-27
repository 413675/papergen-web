import { request } from './http'
import type { PaperImportResult } from '@/types/paper'

/** 上传 paper-import v1 JSON 文件，生成草稿试卷 */
export function importPaper(file: File) {
  const data = new FormData()
  data.append('file', file)
  return request<PaperImportResult>({
    url: '/v1/generation/tasks/import',
    method: 'POST',
    data,
  })
}
