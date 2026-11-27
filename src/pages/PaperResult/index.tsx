import { useEffect, useMemo, useState } from 'react'
import {
  App as AntdApp,
  Button,
  Card,
  Popconfirm,
  Result,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import { ArrowLeftOutlined, RedoOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchPaperResult, reopenExam } from '@/api/paper'
import QuestionRenderer from '@/components/Question'
import type { ExamDetail } from '@/types/paper'
import './index.scss'

export default function PaperResultPage() {
  const { paperId } = useParams()
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const [detail, setDetail] = useState<ExamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [reopening, setReopening] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!paperId) {
      return undefined
    }
    let alive = true
    fetchPaperResult(Number(paperId))
      .then((data) => {
        if (alive) {
          setDetail(data)
        }
      })
      .catch((error: Error) => {
        if (alive) {
          setLoadError(error.message)
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [paperId])

  const allQuestions = useMemo(
    () => detail?.parts.flatMap((part) => part.questions) ?? [],
    [detail],
  )
  const stats = useMemo(() => {
    let correct = 0
    let wrong = 0
    let pending = 0
    allQuestions.forEach((question) => {
      if (question.isCorrect === 1) {
        correct += 1
      } else if (question.isCorrect === 0) {
        wrong += 1
      } else if (question.isCorrect === 2) {
        pending += 1
      }
    })
    return { correct, wrong, pending }
  }, [allQuestions])

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

  const handleReopen = async () => {
    if (!detail) {
      return
    }
    setReopening(true)
    try {
      await reopenExam(detail.examRecordId)
      message.success('已退回进行中，可以继续作答')
      navigate(`/papers/${detail.paperId}`, { replace: true })
    } catch (error) {
      message.error((error as Error).message)
    } finally {
      setReopening(false)
    }
  }

  if (loading) {
    return (
      <div className="paper-result-page paper-result-page--loading">
        <Spin size="large" tip="正在加载解析..." />
      </div>
    )
  }

  if (loadError || !detail) {
    return (
      <div className="paper-result-page paper-result-page--loading">
        <Result
          status="warning"
          title="暂无解析"
          subTitle={loadError || '试卷尚未提交'}
          extra={[
            <Button
              type="primary"
              key="practice"
              onClick={() => navigate(`/papers/${paperId}`, { replace: true })}
            >
              继续答题
            </Button>,
            <Button key="list" onClick={() => navigate('/papers')}>
              返回试卷列表
            </Button>,
          ]}
        />
      </div>
    )
  }

  return (
    <div className="paper-result-page">
      <div className="paper-result-page__inner">
        <div className="paper-result-page__header">
          <Space size={12}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/papers')}>
              返回
            </Button>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {detail.title}
              </Typography.Title>
              <Space size={8} className="paper-result-page__meta">
                {detail.subject && <Tag color="blue">{detail.subject}</Tag>}
                <span>交卷时间：{detail.submittedAt ?? '-'}</span>
              </Space>
            </div>
          </Space>
          <Popconfirm
            title="退回到进行中？"
            description="将保留你的作答，但会清除本次判分结果，可再次交卷。"
            okText="退回"
            cancelText="取消"
            onConfirm={() => void handleReopen()}
          >
            <Button icon={<RedoOutlined />} loading={reopening}>
              退回进行中
            </Button>
          </Popconfirm>
        </div>

        <Card variant="borderless" className="paper-result-page__summary">
          <Statistic
            title="本次得分"
            value={detail.score}
            suffix={`/ ${detail.totalScore}`}
            valueStyle={{ color: '#4f46e5' }}
          />
          <div className="paper-result-page__stats">
            <Tag color="success">正确 {stats.correct}</Tag>
            <Tag color="error">错误 {stats.wrong}</Tag>
            <Tag color="processing">待批改 {stats.pending}</Tag>
          </div>
          <Typography.Text type="secondary" className="paper-result-page__tip">
            客观题已自动判分，答错的题目已加入错题库；简答题与大题需人工批改。
          </Typography.Text>
        </Card>

        {detail.parts.map((part) => (
          <Card
            key={part.paperPartId}
            variant="borderless"
            className="paper-result-page__part"
            title={part.title}
            extra={part.instruction}
          >
            {part.questions.map((question) => (
              <QuestionRenderer
                key={question.paperQuestionId}
                question={question}
                index={questionNumberMap.get(question.paperQuestionId)}
                showAnswer
                disabled
                value={question.userAnswer}
              />
            ))}
          </Card>
        ))}
      </div>
    </div>
  )
}
