import { ReloadOutlined } from '@ant-design/icons'
import { Button, Slider, Spin } from 'antd'
import type { CaptchaData } from '@/types/auth'
import './index.scss'

interface SliderCaptchaProps {
  captcha: CaptchaData | null
  loading?: boolean
  value?: number
  onChange?: (value: number) => void
  onRefresh: () => void
}

/**
 * 滑块验证码：拖动下方滑杆，拼图块会跟随移动，最终提交 sliderX 给后端校验。
 * 与 Form.Item 绑定（value / onChange）。
 */
export default function SliderCaptcha({
  captcha,
  loading,
  value,
  onChange,
  onRefresh,
}: SliderCaptchaProps) {
  const sliderValue = value ?? 0
  const max = captcha ? captcha.width - captcha.sliderWidth : 0

  return (
    <div className="slider-captcha">
      <div
        className="slider-captcha__stage"
        style={{ width: captcha?.width ?? 320, height: captcha?.height ?? 160 }}
      >
        {captcha ? (
          <>
            <img
              className="slider-captcha__bg"
              src={captcha.backgroundImage}
              alt="验证码背景"
              draggable={false}
            />
            <img
              className="slider-captcha__piece"
              src={captcha.sliderImage}
              alt="拼图块"
              draggable={false}
              style={{
                left: sliderValue,
                top: captcha.sliderY,
                width: captcha.sliderWidth,
                height: captcha.sliderHeight,
              }}
            />
          </>
        ) : (
          <div className="slider-captcha__loading">
            <Spin />
          </div>
        )}
        <Button
          className="slider-captcha__refresh"
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={onRefresh}
          aria-label="刷新验证码"
        />
      </div>
      <Slider
        className="slider-captcha__slider"
        min={0}
        max={max || 1}
        value={sliderValue}
        disabled={!captcha}
        tooltip={{ formatter: null }}
        onChange={(next) => onChange?.(Array.isArray(next) ? next[0] : next)}
      />
      <span className="slider-captcha__hint">向右拖动滑块完成拼图</span>
    </div>
  )
}
