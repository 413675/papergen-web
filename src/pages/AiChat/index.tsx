import { useEffect, useRef, useState } from 'react'
import { App as AntdApp, Button, Empty, Form, Input, InputNumber, Modal, Popconfirm, Space, Spin, Tag, Typography, Upload } from 'antd'
import {
  ArrowLeftOutlined,
  CloseOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  RobotOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { chatWithAi, clearAiMessages, fetchAiConfig, fetchAiMessages, saveAiConfig } from '@/api/ai'
import type { AiChatMessage } from '@/types/ai'
import './index.scss'

/** 页面内展示的消息，id 为本地序号 */
interface ChatItem {
  id: number
  role: 'user' | 'assistant'
  content: string
  attachmentName?: string
  paperId?: number
}

/** 模型配置表单 */
interface ModelConfigForm {
  baseUrl: string
  model: string
  temperature: number
  apiKey?: string
}

const ACCEPT_TYPES =
  '.pdf,.doc,.docx,.txt,.md,.json,.csv,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.html,.xml'

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
  const [configForm] = Form.useForm<ModelConfigForm>()
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const [configOpen, setConfigOpen] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
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
    fetchAiConfig()
      .then((config) => setHasApiKey(config.hasApiKey))
      .catch(() => {
        // 未登录时由请求拦截器处理
      })
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [items, sending])

  const askStart = (paperId: number, title?: string, questionCount?: number, totalScore?: number) => {
    modal.confirm({
      title: '试卷已生成',
      content: `《${title ?? '新试卷'}》共 ${questionCount ?? 0} 道题，总分 ${totalScore ?? 0} 分，是否现在开始答题？`,
      okText: '开始答题',
      cancelText: '稍后',
      onOk: () => navigate(`/papers/${paperId}`),
    })
  }

  const openConfig = async () => {
    configForm.resetFields()
    try {
      const config = await fetchAiConfig()
      setHasApiKey(config.hasApiKey)
      configForm.setFieldsValue({
        baseUrl: config.baseUrl,
        model: config.model,
        temperature: config.temperature,
        apiKey: '',
      })
    } catch {
      // 使用表单默认值
    }
    setConfigOpen(true)
  }

  const handleSaveConfig = async () => {
    try {
      const values = await configForm.validateFields()
      setSavingConfig(true)
      const saved = await saveAiConfig({
        baseUrl: values.baseUrl,
        model: values.model,
        temperature: values.temperature,
        apiKey: values.apiKey?.trim() || undefined,
      })
      setHasApiKey(saved.hasApiKey)
      setConfigOpen(false)
      toast.success('模型配置已保存')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    } finally {
      setSavingConfig(false)
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (sending || (!text && !file)) {
      return
    }
    if (hasApiKey === false) {
      toast.warning('请先配置 AI 模型的 API Key')
      openConfig()
      return
    }
    const currentFile = file
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
            <Button icon={<SettingOutlined />} onClick={openConfig}>
              模型配置
            </Button>
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
                <span>AI 正在解析文件并生成试卷，这可能需要一点时间…</span>
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

      <Modal
        title="AI 模型配置"
        open={configOpen}
        onOk={handleSaveConfig}
        onCancel={() => setConfigOpen(false)}
        confirmLoading={savingConfig}
        okText="保存"
        cancelText="取消"
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          支持任何兼容 OpenAI 协议的模型服务，配置只保存在你的账号下。
        </Typography.Paragraph>
        <Form
          form={configForm}
          layout="vertical"
          initialValues={{ baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat', temperature: 0.2 }}
        >
          <Form.Item
            name="apiKey"
            label="API Key"
            rules={hasApiKey ? [] : [{ required: true, message: '请填写 API Key' }]}
            extra={hasApiKey ? '已保存密钥，留空表示不修改' : undefined}
          >
            <Input.Password placeholder="sk-..." autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="baseUrl"
            label="服务地址"
            rules={[{ required: true, message: '请填写服务地址' }]}
          >
            <Input placeholder="https://api.deepseek.com" />
          </Form.Item>
          <Form.Item name="model" label="模型名称" rules={[{ required: true, message: '请填写模型名称' }]}>
            <Input placeholder="deepseek-chat" />
          </Form.Item>
          <Form.Item name="temperature" label="温度（0-2）">
            <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
