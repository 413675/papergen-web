import type { QuestionData } from './question'

export interface PaperImportResult {
  taskId: number
  paperId: number
  title: string
  subject?: string
  questionCount: number
  totalScore: number
}

/** 错题重组试卷参数 */
export interface PaperReassembleParam {
  subject: string
  title?: string
  questionCount?: number
  durationMinutes?: number
}

/** 错题重组试卷结果 */
export interface PaperReassembleResult {
  paperId: number
  title: string
  subject: string
  questionCount: number
  totalScore: number
}

/** 当前用户视角的作答状态 */
export type PaperUserStatus = 'not_started' | 'doing' | 'submitted'

export interface PaperListItem {
  paperId: number
  title: string
  subject?: string
  description?: string
  questionCount: number
  totalScore: number
  status: PaperUserStatus
  examRecordId?: number
  score?: number
  startedAt?: string
  submittedAt?: string
  updateTime?: string
}

/** 答题详情中的题目，比展示组件多了试卷题目与判分字段 */
export type ExamQuestion = QuestionData & {
  paperQuestionId: number
  questionId: number
  userAnswer?: unknown
  isCorrect?: number
  earnedScore?: number
}

export interface ExamPart {
  paperPartId: number
  title: string
  instruction?: string
  questions: ExamQuestion[]
}

export interface ExamDetail {
  examRecordId: number
  paperId: number
  title: string
  description?: string
  subject?: string
  status: 'doing' | 'submitted'
  totalScore: number
  score: number
  startedAt?: string
  submittedAt?: string
  parts: ExamPart[]
}

export interface AnswerSaveItem {
  paperQuestionId: number
  userAnswer: unknown
}
