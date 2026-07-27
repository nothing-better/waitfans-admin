import { useCallback, useEffect, useState } from 'react'
import { Button, Input, Popconfirm, Select, Table, Tag, Typography, message } from 'antd'
import { DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { deleteDanmu, getDanmus, type AdminDanmu } from '@/api/management'

function formatTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds || 0))
  return `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`
}

export default function DanmuReview() {
  const [searchText, setSearchText] = useState('')
  const [keyword, setKeyword] = useState('')
  const [vid, setVid] = useState<number | undefined>()
  const [state, setState] = useState<number | undefined>(1)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<AdminDanmu[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getDanmus({
        keyword: keyword || undefined,
        vid,
        state,
        page,
        pageSize: 10,
      })
      setItems(result.items || [])
      setTotal(result.total || 0)
    } finally {
      setLoading(false)
    }
  }, [keyword, page, state, vid])

  useEffect(() => { load() }, [load])

  const remove = async (item: AdminDanmu) => {
    setDeletingId(item.id)
    try {
      await deleteDanmu(item.id)
      message.success('弹幕已删除')
      await load()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="danmu-review-page">
      <div className="admin-page-heading">
        <div><h1>弹幕审核</h1><p>按视频或关键词检索弹幕，处理违规内容。</p></div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>
      </div>
      <div className="management-toolbar">
        <Input.Search
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索弹幕内容"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onSearch={(value) => { setKeyword(value.trim()); setPage(1) }}
        />
        <Input
          allowClear
          inputMode="numeric"
          placeholder="视频 ID"
          value={vid}
          onChange={(event) => {
            setVid(event.target.value ? Number(event.target.value) : undefined)
            setPage(1)
          }}
        />
        <Select
          allowClear
          placeholder="弹幕状态"
          value={state}
          onChange={(value) => { setState(value); setPage(1) }}
          options={[
            { value: 1, label: '正常' },
            { value: 2, label: '举报审核中' },
            { value: 3, label: '已删除' },
          ]}
        />
        <span>共 {total} 条</span>
      </div>
      <Table<AdminDanmu>
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 1040 }}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          showSizeChanger: false,
          onChange: setPage,
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          {
            title: '弹幕内容',
            dataIndex: 'content',
            width: 280,
            render: (content, item) => (
              <Typography.Text className="danmu-content" style={{ color: item.color }}>
                {content}
              </Typography.Text>
            ),
          },
          {
            title: '用户',
            key: 'user',
            width: 150,
            render: (_, item) => <span>{item.nickname}<small className="muted-block">UID {item.uid}</small></span>,
          },
          {
            title: '视频',
            key: 'video',
            width: 220,
            render: (_, item) => <span>{item.videoTitle}<small className="muted-block">VID {item.vid}</small></span>,
          },
          { title: '时间点', dataIndex: 'timePoint', width: 90, render: formatTime },
          { title: '发送时间', dataIndex: 'createDate', width: 170 },
          {
            title: '状态',
            dataIndex: 'state',
            width: 110,
            render: (value) => (
              <Tag color={value === 1 ? 'success' : value === 2 ? 'warning' : 'default'}>
                {value === 1 ? '正常' : value === 2 ? '待复核' : '已删除'}
              </Tag>
            ),
          },
          {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (_, item) => item.state === 3 ? null : (
              <Popconfirm
                title="确认删除该弹幕？"
                okButtonProps={{ danger: true }}
                onConfirm={() => remove(item)}
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deletingId === item.id}
                >
                  删除
                </Button>
              </Popconfirm>
            ),
          },
        ]}
      />
    </div>
  )
}
