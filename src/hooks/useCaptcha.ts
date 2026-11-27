import { useCallback, useEffect, useState } from 'react'
import { App as AntdApp } from 'antd'
import { fetchCaptcha } from '@/api/auth'
import type { CaptchaData } from '@/types/auth'

/**
 * 验证码加载与刷新，失败时通过全局 message 提示。
 */
export function useCaptcha() {
  const { message } = AntdApp.useApp()
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null)
  const [loading, setLoading] = useState(false)

  /**
   * 静默加载验证码，供首次进入页面使用
   */
  const load = useCallback(async () => {
    try {
      const data = await fetchCaptcha()
      setCaptcha(data)
    } catch (error) {
      setCaptcha(null)
      message.error((error as Error).message)
    }
  }, [message])

  /**
   * 手动刷新，带 loading 状态
   */
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      await load()
    } finally {
      setLoading(false)
    }
  }, [load])

  useEffect(() => {
    let active = true
    fetchCaptcha()
      .then((data) => {
        if (active) setCaptcha(data)
      })
      .catch((error: Error) => {
        if (!active) return
        setCaptcha(null)
        message.error(error.message)
      })
    return () => {
      active = false
    }
  }, [message])

  return { captcha, loading, refresh }
}
