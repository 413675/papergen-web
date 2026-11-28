import { useEffect, useRef, useState } from 'react'
import { App as AntdApp, Button, Empty, Input, Popconfirm, Space, Spin, Tag, Typography, Upload } from 'antd'
import {
  ArrowLeftOutlined,
  CloseOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  RobotOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { chatWithAi, clearAiMessages, fetchAiMessages, fetchAiProgress } from '@/api/ai'
import type { AiChatMessage, AiProgress } from '@/types/ai'
import './index.scss'

/** 页面内展示的消息，id 为本地序号 */
interface ChatItem {
  id: number
  role: 'user' | 'assistant'
  content: string
  attachmentName?: string
  paperId?: number
}

const ACCEPT_TYPES =
  '.pdf,.doc,.docx,.txt,.md,.json,.csv,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.html,.xml'

/** 生成期间轮播的等待提示 */
const AI_WAIT_HINTS = [
  '正在读取你上传的文件…',
  '正在识别题型、题量和分值…',
  '正在随机抽题并打乱顺序…',
  '正在生成试卷 JSON…',
  '正在自检格式，有问题会自动重新生成…',
  '长试卷可能需要几分钟，请不要关闭页面…',
]

let localId = 0

/** 每次进入对话页都生成一个全新会话ID */
function createSessionId() {
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function toChatItem(message: AiChatMessage): ChatItem {
  return {
    id: ++localId,
    role: message.role,
    content: message.content,
    attachmentName: message.attachmentName,
    paperId: message.paperId,
  }
}

export default function AiChatPage() {
  const navigate = useNavigate()
  const { message: toast, modal } = AntdApp.useApp()
  const [items, setItems] = useState<ChatItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sessionId] = useState(createSessionId)
  const [progress, setProgress] = useState<AiProgress | null>(null)
  const [hintIndex, setHintIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchAiMessages(sessionId)
      .then((messages) => setItems(messages.map(toChatItem)))
      .catch(() => {
        // 401 已由请求拦截器处理
      })
      .finally(() => setLoadingHistory(false))
  }, [sessionId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [items, sending])

  // 请求进行中轮询后端进度，展示模型繁忙时的自动重试次数
  useEffect(() => {
    if (!sending) {
      return
    }
    let stopped = false
    const timer = window.setInterval(() => {
      fetchAiProgress(sessionId)
        .then((next) => {
          if (!stopped) {
            setProgress(next)
          }
        })
        .catch(() => {
          // 进度查询失败不影响主流程
        })
    }, 1000)
    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [sending, sessionId])

  // 生成期间轮播等待提示，避免长时间只有一个转圈
  useEffect(() => {
    if (!sending) {
      return
    }
    const timer = window.setInterval(() => {
      setHintIndex((prev) => (prev + 1) % AI_WAIT_HINTS.length)
    }, 4000)
    return () => window.clearInterval(timer)
  }, [sending])

  const sendingHint =
    progress?.status === 'RETRYING'
      ? `模型访问量过大，正在自动重试（第 ${progress.retry}/${progress.maxRetries} 次），请稍候…`
      : AI_WAIT_HINTS[hintIndex]

  const askStart = (paperId: number, title?: string, questionCount?: number, totalScore?: number) => {
    modal.confirm({
      title: '试卷已生成',
      content: `《${title ?? '新试卷'}》共 ${questionCount ?? 0} 道题，总分 ${totalScore ?? 0} 分，是否现在开始答题？`,
      okText: '开始答题',
      cancelText: '稍后',
      onOk: () => navigate(`/papers/${paperId}`),
    })
  }

  const handleSend = async () => {
    const text = input.trim()
    if (sending || (!text && !file)) {
      return
    }
    const currentFile = file
    setHintIndex(0)
    setSending(true)
    setItems((prev) => [
      ...prev,
      { id: ++localId, role: 'user', content: text || '请根据上传的文件生成一份试卷', attachmentName: currentFile?.name },
    ])
    setInput('')
    setFile(null)
    try {
      const result = await chatWithAi(sessionId, text, currentFile)
      setItems((prev) => [
        ...prev,
        { id: ++localId, role: 'assistant', content: result.reply, paperId: result.paperId },
      ])
      if (result.paperId) {
        askStart(result.paperId, result.paperTitle, result.questionCount, result.totalScore)
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : '生成失败'
      setItems((prev) => [...prev, { id: ++localId, role: 'assistant', content: reason }])
      toast.error(reason)
    } finally {
      setSending(false)
      setProgress(null)
    }
  }

  const handleClear = async () => {
    try {
      await clearAiMessages(sessionId)
      setItems([])
      toast.success('对话记忆已清空')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '清空失败')
    }
  }

  return (
    <div className="ai-page">
      <div className="ai-page__inner">
        <div className="ai-page__header">
          <Space size={12}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
              返回
            </Button>
            <Space size={8}>
              <RobotOutlined className="ai-page__title-icon" />
              <Typography.Title level={4} style={{ margin: 0 }}>
                AI 导卷
              </Typography.Title>
            </Space>
          </Space>
          <Space size={8}>
            <Popconfirm title="清空后会忘记之前的文件与需求，确定吗？" onConfirm={handleClear}>
              <Button icon={<DeleteOutlined />}>清空记忆</Button>
            </Popconfirm>
          </Space>
        </div>

        <div className="ai-page__chat" ref={listRef}>
          {loadingHistory ? (
            <div className="ai-page__loading">
              <Spin />
            </div>
          ) : items.length === 0 ? (
            <div className="ai-page__empty">
              <Empty
                image={<FileTextOutlined className="ai-page__empty-icon" />}
                description={
                  <Space direction="vertical" size={4}>
                    <Typography.Text strong>上传任意格式的试卷文件，AI 帮你生成可答题的试卷</Typography.Text>
                    <Typography.Text type="secondary">
                      支持 PDF、Word、TXT、Markdown、Excel、图片等；未上传文件时只回答问题，不会生成试卷。
                    </Typography.Text>
                  </Space>
                }
              />
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className={`ai-message ai-message--${item.role}`}>
                <div className="ai-message__bubble">
                  {item.attachmentName && (
                    <div className="ai-message__attachment">
                      <FileTextOutlined /> {item.attachmentName}
                    </div>
                  )}
                  <div className="ai-message__content">{item.content}</div>
                  {item.paperId && (
                    <Button
                      type="primary"
                      size="small"
                      className="ai-message__start"
                      onClick={() => navigate(`/papers/${item.paperId}`)}
                    >
                      开始答题
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="ai-message ai-message--assistant">
              <div className="ai-message__bubble ai-message__bubble--loading">
                <Spin size="small" />
                <span key={progress?.status === 'RETRYING' ? 'retry' : hintIndex} className="ai-message__hint">
                  {sendingHint}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="ai-page__composer">
          {file && (
            <Tag
              className="ai-page__file"
              icon={<FileTextOutlined />}
              closable
              closeIcon={<CloseOutlined />}
              onClose={() => setFile(null)}
            >
              {file.name}
            </Tag>
          )}
          <Input.TextArea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="可以直接提问；上传文件后发送才会生成试卷，例如：整理成 20 道题，每题 5 分"
            autoSize={{ minRows: 2, maxRows: 5 }}
            disabled={sending}
            onPressEnter={(event) => {
              if (!event.shiftKey) {
                event.preventDefault()
                handleSend()
              }
            }}
          />
          <div className="ai-page__actions">
            <Upload
              accept={ACCEPT_TYPES}
              showUploadList={false}
              beforeUpload={(selected) => {
                setFile(selected)
                return false
              }}
              disabled={sending}
            >
              <Button icon={<PaperClipOutlined />} disabled={sending}>
                选择文件
              </Button>
            </Upload>
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={sending}
              disabled={!input.trim() && !file}
              onClick={handleSend}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
