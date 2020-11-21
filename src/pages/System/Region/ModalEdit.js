import React from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Modal, Input, Select, TreeSelect, message } from 'antd'
import axios from 'axios'

function ModalEdit(props) {
  const {
    data,
    treeData,
    visible,
    onCancel,
    onOk,
    mode,
    record,
    form,
    form: { getFieldDecorator: f },
    ...restProps
  } = props

  const [loading, setLoading] = React.useState()
  const [selectLevel, setSelectLevel] = React.useState(undefined)

  React.useEffect(() => {
    if (!visible) {
      form.resetFields()
      setSelectLevel(undefined)
    }
    if (visible && mode === 'update') {
      form.setFieldsValue({
        pid: record.pid,
        name: record.name,
        id: record.id,
        level: record.level,
      })
      setSelectLevel(data.find(v => v.name === record.name).level)
    }
  }, [visible])

  function onSubmit() {
    form.validateFields((err, fields) => {
      if (err) return
      setLoading(true)
      if (mode === 'update') {
        fields.menuId = record.menuId
      }
      axios.post('/region/' + mode, { ...fields }).then(({ data: res }) => {
        setLoading(false)
        if (res.code === 1) {
          message.success(`${mode === 'update' ? '修改' : '新增'}行政区域成功`)
          onOk()
        } else {
          message.error(`${mode === 'update' ? '修改' : '新增'}行政区域失败`)
        }
      })
    })
  }

  async function judgeid(rule, value, callback) {
    if (mode === 'update') {
      if (record.id === value) {
        callback()
      }
    }
    if (value) {
      const res = await axios.get('/region/idCheck', {
        params: { id: value },
      })
      if (res.data.code === 1) {
        callback()
      } else {
        callback(res.data.msg)
      }
    }
  }

  function judgeLevel(rule, value, callback) {
    if (selectLevel <= value || !selectLevel) {
      callback()
    }
    callback('下级区域不得高于上级')
  }

  return (
    <Modal
      visible={visible}
      title={mode === 'add' ? '新增' : '修改'}
      onCancel={onCancel}
      onOk={onSubmit}
      confirmLoading={loading}
      destroyOnClose
      {...restProps}
    >
      <Form
        layout="horizontal"
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
      >
        <Form.Item label="上级区域">
          {f('pid', {
            rules: [{ required: true, message: '上级区域必填' }],
          })(
            <TreeSelect
              treeData={treeData}
              onChange={(value, label, extra) => {
                console.log(123)
                setSelectLevel(extra.allCheckedNodes[0].node.props.level)
              }}
            ></TreeSelect>
          )}
        </Form.Item>
        <Form.Item label="区域名称">
          {f('name', { rules: [{ required: true, message: '区域名称必填' }] })(
            <Input type="text" maxLength="50"></Input>
          )}
        </Form.Item>
        <Form.Item label="区域标识">
          {f('id', {
            rules: [
              { required: true, message: '区域标识必填' },
              { validator: judgeid },
              { pattern: /^[0-9]*$/, message: '必须输入数字' },
            ],
            validateTrigger: 'onBlur',
          })(
            <Input
              type="text"
              disabled={mode === 'update' ? true : false}
            ></Input>
          )}
        </Form.Item>
        <Form.Item label="区域类型">
          {f('level', {
            rules: [
              { required: true, message: '区域类型必填' },
              { validator: judgeLevel },
            ],
          })(
            <Select>
              <Select.Option value={1}>省直辖市</Select.Option>
              <Select.Option value={2}>市</Select.Option>
              <Select.Option value={3}>区县</Select.Option>
            </Select>
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Form.create()(ModalEdit)
