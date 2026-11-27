import { useState } from 'react'
import { App as AntdApp, Button, Form, Input } from 'antd'
import { IdcardOutlined, LockOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '@/components/AuthLayout'
import SliderCaptcha from '@/components/SliderCaptcha'
import { useCaptcha } from '@/hooks/useCaptcha'
import { register } from '@/api/auth'
import { tokenStorage } from '@/utils/token'

interface RegisterFormValues {
  username: string
  displayName?: string
  password: string
  confirmPassword: string
  sliderX: number
}

export default function RegisterPage() {
  const { message } = AntdApp.useApp()
  const navigate = useNavigate()
  const [form] = Form.useForm<RegisterFormValues>()
  const { captcha, loading: captchaLoading, refresh } = useCaptcha()
  const [submitting, setSubmitting] = useState(false)

  const handleRefreshCaptcha = async () => {
    form.setFieldValue('sliderX', 0)
    await refresh()
  }

  const handleFinish = async (values: RegisterFormValues) => {
    if (!captcha) {
      message.warning('验证码加载中，请稍候')
      return
    }
    setSubmitting(true)
    try {
      const result = await register({
        username: values.username,
        password: values.password,
        displayName: values.displayName,
        captchaId: captcha.captchaId,
        sliderX: values.sliderX,
      })
      tokenStorage.set(result.token, result.expiresIn)
      message.success('注册成功，已自动登录')
      navigate('/', { replace: true })
    } catch (error) {
      message.error((error as Error).message)
      form.setFieldValue('sliderX', 0)
      void refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="注册"
      subtitle="注册后默认拥有普通用户权限"
      footer={
        <>
          已有账号？<Link to="/login">返回登录</Link>
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
          <Input prefix={<UserOutlined />} placeholder="账号（4-32 位字母、数字或下划线）" autoComplete="username" />
        </Form.Item>

        <Form.Item name="displayName" rules={[{ max: 64, message: '显示名称不能超过 64 个字符' }]}>
          <Input prefix={<SmileOutlined />} placeholder="显示名称（选填）" autoComplete="nickname" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, max: 32, message: '密码长度需为 6-32 位' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码（6-32 位）"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('两次输入的密码不一致'))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<IdcardOutlined />}
            placeholder="确认密码"
            autoComplete="new-password"
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
          注册并登录
        </Button>
      </Form>
    </AuthLayout>
  )
}
