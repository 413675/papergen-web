import { useState } from 'react'
import { App as AntdApp, Button, Form, Input } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '@/components/AuthLayout'
import SliderCaptcha from '@/components/SliderCaptcha'
import { useCaptcha } from '@/hooks/useCaptcha'
import { login } from '@/api/auth'
import { tokenStorage } from '@/utils/token'

interface LoginFormValues {
  username: string
  password: string
  sliderX: number
}

export default function LoginPage() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const [form] = Form.useForm<LoginFormValues>()
  const { captcha, loading: captchaLoading, refresh } = useCaptcha()
  const [submitting, setSubmitting] = useState(false)

  const handleRefreshCaptcha = async () => {
    form.setFieldValue('sliderX', 0)
    await refresh()
  }

  const handleFinish = async (values: LoginFormValues) => {
    if (!captcha) {
      message.warning('验证码加载中，请稍候')
      return
    }
    setSubmitting(true)
    try {
      const result = await login({
        username: values.username,
        password: values.password,
        captchaId: captcha.captchaId,
        sliderX: values.sliderX,
      })
      tokenStorage.set(result.token, result.expiresIn)
      message.success('登录成功')
      navigate('/', { replace: true })
    } catch (error) {
      message.error((error as Error).message)
      // 验证码已失效，重置滑块并刷新
      form.setFieldValue('sliderX', 0)
      void refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="登录"
      subtitle="使用账号密码登录，首次使用请先注册"
      footer={
        <>
          还没有账号？<Link to="/register">立即注册</Link>
        </>
      }
    >
      <Form
        form={form}
        layout="vertical"
        size="large"
        requiredMark={false}
        initialValues={{ sliderX: 0 }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入账号' },
            { pattern: /^[a-zA-Z0-9_]{4,32}$/, message: '账号需为 4-32 位字母、数字或下划线' },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="账号" autoComplete="username" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item
          name="sliderX"
          rules={[
            {
              validator: (_, value: number) =>
                value > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error('请拖动滑块完成拼图')),
            },
          ]}
        >
          <SliderCaptcha
            captcha={captcha}
            loading={captchaLoading}
            onRefresh={handleRefreshCaptcha}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={submitting}>
          登录
        </Button>
      </Form>
    </AuthLayout>
  )
}
