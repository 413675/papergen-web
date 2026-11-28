import { request } from './http'
import type { AiChatMessage, AiChatResult, AiProgress } from '@/types/ai'

/** 携带文件与 AI 对话生成试卷，模型处理较慢，单独放宽超时 */
export function chatWithAi(sessionId: string, message: string, file: File | null) {
  const data = new FormData()
  data.append('sessionId', sessionId)
  if (message.trim()) {
    data.append('message', message.trim())
  }
  if (file) {
    data.append('file', file)
  }
  return request<AiChatResult>({
    url: '/v1/ai/chat',
    method: 'POST',
    data,
    timeout: 600000,
  })
}

/** 指定会话的对话记忆 */
export function fetchAiMessages(sessionId: string) {
  return request<AiChatMessage[]>({ url: '/v1/ai/messages', method: 'GET', params: { sessionId } })
}

/** 指定会话的 AI 请求进度，用于展示是否正在重试 */
export function fetchAiProgress(sessionId: string) {
  return request<AiProgress>({ url: '/v1/ai/progress', method: 'GET', params: { sessionId } })
}

/** 清空指定会话的记忆 */
export function clearAiMessages(sessionId: string) {
  return request<void>({ url: '/v1/ai/messages', method: 'DELETE', params: { sessionId } })
}
