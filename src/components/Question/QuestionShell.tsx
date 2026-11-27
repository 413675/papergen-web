import type { ReactNode } from 'react'
import { Tag } from 'antd'
import './index.scss'

interface QuestionShellProps {
  /** 题号 */
  index?: number
  stem: string
  score?: number
  analysis?: string
  showAnswer?: boolean
  /** 用户作答文本，仅在已完成详情展示 */
  userAnswer?: string
  /** 0-错误 | 1-正确 | 2-待批改，仅在已完成详情展示 */
  isCorrect?: number
  /** 本题得分，仅在已完成详情展示 */
  earnedScore?: number
  children?: ReactNode
}

const RESULT_TAGS: Record<number, { color: string; text: string }> = {
  0: { color: 'error', text: '回答错误' },
  1: { color: 'success', text: '回答正确' },
  2: { color: 'processing', text: '待批改' },
}

/**
 * 题目公共外壳：题号、题干、分值、作答、判分与答案解析
 */
export default function QuestionShell({
  index,
  stem,
  score,
  analysis,
  showAnswer,
  userAnswer,
  isCorrect,
  earnedScore,
  children,
}: QuestionShellProps) {
  const resultTag = isCorrect != null ? RESULT_TAGS[isCorrect] : undefined

  return (
    <div className="question">
      <div className="question__head">
        {index != null && <span className="question__index">{index}.</span>}
        <div className="question__stem">{stem}</div>
        {score != null && <Tag className="question__score">{score} 分</Tag>}
      </div>
      {children}
      {showAnswer && userAnswer != null && (
        <div className="question-user-answer">
          <span className="question__label">我的作答</span>
          <span className="question-user-answer__text">{userAnswer || '未作答'}</span>
        </div>
      )}
      {showAnswer && analysis && (
        <div className="question__analysis">
          <span className="question__label">解析</span>
          <span>{analysis}</span>
        </div>
      )}
      {showAnswer && resultTag && (
        <div className="question__verdict">
          <Tag color={resultTag.color}>{resultTag.text}</Tag>
          {earnedScore != null && (
            <span className="question__earned">
              得分 {earnedScore} / {score ?? 0}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
