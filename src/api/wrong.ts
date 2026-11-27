import { request } from './http'
import type { WrongQuestionItem } from '@/types/wrong'

/** 我的错题列表，含答案与解析 */
export function fetchWrongQuestions() {
  return request<WrongQuestionItem[]>({ url: '/v1/wrong-questions', method: 'GET' })
}

/** 删除一条错题记录 */
export function deleteWrongQuestion(wrongQuestionId: number) {
  return request<void>({ url: `/v1/wrong-questions/${wrongQuestionId}`, method: 'DELETE' })
}

/** 批量删除错题记录 */
export function deleteWrongQuestions(ids: number[]) {
  return request<void>({ url: '/v1/wrong-questions/batch', method: 'DELETE', data: { ids } })
}
