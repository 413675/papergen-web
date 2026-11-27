import { request } from './http'
import type { AiChatMessage, AiChatResult, AiModelConfig, AiModelConfigParam } from '@/types/ai'

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

/** 读取当前用户的模型配置 */
export function fetchAiConfig() {
  return request<AiModelConfig>({ url: '/v1/ai/config', method: 'GET' })
}

/** 保存当前用户的模型配置，apiKey 留空表示不修改 */
export function saveAiConfig(data: AiModelConfigParam) {
  return request<AiModelConfig>({ url: '/v1/ai/config', method: 'PUT', data })
}
