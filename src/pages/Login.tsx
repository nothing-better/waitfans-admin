import { Button, Card, Form, Input, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const { Title } = Typography

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <Title level={3} className="text-center mb-6">管理员登录</Title>
        <Form layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">登录</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
