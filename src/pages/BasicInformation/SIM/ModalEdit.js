import React from 'react'
import { Modal, Input, Form, Radio, message } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import { SERVERDFWL } from 'configs/service'

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
      axios
        .post(
          '/finance/institution/' + mode,
          { ...fields },
          { baseURL: SERVERDFWL }
        )
        .then(res => {
          setLoading(false)
          if (!checkres(res)) return
          message.success(`${mode === 'add' ? '新增' : '修改'}成功`)
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
          name="name"
          label="SIM卡号"
          rules={[{ required: true, message: 'SIM卡号为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="code"
          label="ICCID"
          rules={[{ required: false, message: 'ICCID为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="status"
          label="SIM卡状态"
          rules={[{ required: false, message: '' }]}
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
