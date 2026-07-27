import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Col, Row, Statistic, Table, Tag } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  ReloadOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getOverview, type AdminOverview } from '@/api/management'

const statusTags = [
  ['processing', '待审核'],
  ['success', '已通过'],
  ['warning', '已打回'],
  ['error', '已封禁'],
] as const

export default function Dashboard() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setOverview(await getOverview())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const counts = overview?.counts

  const cards = [
    ['待审核视频', counts?.pendingVideos || 0, <ClockCircleOutlined key="pending" />, '#faad14'],
    ['全部视频', counts?.videos || 0, <VideoCameraOutlined key="videos" />, '#1677ff'],
    ['有效评论', counts?.comments || 0, <CommentOutlined key="comments" />, '#722ed1'],
    ['平台用户', counts?.users || 0, <TeamOutlined key="users" />, '#13c2c2'],
  ] as const

  return (
    <div className="dashboard-page">
      <div className="admin-page-heading">
        <div><h1>工作台</h1><p>掌握平台状态，快速处理待办内容。</p></div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新数据</Button>
      </div>
      <Row gutter={[18, 18]}>
        {cards.map(([title, value, icon, color]) => (
          <Col xs={24} sm={12} xl={6} key={title}>
            <Card className="metric-card">
              <Statistic title={title} value={value} prefix={icon} valueStyle={{ color }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[18, 18]} className="dashboard-sections">
        <Col xs={24} xl={16}>
          <Card
            className="dashboard-table"
            title="最新投稿"
            extra={<Button type="link" onClick={() => navigate('/review/video/form')}>进入审核</Button>}
          >
            <Table
              loading={loading}
              pagination={false}
              rowKey="vid"
              dataSource={overview?.recentVideos || []}
              columns={[
                { title: '视频', dataIndex: 'title', ellipsis: true },
                { title: '投稿人', dataIndex: 'nickname', width: 140 },
                { title: '投稿时间', dataIndex: 'uploadDate', width: 170 },
                {
                  title: '状态',
                  dataIndex: 'status',
                  width: 100,
                  render: (status: number) => (
                    <Tag color={statusTags[status]?.[0]}>{statusTags[status]?.[1] || '未知'}</Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card className="dashboard-table" title="快捷操作">
            <div className="dashboard-actions">
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => navigate('/review/video/form')}>
                处理视频审核
              </Button>
              <Button icon={<CommentOutlined />} onClick={() => navigate('/review/comment')}>
                清理违规评论
              </Button>
              <Button icon={<TeamOutlined />} onClick={() => navigate('/system/user')}>
                管理用户状态
              </Button>
            </div>
            <div className="dashboard-health">
              <span>平台状态</span>
              <Tag color="success">运行正常</Tag>
            </div>
          </Card>
        </Col>
      </Row>
      <Card className="dashboard-table" title="审核流程">
        <Table
          pagination={false}
          rowKey="name"
          dataSource={[
            { name: '内容提交', owner: '创作者', state: '自动入库', status: 'processing' },
            {
              name: '视频审核',
              owner: '审核员',
              state: `${counts?.pendingVideos || 0} 项待处理`,
              status: counts?.pendingVideos ? 'warning' : 'success',
            },
            { name: '结果通知', owner: '系统', state: '实时推送', status: 'success' },
          ]}
          columns={[
            { title: '环节', dataIndex: 'name' },
            { title: '负责人', dataIndex: 'owner' },
            { title: '当前状态', dataIndex: 'state' },
            { title: '状态', dataIndex: 'status', render: (status) => <Tag color={status}>{status === 'success' ? '正常' : status === 'warning' ? '待处理' : '运行中'}</Tag> },
          ]}
        />
      </Card>
    </div>
  )
}
