import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import AdminLayout from '@/components/Layout/AdminLayout'
import RequireAdmin from './guards'

const LoginPage = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const VideoReview = lazy(() => import('@/pages/Review/VideoReview'))
const VideoReviewDetail = lazy(() => import('@/pages/Review/VideoReviewDetail'))
const GenericPage = lazy(() => import('@/pages/GenericPage'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function LazyLoad({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="admin-route-loading"><Spin size="large" /></div>}>
      {children}
    </Suspense>
  )
}

const genericPaths = [
  'data',
  'content/carousel',
  'content/hot-search',
  'content/ranking',
  'content/tag',
  'review/article',
  'review/avatar',
  'review/dynamic',
  'review/comment',
  'review/danmu',
  'case/report',
  'case/appeal',
  'system/user',
  'system/role',
]

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LazyLoad><LoginPage /></LazyLoad>} />
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<LazyLoad><Dashboard /></LazyLoad>} />
        <Route path="/review/video" element={<Navigate to="/review/video/form" replace />} />
        <Route path="/review/video/form" element={<LazyLoad><VideoReview /></LazyLoad>} />
        <Route path="/review/video/detail/:vid" element={<LazyLoad><VideoReviewDetail /></LazyLoad>} />
        {genericPaths.map((path) => (
          <Route key={path} path={`/${path}`} element={<LazyLoad><GenericPage /></LazyLoad>} />
        ))}
      </Route>
      <Route path="*" element={<LazyLoad><NotFound /></LazyLoad>} />
    </Routes>
  )
}
