import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Table, Tag } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { getReviewTotal } from '@/api/review'

export default function Dashboard() {
  const [totals, setTotals] = useState([0, 0, 0, 0])

  useEffect(() => {
    Promise.all([0, 1, 2, 3].map((status) => getReviewTotal(status).catch(() => 0))).then(setTotals)
  }, [])

  const cards = [
    ['待审核视频', totals[0], <ClockCircleOutlined key="pending" />, '#faad14'],
    ['审核通过', totals[1], <CheckCircleOutlined key="passed" />, '#52c41a'],
    ['打回整改', totals[2], <CloseCircleOutlined key="rejected" />, '#ff7a45'],
    ['全部视频', totals.reduce((sum, value) => sum + value, 0), <VideoCameraOutlined key="all" />, '#1677ff'],
  ] as const

  return (
    <div className="dashboard-page">
      <div className="admin-page-heading">
        <div><h1>工作台</h1><p>欢迎回来，下面是当前内容审核概况。</p></div>
        <Tag color="processing">系统运行正常</Tag>
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
      <Card className="dashboard-table" title="审核流程">
        <Table
          pagination={false}
          rowKey="name"
          dataSource={[
            { name: '内容提交', owner: '创作者', state: '自动入库', status: 'processing' },
            { name: '视频审核', owner: '审核员', state: `${totals[0]} 项待处理`, status: totals[0] ? 'warning' : 'success' },
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
