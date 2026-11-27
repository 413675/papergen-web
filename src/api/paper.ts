import { request } from './http'
import type {
  AnswerSaveItem,
  ExamDetail,
  PaperListItem,
  PaperReassembleParam,
  PaperReassembleResult,
} from '@/types/paper'

/** 我的试卷列表（含作答状态） */
export function fetchPapers() {
  return request<PaperListItem[]>({ url: '/v1/papers', method: 'GET' })
}

/** 进行中答题详情，不含答案与解析 */
export function fetchPractice(paperId: number) {
  return request<ExamDetail>({ url: `/v1/papers/${paperId}/practice`, method: 'GET' })
}

/** 已完成解析详情，含答案、解析与判分 */
export function fetchPaperResult(paperId: number) {
  return request<ExamDetail>({ url: `/v1/papers/${paperId}/result`, method: 'GET' })
}

/** 保存作答（仅进行中） */
export function saveAnswers(examRecordId: number, answers: AnswerSaveItem[]) {
  return request<void>({
    url: `/v1/exams/${examRecordId}/answers`,
    method: 'PUT',
    data: { answers },
  })
}

/** 交卷 */
export function submitExam(examRecordId: number) {
  return request<void>({ url: `/v1/exams/${examRecordId}/submit`, method: 'POST' })
}

/** 已完成退回进行中 */
export function reopenExam(examRecordId: number) {
  return request<void>({ url: `/v1/exams/${examRecordId}/reopen`, method: 'POST' })
}

/** 删除试卷（同时删除答题记录、错题记录与导入的题目） */
export function deletePaper(paperId: number) {
  return request<void>({ url: `/v1/papers/${paperId}`, method: 'DELETE' })
}

/** 批量删除试卷 */
export function deletePapers(ids: number[]) {
  return request<void>({ url: '/v1/papers/batch', method: 'DELETE', data: { ids } })
}

/** 按科目用错题重组试卷 */
export function reassemblePaper(data: PaperReassembleParam) {
  return request<PaperReassembleResult>({ url: '/v1/papers/reassemble', method: 'POST', data })
}
