import type { JudgeQuestionData } from '@/types/question'
import QuestionShell from './QuestionShell'

interface JudgeQuestionProps {
  question: JudgeQuestionData
  index?: number
  showAnswer?: boolean
  /** 作答值 */
  value?: boolean
  onChange?: (value: boolean) => void
  disabled?: boolean
}

const JUDGE_CHOICES = [
  { value: true, label: '正确' },
  { value: false, label: '错误' },
]

/**
 * 判断题：作答模式下可点选，开启 showAnswer 时高亮正确答案
 */
export default function JudgeQuestion({
  question,
  index,
  showAnswer,
  value,
  onChange,
  disabled,
}: JudgeQuestionProps) {
  const { stem, score, analysis, answer } = question
  const interactive = Boolean(onChange) && !disabled

  return (
    <QuestionShell
      index={index}
      stem={stem}
      score={score}
      analysis={analysis}
      showAnswer={showAnswer}
      userAnswer={showAnswer ? (typeof value === 'boolean' ? (value ? '正确' : '错误') : undefined) : undefined}
      isCorrect={question.isCorrect}
      earnedScore={question.earnedScore}
    >
      <div className="question-judge">
        {JUDGE_CHOICES.map((choice) => {
          const isCorrect = Boolean(showAnswer) && answer === choice.value
          const isSelected = value === choice.value
          const isWrong = Boolean(showAnswer) && isSelected && answer !== choice.value
          const className = [
            'question-judge__item',
            isCorrect ? 'question-judge__item--correct' : '',
            isWrong ? 'question-judge__item--wrong' : '',
            isSelected ? 'question-judge__item--selected' : '',
            interactive ? 'question-judge__item--clickable' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button
              key={choice.label}
              type="button"
              className={className}
              disabled={!interactive}
              onClick={() => onChange?.(choice.value)}
            >
              {choice.value ? '√' : '×'} {choice.label}
            </button>
          )
        })}
      </div>
      {showAnswer && answer != null && (
        <div className="question-answer">答案：{answer ? '正确' : '错误'}</div>
      )}
    </QuestionShell>
  )
}
