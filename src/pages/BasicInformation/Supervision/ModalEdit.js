import React from 'react'
import { Modal, Input, Form, Radio } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'

export default function ModalEdit(props) {
  const { visible, onCancel, onOk, mode, record } = props
  const [loading, setLoading] = React.useState()
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (!visible) return
    switch (mode) {
      case 'add':
        {
          form.resetFields()
        }
        break
      case 'update':
        {
          form.setFieldsValue({
            ...record,
          })
        }
        break
    }
  }, [visible])

  function onSubmit() {
    form.validateFields().then(fields => {
      setLoading(true)
      if (mode === 'update') fields.id = record.id
      axios.post('/edition/' + mode, { ...fields }).then(res => {
        setLoading(false)
        if (!checkres(res)) return
        onCancel()
        onOk()
      })
    })
  }

  return (
    <Modal
      visible={visible}
      title={mode === 'add' ? '新增' : '修改'}
      onCancel={onCancel}
      onOk={onSubmit}
      maskClosable={false}
      confirmLoading={loading}
    >
      <Form
        form={form}
        wrapperCol={{ span: 18 }}
        labelCol={{ span: 6 }}
        initialValues={{
          status: 1,
        }}
      >
        <Form.Item
          name="appName"
          label="监管机构代码"
          rules={[{ required: true, message: '监管机构代码为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="appfileName"
          label="监管机构名称"
          rules={[{ required: true, message: '监管机构名称为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="editionName"
          label="单位简称"
          rules={[{ required: true, message: '单位简称为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="versionNumber"
          label="负责人"
          rules={[
            { required: true, message: '负责人为必填' },
            // { pattern: /^[0-9]{1,8}$/, message: '请输入8位以内的数字' },
          ]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="telNum"
          label="办公电话"
          rules={[{ required: true, message: '办公电话为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="phone"
          label="手机号"
          rules={[{ required: false, message: '手机号为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="address"
          label="联系地址"
          rules={[{ required: false, message: '联系地址为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="status"
          label="是否启用"
          rules={[{ required: true, message: '是否启用为必填' }]}
        >
          <Radio.Group>
            <Radio value={1}>启用</Radio>
            <Radio value={0}>停用</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  )
}
