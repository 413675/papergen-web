import { useState } from 'react'
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Input,
  Modal,
  Space,
  Spin,
  Typography,
  Upload,
} from 'antd'
import type { UploadProps } from 'antd'
import { ArrowLeftOutlined, CopyOutlined, DownloadOutlined, InboxOutlined, RobotOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { importPaper } from '@/api/generation'
import { IMPORT_PROMPT } from './importPrompt'
import './index.scss'

export default function GenerationTasksPage() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(IMPORT_PROMPT)
      message.success('提示词已复制，发给任意 AI 并附上你的资料即可')
    } catch {
      message.error('复制失败，请手动选中文本复制')
    }
  }

  const handleUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      message.warning('仅支持 .json 格式的导入文件')
      return
    }
    setUploading(true)
    try {
      const data = await importPaper(file)
      message.success(`导入成功，共 ${data.questionCount} 题`)
      navigate(`/papers/${data.paperId}`)
    } catch (error) {
      message.error((error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const uploadProps: UploadProps = {
    accept: '.json,application/json',
    multiple: false,
    showUploadList: false,
    disabled: uploading,
    beforeUpload: (file) => {
      void handleUpload(file)
      return Upload.LIST_IGNORE
    },
  }

  return (
    <div className="generation-page">
      <div className="generation-page__inner">
        <div className="generation-page__header">
          <Space size={12}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
              返回
            </Button>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                生成任务
              </Typography.Title>
              <Typography.Text type="secondary">
                导入试卷文件，自动生成草稿试卷
              </Typography.Text>
            </div>
          </Space>
          <Space size={8}>
            <Button icon={<RobotOutlined />} onClick={() => setPromptOpen(true)}>
              复制 AI 提示词
            </Button>
            <Button
              icon={<DownloadOutlined />}
              href="/templates/paper-import-template.json"
              download="paper-import-template.json"
            >
              下载模板
            </Button>
          </Space>
        </div>

        <Card variant="borderless" className="generation-card">
          <Spin spinning={uploading} tip="正在解析并生成试卷...">
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽 JSON 文件到此区域</p>
              <p className="ant-upload-hint">仅支持 paper-import v1 格式，单个文件不超过 10MB</p>
            </Upload.Dragger>
          </Spin>
          <Alert
            className="generation-tip"
            type="info"
            showIcon
            message="导入前请确认文件格式"
            description="文件需包含 version、paper、parts 三个顶层字段，题目按 choice / blank / judge / short_answer / comprehensive 区分。没有现成 JSON 时，可以点右上角「复制 AI 提示词」，把它和自己的试卷资料一起发给任意 AI，让它生成 JSON；保存为 .json 后导入，成功后直接进入试卷答题页。"
          />
        </Card>
      </div>

      <Modal
        title="让 AI 生成导入 JSON"
        open={promptOpen}
        onCancel={() => setPromptOpen(false)}
        width={760}
        footer={[
          <Button key="close" onClick={() => setPromptOpen(false)}>
            关闭
          </Button>,
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={handleCopyPrompt}>
            复制提示词
          </Button>,
        ]}
      >
        <Typography.Paragraph type="secondary">
          把下面整段提示词复制给任意 AI（ChatGPT、Claude、DeepSeek 等），再附上你的试卷资料；得到它输出的
          JSON 后保存为 .json 文件，回到本页导入即可。
        </Typography.Paragraph>
        <Input.TextArea
          className="generation-prompt"
          value={IMPORT_PROMPT}
          readOnly
          autoSize={{ minRows: 12, maxRows: 18 }}
        />
      </Modal>
    </div>
  )
}
