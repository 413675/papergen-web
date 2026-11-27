/** AI 对话结果 */
export interface AiChatResult {
  reply: string
  paperId?: number
  paperTitle?: string
  questionCount?: number
  totalScore?: number
}

/** AI 模型配置，只保存在前端内存，不落库也不持久化 */
export interface AiChatConfig {
  baseUrl: string
  model: string
  temperature: number
  apiKey: string
}

/** AI 对话消息 */
export interface AiChatMessage {
  aiChatMessageId: number
  role: 'user' | 'assistant'
  content: string
  attachmentName?: string
  paperId?: number
  createTime?: string
}
