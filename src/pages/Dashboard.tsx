import { Card, Col, Row, Statistic } from 'antd'
import { UserOutlined, VideoCameraOutlined, EyeOutlined } from '@ant-design/icons'

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">工作台</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="用户总数" value={0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="视频总数" value={0} prefix={<VideoCameraOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="今日访问" value={0} prefix={<EyeOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
