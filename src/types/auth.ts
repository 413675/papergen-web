export interface UserInfo {
  sysUserId: number
  username: string
  displayName: string
  role: string
}

export interface CaptchaData {
  captchaId: string
  backgroundImage: string
  sliderImage: string
  width: number
  height: number
  sliderWidth: number
  sliderHeight: number
  sliderY: number
}

export interface LoginResult {
  token: string
  tokenType: string
  expiresIn: number
  user: UserInfo
}

export interface ApiResult<T> {
  code: number
  msg: string
  data: T
}

export interface LoginPayload {
  username: string
  password: string
  captchaId: string
  sliderX: number
}

export interface RegisterPayload extends LoginPayload {
  displayName?: string
}
