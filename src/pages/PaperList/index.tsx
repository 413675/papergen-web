import { useEffect, useState } from 'react'
import { App as AntdApp, Button, Card, Popconfirm, Space, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { deletePaper, deletePapers, fetchPapers } from '@/api/paper'
import type { PaperListItem, PaperUserStatus } from '@/types/paper'
import './index.scss'

const STATUS_TAGS: Record<PaperUserStatus, { color: string; text: string }> = {
  not_started: { color: 'default', text: '未开始' },
  doing: { color: 'processing', text: '进行中' },
  submitted: { color: 'success', text: '已完成' },
}

export default function PaperListPage() {
  const navigate = useNavigate()
  const { message } = AntdApp.useApp()
  const [papers, setPapers] = useState<PaperListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKeys, setSelectedKeys] = useState<number[]>([])

  useEffect(() => {
    let alive = true
    fetchPapers()
      .then((data) => {
        if (alive) {
          setPapers(data)
        }
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
  }, [message])

  const reload = async () => {
    setLoading(true)
    try {
      setPapers(await fetchPapers())
      setSelectedKeys([])
    } catch (error) {
      message.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (record: PaperListItem) => {
    try {
      await deletePaper(record.paperId)
      setPapers((prev) => prev.filter((item) => item.paperId !== record.paperId))
      setSelectedKeys((prev) => prev.filter((id) => id !== record.paperId))
      message.success('试卷已删除')
    } catch (error) {
      message.error((error as Error).message)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedKeys.length === 0) {
      return
    }
    const count = selectedKeys.length
    try {
      await deletePapers(selectedKeys)
      setPapers((prev) => prev.filter((item) => !selectedKeys.includes(item.paperId)))
      setSelectedKeys([])
      message.success(`已删除 ${count} 份试卷`)
    } catch (error) {
      message.error((error as Error).message)
    }
  }

  const columns: TableColumnsType<PaperListItem> = [
    {
      title: '试卷',
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => (
        <div className="paper-list__title">
          <span>{record.title}</span>
          {record.subject && <Tag color="blue">{record.subject}</Tag>}
        </div>
      ),
    },
    {
      title: '题数',
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: 90,
      render: (count: number) => `${count} 题`,
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 90,
      render: (score: number) => `${score} 分`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PaperUserStatus) => {
        const tag = STATUS_TAGS[status]
        return <Tag color={tag.color}>{tag.text}</Tag>
      },
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      width: 110,
      render: (score: number | undefined, record) =>
        record.status === 'submitted' && score != null ? (
          <span className="paper-list__score">
            {score} / {record.totalScore}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: '最近更新',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (value: string | undefined) => value ?? '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 190,
      render: (_, record) => (
        <Space size={0}>
          {record.status === 'submitted' ? (
            <Button type="link" onClick={() => navigate(`/papers/${record.paperId}/result`)}>
              查看解析
            </Button>
          ) : (
            <Button type="link" onClick={() => navigate(`/papers/${record.paperId}`)}>
              {record.status === 'doing' ? '继续答题' : '开始答题'}
            </Button>
          )}
          <Popconfirm
            title="删除这份试卷？"
            description="试卷、答题记录及相关错题将一并删除，且不可恢复。"
            okText="删除"
            okButtonProps={{ danger: true }}
            cancelText="取消"
            onConfirm={() => void handleDelete(record)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="paper-list-page">
      <div className="paper-list-page__inner">
        <div className="paper-list-page__header">
          <Space size={12}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
              返回
            </Button>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                试卷管理
              </Typography.Title>
              <Typography.Text type="secondary">
                进行中的试卷可以继续作答，已完成的试卷可以查看解析
              </Typography.Text>
            </div>
          </Space>
          <Space size={8}>
            <Popconfirm
              title={`删除选中的 ${selectedKeys.length} 份试卷？`}
              description="试卷、答题记录及相关错题将一并删除，且不可恢复。"
              okText="删除"
              okButtonProps={{ danger: true }}
              cancelText="取消"
              onConfirm={() => void handleBatchDelete()}
            >
              <Button danger disabled={selectedKeys.length === 0}>
                批量删除{selectedKeys.length > 0 ? `（${selectedKeys.length}）` : ''}
              </Button>
            </Popconfirm>
            <Button icon={<ReloadOutlined />} onClick={() => void reload()} loading={loading}>
              刷新
            </Button>
          </Space>
        </div>

        <Card variant="borderless" className="paper-list-page__card">
          <Table<PaperListItem>
            rowKey="paperId"
            columns={columns}
            dataSource={papers}
            loading={loading}
            pagination={false}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: (keys) => setSelectedKeys(keys.map(Number)),
            }}
            locale={{ emptyText: '暂无试卷，先去生成任务导入一份吧' }}
          />
        </Card>
      </div>
    </div>
  )
}
