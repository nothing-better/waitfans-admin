import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Spin } from 'antd'
import AdminLayout from '@/components/Layout/AdminLayout'

const LoginPage = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const LazyLoad = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Spin className="flex justify-center items-center min-h-screen" />}>
    {children}
  </Suspense>
)

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LazyLoad><LoginPage /></LazyLoad>} />
      <Route element={<AdminLayout />}>
        <Route index element={<LazyLoad><Dashboard /></LazyLoad>} />
      </Route>
      <Route path="*" element={<LazyLoad><NotFound /></LazyLoad>} />
    </Routes>
  )
}
