import { Empty } from 'antd'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/data': '数据中心',
  '/content/carousel': '轮播管理',
  '/content/hot-search': '热搜管理',
  '/content/ranking': '排行管理',
  '/content/tag': '标签管理',
  '/review/article': '专栏审核',
  '/review/avatar': '头像审核',
  '/review/dynamic': '动态审核',
  '/review/comment': '评论审核',
  '/review/danmu': '弹幕审核',
  '/case/report': '举报处理',
  '/case/appeal': '申诉处理',
  '/system/user': '用户管理',
  '/system/role': '角色管理',
}

export default function GenericPage() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || '功能页面'
  return (
    <div className="generic-admin-page">
      <div className="admin-page-heading"><div><h1>{title}</h1><p>该模块已迁入 React 管理端。</p></div></div>
      <div className="generic-admin-empty">
        <Empty description={`${title} 暂无数据`} />
      </div>
    </div>
  )
}
