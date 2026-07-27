import { useCallback, useEffect, useState } from 'react'
import { Button, Input, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd'
import { DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { deleteComment, getComments, type AdminComment } from '@/api/management'

export default function CommentReview() {
  const [searchText, setSearchText] = useState('')
  const [keyword, setKeyword] = useState('')
  const [vid, setVid] = useState<number | undefined>()
  const [deleted, setDeleted] = useState<number | undefined>(0)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<AdminComment[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getComments({
        keyword: keyword || undefined,
        vid,
        deleted,
        page,
        pageSize: 10,
      })
      setItems(result.items || [])
      setTotal(result.total || 0)
    } finally {
      setLoading(false)
    }
  }, [deleted, keyword, page, vid])

  useEffect(() => { load() }, [load])

  const remove = async (item: AdminComment) => {
    setDeletingId(item.id)
    try {
      await deleteComment(item.id)
      message.success('评论已删除')
      await load()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="comment-review-page">
      <div className="admin-page-heading">
        <div><h1>评论审核</h1><p>检索平台评论并清理违规内容。</p></div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>
      </div>
      <div className="management-toolbar">
        <Input.Search
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索评论内容"
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
          placeholder="内容状态"
          value={deleted}
          onChange={(value) => { setDeleted(value); setPage(1) }}
          options={[
            { value: 0, label: '正常评论' },
            { value: 1, label: '已删除' },
          ]}
        />
        <span>共 {total} 条</span>
      </div>
      <Table<AdminComment>
        rowKey="id"
        loading={loading}
        dataSource={items}
        scroll={{ x: 1080 }}
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
            title: '评论内容',
            dataIndex: 'content',
            width: 340,
            render: (content) => (
              <Typography.Paragraph className="content-cell" ellipsis={{ rows: 2, expandable: true }}>
                {content}
              </Typography.Paragraph>
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
          {
            title: '互动',
            key: 'stats',
            width: 120,
            render: (_, item) => <Space size={4}><Tag>赞 {item.love}</Tag><Tag>踩 {item.bad}</Tag></Space>,
          },
          { title: '发布时间', dataIndex: 'createTime', width: 170 },
          {
            title: '状态',
            dataIndex: 'isDeleted',
            width: 90,
            render: (value) => <Tag color={value ? 'default' : 'success'}>{value ? '已删除' : '正常'}</Tag>,
          },
          {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (_, item) => item.isDeleted ? null : (
              <Popconfirm
                title="确认删除该评论？"
                description={item.rootId === 0 ? '根评论的回复也会一并从评论区移除。' : undefined}
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
