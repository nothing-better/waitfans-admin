import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'
import AdminLayout from '@/components/Layout/AdminLayout'
import RequireAdmin from './guards'

const LoginPage = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const DataCenter = lazy(() => import('@/pages/DataCenter'))
const HotSearchManagement = lazy(() => import('@/pages/Content/HotSearchManagement'))
const TagManagement = lazy(() => import('@/pages/Content/TagManagement'))
const VideoReview = lazy(() => import('@/pages/Review/VideoReview'))
const VideoReviewDetail = lazy(() => import('@/pages/Review/VideoReviewDetail'))
const CommentReview = lazy(() => import('@/pages/Review/CommentReview'))
const DanmuReview = lazy(() => import('@/pages/Review/DanmuReview'))
const UserManagement = lazy(() => import('@/pages/System/UserManagement'))
const RoleManagement = lazy(() => import('@/pages/System/RoleManagement'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function LazyLoad({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="admin-route-loading"><Spin size="large" /></div>}>
      {children}
    </Suspense>
  )
}

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
        <Route path="/data" element={<LazyLoad><DataCenter /></LazyLoad>} />
        <Route path="/content/hot-search" element={<LazyLoad><HotSearchManagement /></LazyLoad>} />
        <Route path="/content/tag" element={<LazyLoad><TagManagement /></LazyLoad>} />
        <Route path="/review/video" element={<Navigate to="/review/video/form" replace />} />
        <Route path="/review/video/form" element={<LazyLoad><VideoReview /></LazyLoad>} />
        <Route path="/review/video/detail/:vid" element={<LazyLoad><VideoReviewDetail /></LazyLoad>} />
        <Route path="/review/comment" element={<LazyLoad><CommentReview /></LazyLoad>} />
        <Route path="/review/danmu" element={<LazyLoad><DanmuReview /></LazyLoad>} />
        <Route path="/system/user" element={<LazyLoad><UserManagement /></LazyLoad>} />
        <Route path="/system/role" element={<LazyLoad><RoleManagement /></LazyLoad>} />
      </Route>
      <Route path="*" element={<LazyLoad><NotFound /></LazyLoad>} />
    </Routes>
  )
}
