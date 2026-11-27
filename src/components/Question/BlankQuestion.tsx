import { Input } from 'antd'
import type { BlankQuestionData } from '@/types/question'
import QuestionShell from './QuestionShell'

interface BlankQuestionProps {
  question: BlankQuestionData
  index?: number
  showAnswer?: boolean
  /** 作答值，按空顺序 */
  value?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
}

/**
 * 填空题：作答模式下逐空输入，开启 showAnswer 时按空展示答案
 */
export default function BlankQuestion({
  question,
  index,
  showAnswer,
  value,
  onChange,
  disabled,
}: BlankQuestionProps) {
  const { stem, score, analysis } = question
  const answer = question.answer ?? []
  const blankCount = question.blankCount ?? (answer.length || 1)
  const values = Array.isArray(value) ? value : []
  const editable = Boolean(onChange) && !disabled

  const updateBlank = (blankIndex: number, text: string) => {
    if (!onChange) {
      return
    }
    const next = Array.from({ length: blankCount }, (_, i) =>
      i === blankIndex ? text : (values[i] ?? ''),
    )
    onChange(next)
  }

  return (
    <QuestionShell
      index={index}
      stem={stem}
      score={score}
      analysis={analysis}
      showAnswer={showAnswer}
      userAnswer={
        showAnswer
          ? values
              .slice(0, blankCount)
              .map((item, itemIndex) => `第 ${itemIndex + 1} 空：${item || '未作答'}`)
              .join('；')
          : undefined
      }
      isCorrect={question.isCorrect}
      earnedScore={question.earnedScore}
    >
      <div className="question__meta">共 {blankCount} 空</div>
      {editable && (
        <div className="question-blanks">
          {Array.from({ length: blankCount }, (_, blankIndex) => (
            <Input
              key={blankIndex}
              className="question-blanks__input"
              value={values[blankIndex] ?? ''}
              placeholder={`第 ${blankIndex + 1} 空`}
              onChange={(event) => updateBlank(blankIndex, event.target.value)}
            />
          ))}
        </div>
      )}
      {showAnswer && answer.length > 0 && (
        <div className="question-answer">
          {answer.map((item, itemIndex) => (
            <div key={itemIndex}>
              第 {itemIndex + 1} 空：{item}
            </div>
          ))}
        </div>
      )}
    </QuestionShell>
  )
}
