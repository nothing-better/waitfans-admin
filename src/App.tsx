import { useEffect } from 'react'
import AppRouter from '@/router'
import { TOKEN_KEY } from '@/api/request'
import { useAppDispatch } from '@/store/hooks'
import { clearSession, fetchAdminInfo } from '@/store/slices/userSlice'

function App() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY)) dispatch(fetchAdminInfo())
    else dispatch(clearSession())
    const expired = () => dispatch(clearSession())
    window.addEventListener('waitfans-admin:auth-expired', expired)
    return () => window.removeEventListener('waitfans-admin:auth-expired', expired)
  }, [dispatch])
  return <AppRouter />
}

export default App
