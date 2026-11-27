import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  App as AntdApp,
  Button,
  Card,
  Popconfirm,
  Progress,
  Result,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchPractice, saveAnswers, submitExam } from '@/api/paper'
import QuestionRenderer from '@/components/Question'
import type { AnswerSaveItem, ExamDetail, ExamQuestion } from '@/types/paper'
import './index.scss'

/** 判断单题是否已作答 */
function isAnswered(question: ExamQuestion, value: unknown) {
  if (value == null) {
    return false
  }
  switch (question.type) {
    case 'judge':
      return typeof value === 'boolean'
    case 'short_answer':
      return typeof value === 'string' && value.trim() !== ''
    case 'choice':
      return Array.isArray(value) && value.length > 0
    case 'blank':
    case 'comprehensive':
      return Array.isArray(value) && value.some((item) => typeof item === 'string' && item.trim() !== '')
    default:
      return false
  }
}

export default function PaperDetailPage() {
  const { paperId } = useParams()
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const [detail, setDetail] = useState<ExamDetail | null>(null)
  const [answers, setAnswers] = useState<Record<number, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)
  const latestAnswersRef = useRef<Record<number, unknown>>({})

  useEffect(() => {
    if (!paperId) {
      return undefined
    }
    let alive = true
    fetchPractice(Number(paperId))
      .then((data) => {
        if (!alive) {
          return
        }
        if (data.status === 'submitted') {
          navigate(`/papers/${paperId}/result`, { replace: true })
          return
        }
        const initial: Record<number, unknown> = {}
        data.parts.forEach((part) =>
          part.questions.forEach((question) => {
            if (question.userAnswer !== undefined && question.userAnswer !== null) {
              initial[question.paperQuestionId] = question.userAnswer
            }
          }),
        )
        latestAnswersRef.current = initial
        setDetail(data)
        setAnswers(initial)
      })
      .catch((error: Error) => message.error(error.message))
      .finally(() => {
        if (alive) {
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [paperId, navigate, message])

  useEffect(
    () => () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    },
    [],
  )

  const persist = useCallback(
    async (snapshot: Record<number, unknown>): Promise<boolean> => {
      if (!detail) {
        return false
      }
      const items: AnswerSaveItem[] = Object.entries(snapshot).map(([key, userAnswer]) => ({
        paperQuestionId: Number(key),
        userAnswer,
      }))
      if (items.length === 0) {
        return true
      }
      setSaving(true)
      try {
        await saveAnswers(detail.examRecordId, items)
        return true
      } catch (error) {
        message.error((error as Error).message)
        return false
      } finally {
        setSaving(false)
      }
    },
    [detail, message],
  )

  const scheduleSave = (snapshot: Record<number, unknown>) => {
    latestAnswersRef.current = snapshot
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined
      void persist(latestAnswersRef.current)
    }, 800)
  }

  const handleChange = (paperQuestionId: number, value: unknown) => {
    const next = { ...answers, [paperQuestionId]: value }
    setAnswers(next)
    scheduleSave(next)
  }

  const handleSubmit = async () => {
    if (!detail) {
      return
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
    setSubmitting(true)
    try {
      const saved = await persist(latestAnswersRef.current)
      if (!saved) {
        return
      }
      await submitExam(detail.examRecordId)
      message.success('交卷成功')
      navigate(`/papers/${detail.paperId}/result`, { replace: true })
    } catch (error) {
      message.error((error as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const allQuestions = useMemo(
    () => detail?.parts.flatMap((part) => part.questions) ?? [],
    [detail],
  )
  const answeredCount = useMemo(
    () => allQuestions.filter((question) => isAnswered(question, answers[question.paperQuestionId])).length,
    [allQuestions, answers],
  )
  const questionNumberMap = useMemo(() => {
    const map = new Map<number, number>()
    let index = 0
    detail?.parts.forEach((part) =>
      part.questions.forEach((question) => {
        index += 1
        map.set(question.paperQuestionId, index)
      }),
    )
    return map
  }, [detail])

  if (loading) {
    return (
      <div className="paper-detail-page paper-detail-page--loading">
        <Spin size="large" tip="正在加载试卷..." />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="paper-detail-page paper-detail-page--loading">
        <Result
          status="warning"
          title="试卷加载失败"
          extra={
            <Button type="primary" onClick={() => navigate('/papers')}>
              返回试卷列表
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="paper-detail-page">
      <div className="paper-detail-page__inner">
        <div className="paper-detail-page__header">
          <Space size={12}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/papers')}>
              返回
            </Button>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {detail.title}
              </Typography.Title>
              <Space size={8} className="paper-detail-page__meta">
                {detail.subject && <Tag color="blue">{detail.subject}</Tag>}
                <span>共 {allQuestions.length} 题</span>
                <span>总分 {detail.totalScore} 分</span>
              </Space>
            </div>
          </Space>
          <div className="paper-detail-page__progress">
            <Progress
              type="circle"
              size={64}
              percent={
                allQuestions.length === 0
                  ? 0
                  : Math.round((answeredCount / allQuestions.length) * 100)
              }
            />
            <span>
              已答 {answeredCount} / {allQuestions.length}
            </span>
          </div>
        </div>

        {detail.parts.map((part) => (
          <Card
            key={part.paperPartId}
            variant="borderless"
            className="paper-detail-page__part"
            title={part.title}
            extra={part.instruction}
          >
            {part.questions.map((question) => (
              <QuestionRenderer
                key={question.paperQuestionId}
                question={question}
                index={questionNumberMap.get(question.paperQuestionId)}
                value={answers[question.paperQuestionId]}
                onChange={(value) => handleChange(question.paperQuestionId, value)}
              />
            ))}
          </Card>
        ))}

        <div className="paper-detail-page__footer">
          <span className="paper-detail-page__saving">{saving ? '正在保存作答...' : '作答会自动保存'}</span>
          <Popconfirm
            title="确定提交试卷吗？"
            description="提交后客观题自动判分，错题进入错题库；如需修改可再退回进行中。"
            okText="交卷"
            cancelText="再检查一下"
            onConfirm={() => void handleSubmit()}
          >
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={submitting}
            >
              交卷
            </Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  )
}
