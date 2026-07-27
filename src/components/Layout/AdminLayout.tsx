import { useEffect, useMemo, useState } from 'react'
import { Avatar, Button, Dropdown, Layout, Menu, Tooltip } from 'antd'
import {
  AppstoreOutlined,
  BarChartOutlined,
  DashboardOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import logo from '@/assets/img/teriteri-pink.png'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logoutAdmin } from '@/store/slices/userSlice'

const { Header, Sider, Content } = Layout

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user.current)
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1000)

  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < 760) setCollapsed(true)
    }
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const menuItems = useMemo(
    () => [
      { key: '/home', icon: <DashboardOutlined />, label: '工作台' },
      { key: '/data', icon: <BarChartOutlined />, label: '数据中心' },
      {
        key: '/content',
        icon: <AppstoreOutlined />,
        label: '内容管理',
        children: [
          { key: '/content/hot-search', label: '热搜管理' },
          { key: '/content/tag', label: '分区与标签' },
        ],
      },
      {
        key: '/review',
        icon: <FileSearchOutlined />,
        label: '内容审核',
        children: [
          { key: '/review/video/form', label: '视频审核' },
          { key: '/review/comment', label: '评论审核' },
          { key: '/review/danmu', label: '弹幕审核' },
        ],
      },
      {
        key: '/system',
        icon: <SettingOutlined />,
        label: '系统管理',
        children: [
          { key: '/system/user', icon: <UserOutlined />, label: '用户管理' },
          { key: '/system/role', icon: <SafetyCertificateOutlined />, label: '角色管理' },
        ],
      },
    ],
    [],
  )

  return (
    <Layout className="admin-layout">
      <Sider
        className="admin-sider"
        width={256}
        collapsedWidth={76}
        collapsed={collapsed}
        trigger={null}
        theme="light"
      >
        <button className="admin-logo" type="button" onClick={() => navigate('/home')}>
          <img src={logo} alt="teriteri" />
        </button>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/content', '/review', '/system']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout className="admin-main-layout">
        <Header className="admin-header">
          <Tooltip title={collapsed ? '展开菜单' : '收起菜单'}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((value) => !value)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  danger: true,
                  label: '退出登录',
                  onClick: () => dispatch(logoutAdmin()).then(() => navigate('/login')),
                },
              ],
            }}
          >
            <button className="admin-user" type="button">
              <Avatar src={user?.avatar || user?.avatar_url} icon={<UserOutlined />} />
              <span>{user?.nickname || '管理员'}</span>
            </button>
          </Dropdown>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
