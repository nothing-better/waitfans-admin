import { useCallback, useEffect, useState } from 'react'
import {
  Avatar,
  Button,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import {
  ReloadOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  getUsers,
  updateUserRole,
  updateUserState,
  type AdminUser,
} from '@/api/management'
import { useAppSelector } from '@/store/hooks'

const roleLabels = ['普通用户', '管理员', '超级管理员']
const roleColors = ['default', 'blue', 'gold']

interface Props {
  mode: 'users' | 'roles'
}

export default function UserTablePage({ mode }: Props) {
  const currentUid = useAppSelector((state) => state.user.current?.uid)
  const [keyword, setKeyword] = useState('')
  const [state, setState] = useState<number | undefined>()
  const [role, setRole] = useState<number | undefined>(mode === 'roles' ? 1 : undefined)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [operatingUid, setOperatingUid] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getUsers({ keyword: keyword || undefined, state, role, page, pageSize: 10 })
      setItems(result.items || [])
      setTotal(result.total || 0)
    } finally {
      setLoading(false)
    }
  }, [keyword, page, role, state])

  useEffect(() => { load() }, [load])

  const changeState = async (user: AdminUser) => {
    setOperatingUid(user.uid)
    try {
      await updateUserState(user.uid, user.state === 0 ? 1 : 0)
      message.success(user.state === 0 ? '用户已封禁' : '用户已解除封禁')
      await load()
    } finally {
      setOperatingUid(null)
    }
  }

  const confirmRoleChange = (user: AdminUser, nextRole: number) => {
    Modal.confirm({
      title: `确认将 ${user.nickname} 调整为${roleLabels[nextRole]}？`,
      content: '角色变更会立即使该用户现有登录会话失效。',
      icon: <SafetyCertificateOutlined />,
      onOk: async () => {
        setOperatingUid(user.uid)
        try {
          await updateUserRole(user.uid, nextRole)
          message.success('角色已更新')
          await load()
        } finally {
          setOperatingUid(null)
        }
      },
    })
  }

  const resetFilters = () => {
    setKeyword('')
    setState(undefined)
    setRole(mode === 'roles' ? 1 : undefined)
    setPage(1)
  }

  const isRolePage = mode === 'roles'

  return (
    <div className="system-user-page">
      <div className="admin-page-heading">
        <div>
          <h1>{isRolePage ? '角色管理' : '用户管理'}</h1>
          <p>
            {isRolePage
              ? '分配管理员权限，角色变化会强制用户重新登录。'
              : '搜索平台用户并管理账号状态。'}
          </p>
        </div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>
      </div>

      <div className="management-toolbar">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索 UID、账号或昵称"
          value={keyword}
          onChange={(event) => { setKeyword(event.target.value); setPage(1) }}
        />
        <Select
          allowClear
          placeholder="账号状态"
          value={state}
          onChange={(value) => { setState(value); setPage(1) }}
          options={[
            { value: 0, label: '正常' },
            { value: 1, label: '封禁中' },
            { value: 2, label: '已注销' },
          ]}
        />
        <Select
          allowClear={!isRolePage}
          placeholder="用户角色"
          value={role}
          onChange={(value) => { setRole(value); setPage(1) }}
          options={roleLabels.map((label, value) => ({ value, label }))}
        />
        <Button onClick={resetFilters}>重置</Button>
        <span>共 {total} 位用户</span>
      </div>

      <Table<AdminUser>
        rowKey="uid"
        loading={loading}
        dataSource={items}
        scroll={{ x: 980 }}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          showSizeChanger: false,
          onChange: setPage,
        }}
        columns={[
          { title: 'UID', dataIndex: 'uid', width: 90 },
          {
            title: '用户',
            key: 'user',
            width: 230,
            render: (_, user) => (
              <span className="review-user">
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                <span className="table-user-copy">
                  <strong>{user.nickname}</strong>
                  <small>@{user.username}</small>
                </span>
              </span>
            ),
          },
          {
            title: '状态',
            dataIndex: 'state',
            width: 100,
            render: (value) => (
              <Tag color={value === 0 ? 'success' : value === 1 ? 'error' : 'default'}>
                {value === 0 ? '正常' : value === 1 ? '封禁中' : '已注销'}
              </Tag>
            ),
          },
          {
            title: '角色',
            dataIndex: 'role',
            width: 150,
            render: (value, user) => isRolePage && value !== 2 ? (
              <Select
                size="small"
                value={value}
                loading={operatingUid === user.uid}
                disabled={user.uid === currentUid}
                onChange={(nextRole) => confirmRoleChange(user, nextRole)}
                options={roleLabels.map((label, roleValue) => ({ value: roleValue, label }))}
              />
            ) : (
              <Tag color={roleColors[value] || 'default'}>{roleLabels[value] || '未知'}</Tag>
            ),
          },
          { title: '注册时间', dataIndex: 'createDate', width: 170 },
          {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 150,
            render: (_, user) => (
              <Space>
                {!isRolePage ? (
                  <Popconfirm
                    title={user.state === 0 ? '确认封禁该用户？' : '确认解除封禁？'}
                    description={user.state === 0 ? '用户会立即退出登录，且无法再次登录。' : undefined}
                    okButtonProps={user.state === 0 ? { danger: true } : undefined}
                    onConfirm={() => changeState(user)}
                    disabled={user.role === 2 || user.uid === currentUid || user.state === 2}
                  >
                    <Button
                      type="link"
                      danger={user.state === 0}
                      icon={user.state === 0 ? <StopOutlined /> : <UserOutlined />}
                      loading={operatingUid === user.uid}
                      disabled={user.role === 2 || user.uid === currentUid || user.state === 2}
                    >
                      {user.state === 0 ? '封禁' : '解封'}
                    </Button>
                  </Popconfirm>
                ) : null}
              </Space>
            ),
          },
        ]}
      />
    </div>
  )
}
