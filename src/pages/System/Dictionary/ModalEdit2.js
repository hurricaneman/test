import React from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Modal, Input, Radio, message } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'

function ModalEdit2(props) {
  const {
    visible,
    dictId,
    onCancel,
    onOk,
    mode,
    record,
    form,
    form: { getFieldDecorator: f },
  } = props
  const [loading, setLoading] = React.useState()
  React.useEffect(() => {
    if (!visible) {
      form.resetFields()
      return
    }
    if (visible && mode === 'update') {
      form.setFieldsValue({
        code: record.code,
        name: record.name,
        status: record.status,
        descrip: record.descrip,
        orderNum: record.orderNum,
      })
    }
  }, [visible])

  function onSubmit() {
    form.validateFields(async (err, fields) => {
      if (err) return
      setLoading(true)
      fields.parentId = dictId
      if (mode === 'update') {
        fields.dictId = record.dictId
      }
      await axios.post('/dict/' + mode, { ...fields }).then(res => {
        setLoading(false)
        if (!checkres(res)) return
        if (res.data.code === 1) {
          message.success(`${mode === 'update' ? '修改' : '新增'}字典详情成功`)
          onOk()
        } else {
          message.error(`${mode === 'update' ? '修改' : '新增'}字典详情失败`)
        }
      })
    })
  }

  async function judgeCode(rule, value, callback) {
    if (mode === 'update') {
      if (record.code === value) {
        callback()
      }
    }
    if (value) {
      const res = await axios.get('/dict/judgeCode', {
        params: { code: value },
      })
      if (res.data.code === 1) {
        callback()
      } else {
        callback(res.data.msg)
      }
    }
  }

  return (
    <Modal
      visible={visible}
      title={mode === 'add' ? '新增字典详情' : '修改字典详情'}
      onCancel={onCancel}
      okText="确认"
      cancelText="取消"
      onOk={onSubmit}
      confirmLoading={loading}
    >
      <Form
        layout="horizontal"
        wrapperCol={{ span: 18 }}
        labelCol={{ span: 6 }}
      >
        <Form.Item label="编码">
          {f('code', {
            rules: [
              {
                required: true,
                message: '编码必填',
              },
              { validator: judgeCode },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        <Form.Item label="名称">
          {f('name', {
            rules: [
              {
                required: true,
                message: '名称必填',
              },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        <Form.Item label="状态">
          {f('status', {
            rules: [
              {
                required: true,
                message: '状态必填',
              },
            ],
          })(
            <Radio.Group>
              <Radio value={0}>禁用</Radio>
              <Radio value={1}>启用</Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="排序">
          {f('orderNum', {
            rules: [
              {
                required: false,
                message: '排序非必填',
              },
              { pattern: /^[0-9]*$/, message: '必须输入数字' },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        <Form.Item label="描述">
          {f('descrip', {
            rules: [
              {
                required: false,
                message: '描述非必填',
              },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Form.create()(ModalEdit2)
