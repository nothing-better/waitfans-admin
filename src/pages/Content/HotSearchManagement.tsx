import { useCallback, useEffect, useState } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  getHotSearch,
  removeHotSearch,
  updateHotSearch,
  type HotSearchItem,
} from '@/api/management'

interface HotSearchForm {
  keyword: string
  score: number
}

export default function HotSearchManagement() {
  const [form] = Form.useForm<HotSearchForm>()
  const [items, setItems] = useState<HotSearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems((await getHotSearch()) || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const showEditor = (item?: HotSearchItem) => {
    setEditingKeyword(item?.content || null)
    form.setFieldsValue({ keyword: item?.content || '', score: item?.score ?? 1 })
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editingKeyword && editingKeyword !== values.keyword.trim()) {
        await removeHotSearch(editingKeyword)
      }
      setItems(await updateHotSearch(values.keyword.trim(), values.score))
      message.success('热搜词已保存')
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (keyword: string) => {
    setItems(await removeHotSearch(keyword))
    message.success('热搜词已移除')
  }

  return (
    <div className="hot-search-page">
      <div className="admin-page-heading">
        <div><h1>热搜管理</h1><p>调整搜索词热度，结果会实时反映到用户端热搜列表。</p></div>
        <Space>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showEditor()}>添加热搜</Button>
        </Space>
      </div>

      <Table<HotSearchItem>
        rowKey="content"
        loading={loading}
        dataSource={items}
        pagination={false}
        columns={[
          {
            title: '排名',
            key: 'rank',
            width: 90,
            render: (_, __, index) => <strong className={index < 3 ? 'hot-rank' : ''}>#{index + 1}</strong>,
          },
          { title: '搜索词', dataIndex: 'content' },
          { title: '热度', dataIndex: 'score', width: 140 },
          {
            title: '标记',
            dataIndex: 'type',
            width: 110,
            render: (value) => value === 2
              ? <Tag color="error">热</Tag>
              : value === 1
                ? <Tag color="processing">新</Tag>
                : <Tag>普通</Tag>,
          },
          {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_, item) => (
              <Space>
                <Button type="link" icon={<EditOutlined />} onClick={() => showEditor(item)}>编辑</Button>
                <Popconfirm
                  title="确认移除该热搜词？"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => remove(item.content)}
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>移除</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={editingKeyword ? '编辑热搜词' : '添加热搜词'}
        open={open}
        confirmLoading={saving}
        onOk={save}
        onCancel={() => setOpen(false)}
        forceRender
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="keyword"
            label="搜索词"
            rules={[
              { required: true, whitespace: true, message: '请输入搜索词' },
              { max: 30, message: '搜索词不能超过 30 个字符' },
            ]}
          >
            <Input placeholder="例如：夏日动画推荐" />
          </Form.Item>
          <Form.Item
            name="score"
            label="热度"
            rules={[{ required: true, message: '请输入热度' }]}
          >
            <InputNumber min={0} precision={0} className="full-width" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
