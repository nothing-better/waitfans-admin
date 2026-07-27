import { useCallback, useEffect, useState } from 'react'
import { Button, Form, Input, Modal, Space, Table, Tag, message } from 'antd'
import { EditOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import {
  getCategories,
  updateCategory,
  type AdminCategory,
} from '@/api/management'

export default function TagManagement() {
  const [form] = Form.useForm<AdminCategory>()
  const [items, setItems] = useState<AdminCategory[]>([])
  const [filteredItems, setFilteredItems] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = (await getCategories()) || []
      setItems(result)
      setFilteredItems(result)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filter = (value: string) => {
    const normalized = value.trim().toLowerCase()
    setFilteredItems(normalized
      ? items.filter((item) => [
          item.mcId,
          item.scId,
          item.mcName,
          item.scName,
          item.rcmTag,
        ].some((field) => field?.toLowerCase().includes(normalized)))
      : items)
  }

  const edit = (item: AdminCategory) => {
    form.setFieldsValue(item)
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      await updateCategory(values)
      message.success('分区信息已更新')
      setOpen(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="tag-management-page">
      <div className="admin-page-heading">
        <div><h1>分区与标签</h1><p>维护投稿分区说明和用户投稿时的推荐标签。</p></div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={load}>刷新</Button>
      </div>
      <div className="management-toolbar management-toolbar--search-only">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索分区或推荐标签"
          onChange={(event) => filter(event.target.value)}
        />
        <span>共 {filteredItems.length} 个子分区</span>
      </div>
      <Table<AdminCategory>
        rowKey={(item) => `${item.mcId}:${item.scId}`}
        loading={loading}
        dataSource={filteredItems}
        scroll={{ x: 980 }}
        pagination={{ pageSize: 15, showSizeChanger: false }}
        columns={[
          {
            title: '主分区',
            key: 'main',
            width: 170,
            render: (_, item) => <span>{item.mcName}<small className="muted-block">{item.mcId}</small></span>,
          },
          {
            title: '子分区',
            key: 'sub',
            width: 190,
            render: (_, item) => <span>{item.scName}<small className="muted-block">{item.scId}</small></span>,
          },
          { title: '分区说明', dataIndex: 'descr', ellipsis: true },
          {
            title: '推荐标签',
            dataIndex: 'rcmTag',
            width: 280,
            render: (value: string) => (
              <Space size={[4, 4]} wrap>
                {(value || '').split(/\r?\n/).filter(Boolean).slice(0, 5).map((tag) => <Tag key={tag}>{tag}</Tag>)}
              </Space>
            ),
          },
          {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (_, item) => (
              <Button type="link" icon={<EditOutlined />} onClick={() => edit(item)}>编辑</Button>
            ),
          },
        ]}
      />

      <Modal
        title="编辑分区信息"
        open={open}
        width={680}
        confirmLoading={saving}
        onOk={save}
        onCancel={() => setOpen(false)}
        forceRender
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="mcId" hidden><Input /></Form.Item>
          <Form.Item name="scId" hidden><Input /></Form.Item>
          <div className="form-grid">
            <Form.Item
              name="mcName"
              label="主分区名称"
              rules={[{ required: true, message: '请输入主分区名称' }]}
            >
              <Input maxLength={20} />
            </Form.Item>
            <Form.Item
              name="scName"
              label="子分区名称"
              rules={[{ required: true, message: '请输入子分区名称' }]}
            >
              <Input maxLength={20} />
            </Form.Item>
          </div>
          <Form.Item name="descr" label="分区说明">
            <Input.TextArea rows={4} maxLength={500} showCount />
          </Form.Item>
          <Form.Item name="rcmTag" label="推荐标签" extra="每行填写一个标签">
            <Input.TextArea rows={6} placeholder={'动画\n新番\n二次元'} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
