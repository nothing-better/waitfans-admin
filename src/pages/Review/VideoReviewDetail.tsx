import { useCallback, useEffect, useMemo, useState } from 'react'
import { Avatar, Button, Descriptions, Empty, Modal, Space, Spin, Tag, message } from 'antd'
import { CheckOutlined, CloseOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getReviewVideo, updateReviewStatus, type ReviewVideo } from '@/api/review'
import { getVideoPlaybackUrl } from '@/utils/media'

const statusTags = [
  ['processing', '正在审核'],
  ['success', '审核通过'],
  ['warning', '打回整改'],
  ['error', '违规封禁'],
] as const

export default function VideoReviewDetail() {
  const { vid = '' } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<ReviewVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const tags = useMemo(() => data?.video.tags?.split(/\r?\n/).filter(Boolean) || [], [data])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getReviewVideo(vid))
    } finally {
      setLoading(false)
    }
  }, [vid])

  useEffect(() => { load() }, [load])

  const updateStatus = (status: number) => {
    const action = status === 1 ? '通过' : status === 2 ? '打回整改' : '封禁并删除源文件'
    Modal.confirm({
      title: `确认${action}该视频？`,
      content: status === 3 ? '封禁操作不可逆，请确认内容确实违规。' : undefined,
      okButtonProps: status === 3 ? { danger: true } : undefined,
      onOk: async () => {
        await updateReviewStatus(vid, status)
        message.success(`已${action}`)
        if (status === 3) navigate('/review/video/form')
        else load()
      },
    })
  }

  if (loading) return <div className="admin-detail-loading"><Spin size="large" /></div>
  if (!data) return <Empty description="视频不存在" />

  return (
    <div className="review-detail-page">
      <div className="admin-page-heading">
        <div>
          <Button type="link" onClick={() => navigate('/review/video/form')}>← 返回列表</Button>
          <h1>{data.video.title}</h1>
        </div>
        <Tag color={statusTags[data.video.status]?.[0]}>{statusTags[data.video.status]?.[1]}</Tag>
      </div>
      <div className="review-detail-grid">
        <section>
          <video src={getVideoPlaybackUrl(data.video.vid)} poster={data.video.coverUrl} controls />
          <Space wrap className="review-actions">
            <Button type="primary" icon={<CheckOutlined />} onClick={() => updateStatus(1)}>通过审核</Button>
            <Button icon={<CloseOutlined />} onClick={() => updateStatus(2)}>打回整改</Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => updateStatus(3)}>违规封禁</Button>
          </Space>
        </section>
        <aside>
          <div className="review-author">
            <Avatar size={52} src={data.user.avatar_url} icon={<UserOutlined />} />
            <div><strong>{data.user.nickname}</strong><span>UID {data.user.uid}</span></div>
          </div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="视频 ID">{data.video.vid}</Descriptions.Item>
            <Descriptions.Item label="投稿类型">{data.video.type === 1 ? '自制' : '转载'}</Descriptions.Item>
            <Descriptions.Item label="分区">{data.category?.mcName} / {data.category?.scName}</Descriptions.Item>
            <Descriptions.Item label="投稿时间">{data.video.uploadDate}</Descriptions.Item>
            <Descriptions.Item label="标签">{tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</Descriptions.Item>
            <Descriptions.Item label="简介"><p className="review-description">{data.video.descr || '无'}</p></Descriptions.Item>
          </Descriptions>
        </aside>
      </div>
    </div>
  )
}
