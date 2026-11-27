import type { ReactNode } from 'react'
import './index.scss'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * 登录/注册页共用的居中卡片布局
 */
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-decor auth-decor--one" />
      <div className="auth-decor auth-decor--two" />
      <div className="auth-card">
        <div className="auth-brand">
          <img className="auth-logo" src="/paper-logo.svg" alt="试卷助手" />
          <div>
            <h1>试卷助手</h1>
            <p>PaperGen · 智能组卷与试卷生成</p>
          </div>
        </div>
        <h2>{title}</h2>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  )
}
