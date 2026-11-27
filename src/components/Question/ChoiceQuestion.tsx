import type { ChoiceQuestionData } from '@/types/question'
import QuestionShell from './QuestionShell'

interface ChoiceQuestionProps {
  question: ChoiceQuestionData
  index?: number
  showAnswer?: boolean
  /** 作答值，选项标识数组 */
  value?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
}

/**
 * 选择题：作答模式下可点选，展示模式开启 showAnswer 时高亮正确选项
 */
export default function ChoiceQuestion({
  question,
  index,
  showAnswer,
  value,
  onChange,
  disabled,
}: ChoiceQuestionProps) {
  const { stem, score, analysis, options, answer } = question
  const choiceMode = question.choiceMode ?? 'single'
  const selected = Array.isArray(value) ? value : []
  const answerKeys = answer ?? []
  const interactive = Boolean(onChange) && !disabled

  const toggle = (key: string) => {
    if (!onChange || disabled) {
      return
    }
    if (choiceMode === 'single') {
      onChange(selected.includes(key) ? [] : [key])
      return
    }
    const next = selected.includes(key)
      ? selected.filter((item) => item !== key)
      : [...selected, key].sort()
    onChange(next)
  }

  return (
    <QuestionShell
      index={index}
      stem={stem}
      score={score}
      analysis={analysis}
      showAnswer={showAnswer}
      userAnswer={showAnswer ? selected.join('') : undefined}
      isCorrect={question.isCorrect}
      earnedScore={question.earnedScore}
    >
      <div className="question__meta">{choiceMode === 'multiple' ? '多选题' : '单选题'}</div>
      <ul className="question-options">
        {options.map((option) => {
          const isSelected = selected.includes(option.key)
          const isCorrect = Boolean(showAnswer) && answerKeys.includes(option.key)
          const isWrong = Boolean(showAnswer) && isSelected && !answerKeys.includes(option.key)
          const className = [
            'question-options__item',
            isCorrect ? 'question-options__item--correct' : '',
            isWrong ? 'question-options__item--wrong' : '',
            isSelected ? 'question-options__item--selected' : '',
            interactive ? 'question-options__item--clickable' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <li
              key={option.key}
              className={className}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={() => toggle(option.key)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  toggle(option.key)
                }
              }}
            >
              <span className="question-options__key">{option.key}</span>
              <span className="question-options__content">{option.content}</span>
            </li>
          )
        })}
      </ul>
      {showAnswer && answerKeys.length > 0 && (
        <div className="question-answer">答案：{answerKeys.join('')}</div>
      )}
    </QuestionShell>
  )
}
