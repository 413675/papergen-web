import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import AiChatPage from '@/pages/AiChat'
import GenerationTasksPage from '@/pages/GenerationTasks'
import LoginPage from '@/pages/LoginPage'
import PaperDetailPage from '@/pages/PaperDetail'
import PaperListPage from '@/pages/PaperList'
import PaperResultPage from '@/pages/PaperResult'
import RegisterPage from '@/pages/RegisterPage'
import WrongQuestionsPage from '@/pages/WrongQuestions'
import { tokenStorage } from '@/utils/token'

/** 需要登录的页面，未登录跳转登录页 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  return tokenStorage.get() ? children : <Navigate to="/login" replace />
}

/** 已登录用户不再进入登录/注册页 */
function GuestRoute({ children }: { children: ReactNode }) {
  return tokenStorage.get() ? <Navigate to="/" replace /> : children
}

/** 路由表：/login、/register 仅游客可访问，/ 需要登录 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <AiChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generation/tasks"
          element={
            <ProtectedRoute>
              <GenerationTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/papers"
          element={
            <ProtectedRoute>
              <PaperListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/papers/:paperId"
          element={
            <ProtectedRoute>
              <PaperDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/papers/:paperId/result"
          element={
            <ProtectedRoute>
              <PaperResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wrong-questions"
          element={
            <ProtectedRoute>
              <WrongQuestionsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
