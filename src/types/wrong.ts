import type { QuestionData } from './question'

/** 错题本条目：完整题目 + 错题记录信息 */
export type WrongQuestionItem = QuestionData & {
  wrongQuestionId: number
  questionId: number
  paperId?: number
  paperTitle?: string
  wrongCount: number
  lastWrongTime?: string
  /** 0-未掌握 | 1-已掌握 */
  mastered?: number
  remark?: string
}
