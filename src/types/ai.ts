/** AI 对话结果 */
export interface AiChatResult {
  reply: string
  paperId?: number
  paperTitle?: string
  questionCount?: number
  totalScore?: number
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

/** AI 请求进度 */
export interface AiProgress {
  status: 'IDLE' | 'GENERATING' | 'RETRYING'
  retry: number
  maxRetries: number
  waitSeconds: number
}
