import { request } from './http'
import type { AiChatConfig, AiChatMessage, AiChatResult } from '@/types/ai'

/** 携带文件与 AI 对话生成试卷，模型处理较慢，单独放宽超时；模型配置随请求传入，服务端不保存 */
export function chatWithAi(sessionId: string, message: string, config: AiChatConfig, file: File | null) {
  const data = new FormData()
  data.append('sessionId', sessionId)
  data.append('apiKey', config.apiKey.trim())
  data.append('baseUrl', config.baseUrl.trim())
  data.append('model', config.model.trim())
  data.append('temperature', String(config.temperature))
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
    timeout: 180000,
  })
}

/** 指定会话的对话记忆 */
export function fetchAiMessages(sessionId: string) {
  return request<AiChatMessage[]>({ url: '/v1/ai/messages', method: 'GET', params: { sessionId } })
}

/** 清空指定会话的记忆 */
export function clearAiMessages(sessionId: string) {
  return request<void>({ url: '/v1/ai/messages', method: 'DELETE', params: { sessionId } })
}
