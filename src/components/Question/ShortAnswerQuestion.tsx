import { Input } from 'antd'
import type { ShortAnswerQuestionData } from '@/types/question'
import QuestionShell from './QuestionShell'

interface ShortAnswerQuestionProps {
  question: ShortAnswerQuestionData
  index?: number
  showAnswer?: boolean
  /** 作答值 */
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

/**
 * 简答题：作答模式下提供文本输入，开启 showAnswer 时展示参考答案与评分要点
 */
export default function ShortAnswerQuestion({
  question,
  index,
  showAnswer,
  value,
  onChange,
  disabled,
}: ShortAnswerQuestionProps) {
  const { stem, score, analysis, referenceAnswer, scoringPoints } = question
  const editable = Boolean(onChange) && !disabled

  return (
    <QuestionShell
      index={index}
      stem={stem}
      score={score}
      analysis={analysis}
      showAnswer={showAnswer}
      userAnswer={showAnswer && typeof value === 'string' ? value : undefined}
      isCorrect={question.isCorrect}
      earnedScore={question.earnedScore}
    >
      {editable && (
        <Input.TextArea
          className="question-textarea"
          value={value ?? ''}
          placeholder="请输入你的答案"
          autoSize={{ minRows: 3, maxRows: 8 }}
          onChange={(event) => onChange?.(event.target.value)}
        />
      )}
      {showAnswer && referenceAnswer && (
        <div className="question-answer">
          <div className="question-answer__title">参考答案</div>
          <div className="question-answer__text">{referenceAnswer}</div>
        </div>
      )}
      {showAnswer && scoringPoints && scoringPoints.length > 0 && (
        <div className="question-answer">
          <div className="question-answer__title">评分要点</div>
          <ol className="question-points">
            {scoringPoints.map((point, pointIndex) => (
              <li key={pointIndex}>{point}</li>
            ))}
          </ol>
        </div>
      )}
    </QuestionShell>
  )
}
