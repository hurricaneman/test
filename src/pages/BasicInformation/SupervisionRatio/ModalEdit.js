import React from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Modal, Input, Radio, message, Select } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import TableSelect from 'components/TableSelect'
import { SERVERDFWL } from 'configs/service'

const { Option } = Select

function ModalEdit(props) {
  const {
    visible,
    onCancel,
    onOk,
    mode,
    record,
    form,
    form: { getFieldDecorator: f },
    organizationType,
    url,
    columns,
    searchForm,
    scrollX,
  } = props
  const [loading, setLoading] = React.useState()
  const [flag, setFlag] = React.useState(false)
  const [flag2, setFlag2] = React.useState(false)
  const tableSeletRef = React.useRef()
  React.useEffect(() => {
    if (!visible) return
    if (mode === 'add') {
      form.resetFields()
      setFlag(false)
      setFlag2(false)
    }
    if (mode === 'update') {
      form.setFieldsValue({
        moveRatio: record.moveRatio,
        moveAmount: record.moveAmount,
        moveRule: record.moveRule,
        status: record.status,
        dealerId: {
          name: record.dealerName,
          value: record.dealerId,
        },
      })
      setFlagFun(record.moveRule)
    }
  }, [visible])

  function setFlagFun(v) {
    if (v === 1) {
      setFlag(false)
      setFlag2(true)
    } else {
      setFlag(true)
      setFlag2(false)
    }
  }

  function onSubmit() {
    form.validateFields(async (err, fields) => {
      if (err) return
      setLoading(true)
      if (mode === 'update') {
        fields.id = record.id
      }
      fields.dealerId = fields.dealerId.value
      await axios
        .post(
          '/regulatory/ratio/' + mode,
          { ...fields },
          {
            baseURL: SERVERDFWL,
          }
        )
        .then(res => {
          setLoading(false)
          if (!checkres(res)) return
          if (res.data.code === 1) {
            message.success(res.data.msg)
            onOk()
            tableSeletRef.current.clean()
          } else {
            message.error(res.data.msg)
          }
        })
    })
  }

  return (
    <Modal
      visible={visible}
      title={mode === 'add' ? '新增' : '修改'}
      onCancel={onCancel}
      okText="确认"
      cancelText="取消"
      onOk={onSubmit}
      confirmLoading={loading}
    >
      <Form
        layout="horizontal"
        wrapperCol={{ span: 16 }}
        labelCol={{ span: 8 }}
        className="LowSmallForm"
      >
        <Form.Item label="经销商名称">
          {f('dealerId', {
            rules: [
              {
                required: true,
                message: '经销商名称必填',
              },
            ],
          })(
            <TableSelect
              scrollX={scrollX}
              ref={tableSeletRef}
              mode={mode}
              url={url}
              params={{ organizationType }}
              columns={columns}
              searchForm={searchForm}
            ></TableSelect>
          )}
        </Form.Item>
        <Form.Item label="移动比">
          {f('moveRatio', {
            rules: [
              {
                required: flag,
                message: '移动比必填',
              },
              {
                pattern: /^0\.[0-9]{1,2}$|^0{1}$|^1{1}$|^1\.[0]{1,2}$/,
                message: '请输入0到1中的两位小数内的小数',
              },
            ],
          })(<Input></Input>)}
        </Form.Item>
        <Form.Item label="移动额度（万元）">
          {f('moveAmount', {
            rules: [
              {
                required: flag2,
                message: '移动额度必填',
              },
              { pattern: /^[0-9]{1,8}$/, message: '请输入8位以内的数字' },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        <Form.Item label="移动规则">
          {f('moveRule', {
            rules: [
              {
                required: true,
                message: '移动规则必填',
              },
            ],
          })(
            <Select
              onChange={v => {
                setFlagFun(v)
              }}
            >
              <Option key={0} value={0}>
                按台数移动比
              </Option>
              <Option key={1} value={1}>
                按固定额度
              </Option>
              <Option key={2} value={2}>
                按额度移动比
              </Option>
            </Select>
          )}
        </Form.Item>
        <Form.Item label="有效标志">
          {f('status', {
            rules: [
              {
                required: true,
                message: '有效标志必填',
              },
            ],
            initialValue: 1,
          })(
            <Radio.Group>
              <Radio value={0}>无效</Radio>
              <Radio value={1}>有效</Radio>
            </Radio.Group>
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Form.create()(ModalEdit)
