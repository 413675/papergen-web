import { useEffect, useMemo, useState } from 'react'
import {
  App as AntdApp,
  Button,
  Card,
  Checkbox,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd'
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  ReloadOutlined,
  UpOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { reassemblePaper } from '@/api/paper'
import { deleteWrongQuestion, deleteWrongQuestions, fetchWrongQuestions } from '@/api/wrong'
import QuestionRenderer from '@/components/Question'
import type { PaperReassembleParam } from '@/types/paper'
import type { WrongQuestionItem } from '@/types/wrong'
import './index.scss'

const TYPE_LABELS: Record<string, string> = {
  choice: '选择题',
  blank: '填空题',
  judge: '判断题',
  short_answer: '简答题',
  comprehensive: '综合题',
}

const TYPE_COLORS: Record<string, string> = {
  choice: 'blue',
  blank: 'cyan',
  judge: 'purple',
  short_answer: 'orange',
  comprehensive: 'geekblue',
}

export default function WrongQuestionsPage() {
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const [items, setItems] = useState<WrongQuestionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [reassembleOpen, setReassembleOpen] = useState(false)
  const [reassembling, setReassembling] = useState(false)
  const [form] = Form.useForm<PaperReassembleParam>()
  const [subjectFilter, setSubjectFilter] = useState<string>()
  const [paperFilter, setPaperFilter] = useState<number>()

  // 按科目聚合，重组试卷只允许使用同一科目
  const subjectOptions = useMemo(() => {
    const counter = new Map<string, number>()
    items.forEach((item) => {
      const subject = item.subject?.trim()
      if (subject) {
        counter.set(subject, (counter.get(subject) ?? 0) + 1)
      }
    })
    return Array.from(counter.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([subject, count]) => ({
        value: subject,
        label: `${subject}（${count} 道）`,
        count,
      }))
  }, [items])

  // 按来源试卷聚合，用于筛选
  const paperOptions = useMemo(() => {
    const counter = new Map<number, { title: string; count: number }>()
    items.forEach((item) => {
      if (item.paperId && item.paperTitle) {
        const current = counter.get(item.paperId)
        counter.set(item.paperId, { title: item.paperTitle, count: (current?.count ?? 0) + 1 })
      }
    })
    return Array.from(counter.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([paperId, { title, count }]) => ({
        value: paperId,
        label: `${title}（${count} 道）`,
      }))
  }, [items])

  const hasFilter = Boolean(subjectFilter || paperFilter)

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (!subjectFilter || item.subject === subjectFilter) &&
          (!paperFilter || item.paperId === paperFilter),
      ),
    [items, subjectFilter, paperFilter],
  )

  const load = async () => {
    setLoading(true)
    try {
      setItems(await fetchWrongQuestions())
      setSelectedIds(new Set())
    } catch (error) {
      message.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let alive = true
    fetchWrongQuestions()
      .then((data) => {
        if (alive) {
          setItems(data)
        }
      })
      .catch((error: Error) => {
        if (alive) {
          message.error(error.message)
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
  }, [message])

  const toggleAnswer = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSubjectFilterChange = (value?: string) => {
    setSubjectFilter(value)
    setSelectedIds(new Set())
  }

  const handlePaperFilterChange = (value?: number) => {
    setPaperFilter(value)
    setSelectedIds(new Set())
  }

  const clearFilters = () => {
    setSubjectFilter(undefined)
    setPaperFilter(undefined)
    setSelectedIds(new Set())
  }

  const handleDelete = async (item: WrongQuestionItem) => {
    try {
      await deleteWrongQuestion(item.wrongQuestionId)
      setItems((prev) => prev.filter((row) => row.wrongQuestionId !== item.wrongQuestionId))
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(item.wrongQuestionId)
        return next
      })
      message.success('错题已删除')
    } catch (error) {
      message.error((error as Error).message)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      return
    }
    const ids = Array.from(selectedIds)
    try {
      await deleteWrongQuestions(ids)
      setItems((prev) => prev.filter((row) => !selectedIds.has(row.wrongQuestionId)))
      setSelectedIds(new Set())
      message.success(`已删除 ${ids.length} 道错题`)
    } catch (error) {
      message.error((error as Error).message)
    }
  }

  const applyDefaultConfig = () => {
    const first = subjectOptions[0]
    form.setFieldsValue({
      subject: first?.value,
      title: first ? `${first.value}·错题重组卷` : '',
      questionCount: first?.count,
      durationMinutes: 60,
    })
  }

  const openReassembleModal = () => {
    applyDefaultConfig()
    setReassembleOpen(true)
  }

  const handleSubjectChange = (subject: string) => {
    const option = subjectOptions.find((item) => item.value === subject)
    form.setFieldsValue({
      title: `${subject}·错题重组卷`,
      questionCount: option?.count,
    })
  }

  const handleReassemble = async () => {
    let values: PaperReassembleParam
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    setReassembling(true)
    try {
      const result = await reassemblePaper(values)
      message.success(`已生成《${result.title}》，共 ${result.questionCount} 题`)
      setReassembleOpen(false)
      navigate(`/papers/${result.paperId}`)
    } catch (error) {
      message.error((error as Error).message)
    } finally {
      setReassembling(false)
    }
  }

  return (
    <div className="wrong-questions-page">
      <div className="wrong-questions-page__inner">
        <div className="wrong-questions-page__header">
          <Space size={12}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
              返回
            </Button>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                错题本
              </Typography.Title>
              <Typography.Text type="secondary">
                共 {items.length} 道错题
                {hasFilter ? `，当前筛选出 ${filteredItems.length} 道` : ''}
                ，按最近错误时间排序，可展开查看答案与解析
              </Typography.Text>
            </div>
          </Space>
          <Space size={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={subjectOptions.length === 0}
              onClick={openReassembleModal}
            >
              重组试卷
            </Button>
            <Popconfirm
              title={`删除选中的 ${selectedIds.size} 道错题？`}
              description="删除后不可恢复，后续答错会重新收录。"
              okText="删除"
              okButtonProps={{ danger: true }}
              cancelText="取消"
              onConfirm={() => void handleBatchDelete()}
            >
              <Button danger disabled={selectedIds.size === 0}>
                批量删除{selectedIds.size > 0 ? `（${selectedIds.size}）` : ''}
              </Button>
            </Popconfirm>
            <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
              刷新
            </Button>
          </Space>
        </div>

        {!loading && items.length > 0 && (
          <div className="wrong-questions-page__filters">
            <Space size={8} wrap>
              <Select
                allowClear
                placeholder="全部科目"
                style={{ width: 180 }}
                value={subjectFilter}
                options={subjectOptions.map(({ value, label }) => ({ value, label }))}
                onChange={handleSubjectFilterChange}
              />
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="全部试卷"
                style={{ width: 260 }}
                value={paperFilter}
                options={paperOptions}
                onChange={handlePaperFilterChange}
              />
              {hasFilter && (
                <Button type="link" onClick={clearFilters}>
                  清除筛选
                </Button>
              )}
            </Space>
            <Typography.Text type="secondary">
              {hasFilter ? `筛选出 ${filteredItems.length} 道` : `共 ${items.length} 道`}
            </Typography.Text>
          </div>
        )}

        {loading ? (
          <div className="wrong-questions-page__loading">
            <Spin size="large" tip="正在加载错题..." />
          </div>
        ) : items.length === 0 ? (
          <Card variant="borderless" className="wrong-questions-page__empty">
            <Empty description="还没有错题，交卷后答错的客观题会自动收录到这里" />
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card variant="borderless" className="wrong-questions-page__empty">
            <Empty description="当前筛选条件下没有错题">
              <Button onClick={clearFilters}>清除筛选</Button>
            </Empty>
          </Card>
        ) : (
          <div className="wrong-questions-page__list">
            {filteredItems.map((item, index) => {
              const showAnswer = expanded.has(item.wrongQuestionId)
              return (
                <Card
                  key={item.wrongQuestionId}
                  variant="borderless"
                  className="wrong-questions-page__item"
                  title={
                    <div className="wrong-questions-page__meta">
                      <Checkbox
                        checked={selectedIds.has(item.wrongQuestionId)}
                        onChange={() => toggleSelect(item.wrongQuestionId)}
                      />
                      <Tag color={TYPE_COLORS[item.type] ?? 'default'}>
                        {TYPE_LABELS[item.type] ?? item.type}
                      </Tag>
                      {item.subject && <Tag color="blue">{item.subject}</Tag>}
                      <Tag color="error">错 {item.wrongCount} 次</Tag>
                      {item.mastered === 1 && <Tag color="success">已掌握</Tag>}
                      {item.paperTitle && (
                        <span className="wrong-questions-page__paper">来源：{item.paperTitle}</span>
                      )}
                    </div>
                  }
                  extra={
                    <Space size={4}>
                      <Button
                        type="link"
                        icon={showAnswer ? <UpOutlined /> : <DownOutlined />}
                        onClick={() => toggleAnswer(item.wrongQuestionId)}
                      >
                        {showAnswer ? '收起答案' : '查看答案'}
                      </Button>
                      <Popconfirm
                        title="删除这道错题？"
                        description="删除后不可恢复，后续答错会重新收录。"
                        okText="删除"
                        okButtonProps={{ danger: true }}
                        cancelText="取消"
                        onConfirm={() => void handleDelete(item)}
                      >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  }
                >
                  <QuestionRenderer question={item} index={index + 1} showAnswer={showAnswer} />
                  {item.lastWrongTime && (
                    <div className="wrong-questions-page__time">最近答错：{item.lastWrongTime}</div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        title="错题重组试卷"
        open={reassembleOpen}
        onCancel={() => setReassembleOpen(false)}
        forceRender
        footer={[
          <Button key="default" onClick={applyDefaultConfig}>
            恢复默认
          </Button>,
          <Button key="cancel" onClick={() => setReassembleOpen(false)}>
            取消
          </Button>,
          <Button key="ok" type="primary" loading={reassembling} onClick={() => void handleReassemble()}>
            生成并开始答题
          </Button>,
        ]}
      >
        <Typography.Paragraph type="secondary">
          只会使用所选科目下的错题，随机抽取题目组成试卷。
        </Typography.Paragraph>
        <Form form={form} layout="vertical">
          <Form.Item
            label="科目"
            name="subject"
            rules={[{ required: true, message: '请选择科目' }]}
          >
            <Select
              placeholder="请选择错题的科目"
              options={subjectOptions.map(({ value, label }) => ({ value, label }))}
              onChange={handleSubjectChange}
            />
          </Form.Item>
          <Form.Item
            label="试卷名称"
            name="title"
            rules={[{ max: 200, message: '试卷名称不能超过 200 个字符' }]}
          >
            <Input placeholder="留空则自动生成" />
          </Form.Item>
          <Form.Item
            label="题目数量"
            name="questionCount"
            extra="不超过该科目下的错题数量，默认全部"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="答题时长（分钟）" name="durationMinutes">
            <InputNumber min={1} max={600} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
