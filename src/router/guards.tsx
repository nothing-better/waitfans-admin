import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAppSelector } from '@/store/hooks'

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { authenticated, initialized } = useAppSelector((state) => state.user)
  if (!initialized) return <div className="admin-route-loading"><Spin size="large" /></div>
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
