/** AI 对话结果 */
export interface AiChatResult {
  reply: string
  paperId?: number
  paperTitle?: string
  questionCount?: number
  totalScore?: number
}

/** 用户级 AI 模型配置（不返回真实密钥） */
export interface AiModelConfig {
  baseUrl: string
  model: string
  temperature: number
  hasApiKey: boolean
}

/** 保存模型配置的入参，apiKey 留空表示沿用旧密钥 */
export interface AiModelConfigParam {
  baseUrl: string
  model: string
  temperature: number
  apiKey?: string
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
