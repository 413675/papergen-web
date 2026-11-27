import type { QuestionData } from '@/types/question'
import BlankQuestion from './BlankQuestion'
import ChoiceQuestion from './ChoiceQuestion'
import ComprehensiveQuestion from './ComprehensiveQuestion'
import JudgeQuestion from './JudgeQuestion'
import ShortAnswerQuestion from './ShortAnswerQuestion'

export { default as BlankQuestion } from './BlankQuestion'
export { default as ChoiceQuestion } from './ChoiceQuestion'
export { default as ComprehensiveQuestion } from './ComprehensiveQuestion'
export { default as JudgeQuestion } from './JudgeQuestion'
export { default as QuestionShell } from './QuestionShell'
export { default as ShortAnswerQuestion } from './ShortAnswerQuestion'

interface QuestionRendererProps {
  question: QuestionData
  index?: number
  showAnswer?: boolean
  /** 作答值，传入 onChange 即进入作答模式 */
  value?: unknown
  onChange?: (value: unknown) => void
  disabled?: boolean
}

/**
 * 按题型分发到对应组件
 */
export default function QuestionRenderer({
  question,
  index,
  showAnswer,
  value,
  onChange,
  disabled,
}: QuestionRendererProps) {
  switch (question.type) {
    case 'choice':
      return (
        <ChoiceQuestion
          question={question}
          index={index}
          showAnswer={showAnswer}
          value={value as string[] | undefined}
          onChange={onChange as ((value: string[]) => void) | undefined}
          disabled={disabled}
        />
      )
    case 'blank':
      return (
        <BlankQuestion
          question={question}
          index={index}
          showAnswer={showAnswer}
          value={value as string[] | undefined}
          onChange={onChange as ((value: string[]) => void) | undefined}
          disabled={disabled}
        />
      )
    case 'judge':
      return (
        <JudgeQuestion
          question={question}
          index={index}
          showAnswer={showAnswer}
          value={value as boolean | undefined}
          onChange={onChange as ((value: boolean) => void) | undefined}
          disabled={disabled}
        />
      )
    case 'short_answer':
      return (
        <ShortAnswerQuestion
          question={question}
          index={index}
          showAnswer={showAnswer}
          value={value as string | undefined}
          onChange={onChange as ((value: string) => void) | undefined}
          disabled={disabled}
        />
      )
    case 'comprehensive':
      return (
        <ComprehensiveQuestion
          question={question}
          index={index}
          showAnswer={showAnswer}
          value={value as string[] | undefined}
          onChange={onChange as ((value: string[]) => void) | undefined}
          disabled={disabled}
        />
      )
    default:
      return null
  }
}
