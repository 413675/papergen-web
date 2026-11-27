import { request } from './http'
import type {
  CaptchaData,
  LoginPayload,
  LoginResult,
  RegisterPayload,
  UserInfo,
} from '@/types/auth'

export function fetchCaptcha() {
  return request<CaptchaData>({ url: '/v1/auth/captcha', method: 'GET' })
}

export function login(data: LoginPayload) {
  return request<LoginResult>({ url: '/v1/auth/login', method: 'POST', data })
}

export function register(data: RegisterPayload) {
  return request<LoginResult>({ url: '/v1/auth/register', method: 'POST', data })
}

export function fetchCurrentUser() {
  return request<UserInfo>({ url: '/v1/auth/me', method: 'GET' })
}

export function logout() {
  return request<void>({ url: '/v1/auth/logout', method: 'POST' })
}
