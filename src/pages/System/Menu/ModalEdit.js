import React from 'react'
import { Modal, Input, Select, Form, message } from 'antd'
import axios from 'axios'
import SelectMenu from 'components/Select/SelectMenu'
import PickIcons from 'components/PickIcons'

export default function ModalEdit(props) {
  const { visible, onCancel, onOk, mode, record, ...restProps } = props

  const [form] = Form.useForm()

  const [loading, setLoading] = React.useState()
  const [status, setStatus] = React.useState(0)

  React.useEffect(() => {
    if (!visible) {
      form.resetFields()
      setStatus(0)
    }
    if (visible && mode === 'update') {
      setStatus(record.type)
      form.setFieldsValue({
        parentId: record.parentId,
        name: record.name,
        icon: record.icon,
        type: record.type,
        orderNum: record.orderNum,
        perms: record.perms,
      })
      if (record.type === 1) form.setFieldsValue({ url: record.url })
      if (record.type === 2) form.setFieldsValue({ buttonId: record.buttonId })
    }
  }, [visible])

  function onSubmit() {
    form.validateFields().then(fields => {
      setLoading(true)
      if (mode === 'update') {
        fields.menuId = record.menuId
      }
      axios.post('/menu/' + mode, { ...fields }).then(({ data: res }) => {
        setLoading(false)
        if (res.code === 1) {
          message.success(`${mode === 'update' ? '修改' : '新增'}菜单成功`)
          onOk()
        } else {
          message.error(res.msg)
        }
      })
    })
  }

  return (
    <Modal
      visible={visible}
      title={mode === 'add' ? '新增' : '修改'}
      onCancel={onCancel}
      onOk={onSubmit}
      confirmLoading={loading}
      // destroyOnClose
      maskClosable={false}
      // forceRender
      {...restProps}
    >
      <Form
        form={form}
        layout="horizontal"
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
        initialValues={{ type: 0 }}
      >
        <Form.Item
          name="parentId"
          label="上级菜单"
          rules={[{ required: true, message: '上级菜单必填' }]}
        >
          <SelectMenu></SelectMenu>
        </Form.Item>
        <Form.Item
          name="name"
          label="显示名称"
          rules={[{ required: true, message: '显示名称必填' }]}
        >
          <Input type="text" maxLength="50"></Input>
        </Form.Item>
        <Form.Item name="icon" label="图标">
          <PickIcons></PickIcons>
        </Form.Item>
        <Form.Item
          name="type"
          label="类型"
          rules={[{ required: true, message: '类型必填' }]}
        >
          <Select onChange={v => setStatus(v)}>
            <Select.Option value={0}>目录</Select.Option>
            <Select.Option value={1}>菜单</Select.Option>
            <Select.Option value={2}>按钮</Select.Option>
            <Select.Option value={3}>其他</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="orderNum"
          label="排序"
          rules={[{ pattern: /^[0-9]*$/, message: '必须输入数字' }]}
        >
          <Input type="text" maxLength="5"></Input>
        </Form.Item>
        {status === 1 && (
          <Form.Item
            name="url"
            label="路由"
            rules={[{ required: true, message: '路由必填' }]}
          >
            <Input type="text" maxLength="50"></Input>
          </Form.Item>
        )}
        {status === 2 && (
          <Form.Item
            name="buttonId"
            label="按钮标识"
            rules={[{ required: true, message: '按钮标识必填' }]}
          >
            <Input type="text" maxLength="50"></Input>
          </Form.Item>
        )}
        <Form.Item name="perms" label="授权标识">
          <Input type="text" maxLength="50"></Input>
        </Form.Item>
      </Form>
    </Modal>
  )
}
