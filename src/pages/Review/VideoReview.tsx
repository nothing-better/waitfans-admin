import { useCallback, useEffect, useState } from 'react'
import { Avatar, Button, Image, Segmented, Table, Tag } from 'antd'
import { EyeOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getReviewTotal, getReviewVideos, type ReviewVideo } from '@/api/review'

const statusOptions = [
  { label: '正在审核', value: 0 },
  { label: '审核通过', value: 1 },
  { label: '打回整改', value: 2 },
  { label: '违规封禁', value: 3 },
]

const statusTags = [
  ['processing', '正在审核'],
  ['success', '审核通过'],
  ['warning', '打回整改'],
  ['error', '违规封禁'],
] as const

export default function VideoReview() {
  const navigate = useNavigate()
  const [status, setStatus] = useState(0)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [videos, setVideos] = useState<ReviewVideo[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [nextTotal, nextVideos] = await Promise.all([
        getReviewTotal(status),
        getReviewVideos(status, page),
      ])
      setTotal(nextTotal || 0)
      setVideos(nextVideos || [])
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="admin-page-heading">
        <div><h1>视频审核</h1><p>查看投稿信息并给出审核结论。</p></div>
        <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
      </div>
      <div className="review-toolbar">
        <Segmented
          value={status}
          options={statusOptions}
          onChange={(value) => { setStatus(Number(value)); setPage(1) }}
        />
        <span>共 {total} 条</span>
      </div>
      <Table<ReviewVideo>
        rowKey={(item) => item.video.vid}
        loading={loading}
        dataSource={videos}
        scroll={{ x: 820 }}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          showSizeChanger: false,
          onChange: setPage,
        }}
        columns={[
          { title: 'ID', dataIndex: ['video', 'vid'], width: 90, render: (value) => `# ${value}` },
          {
            title: '封面',
            dataIndex: ['video', 'coverUrl'],
            width: 130,
            render: (value) => <Image width={104} height={59} src={value} className="review-cover" />,
          },
          { title: '标题', dataIndex: ['video', 'title'], ellipsis: true },
          {
            title: '投稿人',
            dataIndex: 'user',
            width: 180,
            render: (user) => (
              <span className="review-user">
                <Avatar size="small" src={user.avatar_url} icon={<UserOutlined />} />
                {user.nickname}
              </span>
            ),
          },
          { title: '投稿时间', dataIndex: ['video', 'uploadDate'], width: 170 },
          {
            title: '状态',
            dataIndex: ['video', 'status'],
            width: 120,
            render: (value) => <Tag color={statusTags[value]?.[0]}>{statusTags[value]?.[1] || '未知'}</Tag>,
          },
          {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 110,
            render: (_, item) => (
              <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/review/video/detail/${item.video.vid}`)}>
                查看
              </Button>
            ),
          },
        ]}
      />
    </div>
  )
}
