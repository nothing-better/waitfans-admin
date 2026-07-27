import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Col, Progress, Row, Statistic, Table, Tag } from 'antd'
import {
  BarChartOutlined,
  CommentOutlined,
  ReloadOutlined,
  TeamOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { getOverview, type AdminOverview } from '@/api/management'

export default function DataCenter() {
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await getOverview())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const trendMaximum = useMemo(
    () => Math.max(1, ...(data?.trend || []).map((item) => item.users + item.videos)),
    [data?.trend],
  )
  const categoryMaximum = useMemo(
    () => Math.max(1, ...(data?.categoryDistribution || []).map((item) => Number(item.value))),
    [data?.categoryDistribution],
  )

  return (
    <div className="data-center-page">
      <div className="admin-page-heading">
        <div><h1>数据中心</h1><p>查看平台规模、内容增长和分区分布。</p></div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>
      </div>
      <Row gutter={[18, 18]}>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="平台用户" value={data?.counts.users || 0} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="视频总量" value={data?.counts.videos || 0} prefix={<VideoCameraOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="有效评论" value={data?.counts.comments || 0} prefix={<CommentOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card className="metric-card">
            <Statistic title="有效弹幕" value={data?.counts.danmus || 0} prefix={<BarChartOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[18, 18]} className="dashboard-sections">
        <Col xs={24} xl={14}>
          <Card className="dashboard-table" title="近 7 日内容增长">
            <div className="trend-chart" aria-label="近 7 日新增用户和视频趋势">
              {(data?.trend || []).map((item) => (
                <div className="trend-chart__item" key={item.date}>
                  <div className="trend-chart__bars">
                    <span
                      className="trend-chart__bar trend-chart__bar--users"
                      style={{ height: `${Math.max(4, (item.users / trendMaximum) * 150)}px` }}
                      title={`新增用户 ${item.users}`}
                    />
                    <span
                      className="trend-chart__bar trend-chart__bar--videos"
                      style={{ height: `${Math.max(4, (item.videos / trendMaximum) * 150)}px` }}
                      title={`新增视频 ${item.videos}`}
                    />
                  </div>
                  <strong>{item.users + item.videos}</strong>
                  <small>{item.label}</small>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span><i className="legend-users" />新增用户</span>
              <span><i className="legend-videos" />新增视频</span>
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="dashboard-table" title="热门分区">
            <div className="category-distribution">
              {(data?.categoryDistribution || []).map((item) => (
                <div key={item.name}>
                  <span>{item.name}</span>
                  <Progress
                    percent={Math.round((Number(item.value) / categoryMaximum) * 100)}
                    format={() => String(item.value)}
                    strokeColor="#fb7299"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="dashboard-table" title="视频状态分布">
        <Table
          loading={loading}
          pagination={false}
          rowKey="status"
          dataSource={[
            { status: 0, name: '待审核', count: data?.videoStatus['0'] || 0, color: 'processing' },
            { status: 1, name: '审核通过', count: data?.videoStatus['1'] || 0, color: 'success' },
            { status: 2, name: '打回整改', count: data?.videoStatus['2'] || 0, color: 'warning' },
            { status: 3, name: '违规封禁', count: data?.videoStatus['3'] || 0, color: 'error' },
          ]}
          columns={[
            { title: '状态', dataIndex: 'name', render: (name, item) => <Tag color={item.color}>{name}</Tag> },
            { title: '数量', dataIndex: 'count' },
            {
              title: '占比',
              dataIndex: 'count',
              render: (count) => {
                const total = data?.counts.videos || 0
                return total ? `${((count / total) * 100).toFixed(1)}%` : '0%'
              },
            },
          ]}
        />
      </Card>
    </div>
  )
}
