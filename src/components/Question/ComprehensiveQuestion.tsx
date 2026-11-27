import { Input } from 'antd'
import type { ComprehensiveQuestionData } from '@/types/question'
import QuestionShell from './QuestionShell'

interface ComprehensiveQuestionProps {
  question: ComprehensiveQuestionData
  index?: number
  showAnswer?: boolean
  /** 作答值，按小题顺序 */
  value?: string[]
  onChange?: (value: string[]) => void
  disabled?: boolean
}

/**
 * 大题（综合分析题）：材料 + 小题，作答时逐小题输入，开启 showAnswer 时展示答案
 */
export default function ComprehensiveQuestion({
  question,
  index,
  showAnswer,
  value,
  onChange,
  disabled,
}: ComprehensiveQuestionProps) {
  const { stem, score, analysis, material, subQuestions, referenceAnswer } = question
  const values = Array.isArray(value) ? value : []
  const editable = Boolean(onChange) && !disabled

  const updateSub = (subIndex: number, text: string) => {
    if (!onChange) {
      return
    }
    const next = subQuestions.map((_, i) =>
      i === subIndex ? text : (values[i] ?? ''),
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
      isCorrect={question.isCorrect}
      earnedScore={question.earnedScore}
    >
      {material && <div className="question-material">{material}</div>}
      <div className="question-sub">
        {subQuestions.map((sub, subIndex) => {
          const userAnswer = values[subIndex]
          return (
            <div key={subIndex} className="question-sub__item">
              <div className="question-sub__head">
                <span className="question-sub__stem">{sub.stem}</span>
                {sub.score != null && (
                  <span className="question-sub__score">（{sub.score} 分）</span>
                )}
              </div>
              {editable && (
                <Input.TextArea
                  className="question-textarea"
                  value={userAnswer ?? ''}
                  placeholder={`第 ${subIndex + 1} 小题作答`}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  onChange={(event) => updateSub(subIndex, event.target.value)}
                />
              )}
              {showAnswer && sub.answer && (
                <div className="question-sub__answer">答：{sub.answer}</div>
              )}
              {showAnswer && userAnswer != null && (
                <div className="question-sub__user">你的作答：{userAnswer || '未作答'}</div>
              )}
            </div>
          )
        })}
      </div>
      {showAnswer && referenceAnswer && (
        <div className="question-answer">
          <div className="question-answer__title">参考答案</div>
          <div className="question-answer__text">{referenceAnswer}</div>
        </div>
      )}
    </QuestionShell>
  )
}
