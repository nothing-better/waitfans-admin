import { Button, Form, Input, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import logo from '@/assets/img/teriteri-white.png'
import loginBg from '@/assets/img/login-bg.jpg'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { loginAdmin } from '@/store/slices/userSlice'
import type { Credentials } from '@/api/auth'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const authenticated = useAppSelector((state) => state.user.authenticated)

  if (authenticated) return <Navigate to="/home" replace />

  const submit = async (values: Credentials) => {
    try {
      await dispatch(loginAdmin(values)).unwrap()
      message.success('登录成功')
      const from = (location.state as { from?: string } | null)?.from
      navigate(from || '/home', { replace: true })
    } catch {
      // The shared request layer presents the server error.
    }
  }

  return (
    <main className="admin-login" style={{ backgroundImage: `url(${loginBg})` }}>
      <section className="admin-login__panel">
        <img src={logo} alt="teriteri" />
        <h1>内容管理后台</h1>
        <p>登录后管理审核、内容与系统配置</p>
        <Form<Credentials> layout="vertical" size="large" onFinish={submit}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input prefix={<UserOutlined />} placeholder="管理员账号" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>登录</Button>
        </Form>
      </section>
    </main>
  )
}
