import { useEffect, useState, type ReactNode } from 'react'
import { App as AntdApp, Avatar, Button, Card, Col, Layout, Row, Space, Tag, Typography } from 'antd'
import {
  FileTextOutlined,
  LogoutOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { fetchCurrentUser, logout } from '@/api/auth'
import type { UserInfo } from '@/types/auth'
import { tokenStorage } from '@/utils/token'
import './index.scss'

interface ModuleItem {
  icon: ReactNode
  title: string
  desc: string
  path?: string
}

const MODULES: ModuleItem[] = [
  { icon: <ThunderboltOutlined />, title: '生成任务', desc: '导入文件，自动生成试卷', path: '/generation/tasks' },
  { icon: <FileTextOutlined />, title: '试卷管理', desc: '继续答题、查看解析与错题', path: '/papers' },
  { icon: <WarningOutlined />, title: '错题本', desc: '按知识点回顾错题', path: '/wrong-questions' },
]

const ROLE_LABELS: Record<string, string> = {
  user: '普通用户',
  teacher: '教师',
  admin: '管理员',
}

export default function HomePage() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => {
        // 401 已由请求拦截器处理跳转
      })
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // 退出失败也清理本地令牌
    } finally {
      tokenStorage.remove()
      message.success('已退出登录')
      navigate('/login', { replace: true })
    }
  }

  const displayName = user?.displayName || user?.username || ''

  return (
    <Layout className="home-layout">
      <Layout.Header className="home-header">
        <div className="home-brand">
          <span className="home-brand__logo">卷</span>
          <span>试卷助手</span>
        </div>
        <Space size={16}>
          <Space size={8} className="home-user">
            <Avatar size="small" style={{ backgroundColor: '#4f46e5' }}>
              {displayName.slice(0, 1) || '?'}
            </Avatar>
            <span>{displayName || '加载中...'}</span>
            {user && <Tag color="blue">{ROLE_LABELS[user.role] ?? user.role}</Tag>}
          </Space>
          <Button type="text" className="home-logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            退出
          </Button>
        </Space>
      </Layout.Header>

      <Layout.Content className="home-content">
        <Card className="home-welcome" variant="borderless">
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            欢迎回来，{displayName || '同学'}
          </Typography.Title>
          <Typography.Text type="secondary">
            上传试卷文件即可生成试卷，这里会展示你的试卷与生成任务。
          </Typography.Text>
        </Card>

        <Row gutter={[16, 16]}>
          {MODULES.map((module) => (
            <Col key={module.title} xs={24} sm={12} lg={8}>
              <Card
                className="home-module"
                hoverable={Boolean(module.path)}
                onClick={() => module.path && navigate(module.path)}
              >
                <div className="home-module__icon">{module.icon}</div>
                <div className="home-module__title">{module.title}</div>
                <div className="home-module__desc">{module.desc}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Layout.Content>
    </Layout>
  )
}
