export type QuestionType = 'choice' | 'blank' | 'judge' | 'short_answer' | 'comprehensive'

export type ChoiceMode = 'single' | 'multiple'

export interface QuestionOption {
  key: string
  content: string
}

interface QuestionBase {
  type: QuestionType
  paperQuestionId?: number
  questionId?: number
  stem: string
  score?: number
  analysis?: string
  subject?: string
  /** 用户作答，进行中/已完成详情均会返回 */
  userAnswer?: unknown
  /** 0-错误 | 1-正确 | 2-待批改，仅已完成详情返回 */
  isCorrect?: number
  /** 本题得分，仅已完成详情返回 */
  earnedScore?: number
}

export interface ChoiceQuestionData extends QuestionBase {
  type: 'choice'
  choiceMode?: ChoiceMode
  options: QuestionOption[]
  /** 正确答案，仅已完成详情返回 */
  answer?: string[]
}

export interface BlankQuestionData extends QuestionBase {
  type: 'blank'
  blankCount?: number
  /** 正确答案，仅已完成详情返回 */
  answer?: string[]
}

export interface JudgeQuestionData extends QuestionBase {
  type: 'judge'
  /** 正确答案，仅已完成详情返回 */
  answer?: boolean
}

export interface ShortAnswerQuestionData extends QuestionBase {
  type: 'short_answer'
  /** 参考答案，仅已完成详情返回 */
  referenceAnswer?: string
  scoringPoints?: string[]
}

export interface ComprehensiveSubQuestion {
  stem: string
  answer?: string
  score?: number
}

export interface ComprehensiveQuestionData extends QuestionBase {
  type: 'comprehensive'
  material?: string
  subQuestions: ComprehensiveSubQuestion[]
  referenceAnswer?: string
}

export type QuestionData =
  | ChoiceQuestionData
  | BlankQuestionData
  | JudgeQuestionData
  | ShortAnswerQuestionData
  | ComprehensiveQuestionData
