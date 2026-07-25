import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  PlaySquareOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useState } from 'react'

const { Sider, Content } = Layout

export default function AdminLayout() {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/review/video', icon: <PlaySquareOutlined />, label: '视频审核' },
    { key: '/content/carousel', icon: <FileTextOutlined />, label: '内容管理' },
    { key: '/system/user', icon: <SettingOutlined />, label: '系统管理' },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="p-4 text-white text-center font-bold">
          {collapsed ? 'TF' : 'Teriteri Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Content className="m-4 p-6 bg-white rounded-lg">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
