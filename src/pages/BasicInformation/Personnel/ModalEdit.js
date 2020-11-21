import React from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Modal, Input, Radio, message, Select } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import TableSelect from 'components/TableSelect'

const { Option } = Select
let OptionList = []

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
  const [roleData, setRoleData] = React.useState([])
  const tableSeletRef = React.useRef()
  React.useEffect(() => {
    if (!visible) return
    if (mode === 'add') {
      form.resetFields()
      if (organizationType === 'REGULATOR') {
        form.setFieldsValue({
          organizationId: {
            name: '南斗六星',
            value: '1',
          },
        })
      }
    }
    if (mode === 'update') {
      axios
        .get('user/info', {
          params: {
            userId: record.userId,
          },
        })
        .then(res => {
          if (!checkres(res)) return
          const resData = res.data.data
          form.setFieldsValue({
            ...resData,
            organizationId: {
              name: resData.organizationName,
              value: resData.organizationId,
            },
          })
        })
    }
  }, [visible])

  React.useEffect(() => {
    axios.post('role/list', { pageIndex: -1 }).then(res => {
      if (!checkres(res)) return
      if (res.data.code === 1) {
        setRoleData(res.data.data.records)
      } else {
        message.error(res.data.msg)
      }
    })
    if (organizationType === 'FINANCE') {
      OptionList = [
        { id: 2, name: '金融机构人员' },
        { id: 3, name: '信用经理' },
      ]
    } else if (organizationType === 'REGULATOR') {
      OptionList = [
        { id: 4, name: '监管总部人员' },
        { id: 5, name: '带教人员' },
        { id: 6, name: '监管员' },
        { id: 7, name: '普通员工' },
      ]
    } else if (organizationType === 'DEALER') {
      OptionList = [{ id: 7, name: '普通员工' }]
    }
  }, [])

  function onSubmit() {
    form.validateFields(async (err, fields) => {
      if (err) return
      setLoading(true)
      if (mode === 'update') {
        fields.userId = record.userId
      }
      fields.mobile = fields.username
      fields.organizationId = fields.organizationId.value
      await axios
        .post('/user/' + mode, { ...fields, organizationType })
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

  async function judgeUserName(rule, value, callback) {
    if (mode === 'update') {
      if (record.username === value) {
        callback()
      }
    }
    if (value) {
      const res = await axios.get('/user/userNameCheck', {
        params: { userName: value },
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
      title={mode === 'add' ? '新增' : '修改'}
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
        className="LowSmallForm"
      >
        <Form.Item label="手机号">
          {f('username', {
            rules: [
              {
                required: true,
                message: '用户名必填',
              },
              {
                pattern: /^^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/,
                message: '请输入正确的手机号',
              },
              { validator: judgeUserName },
            ],
            validateTrigger: 'onBlur',
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        <Form.Item label="员工姓名">
          {f('realname', {
            rules: [
              {
                required: true,
                message: '员工姓名必填',
              },
              { min: 2, message: '长度必须大于2' },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        <Form.Item label="隶属单位">
          {f('organizationId', {
            rules: [
              {
                required: true,
                message: '隶属单位必填',
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
              disabled={organizationType === 'REGULATOR' ? true : false}
            ></TableSelect>
          )}
        </Form.Item>
        <Form.Item label="个人类型">
          {f('userLevel', {
            rules: [
              {
                required: true,
                message: '个人类型必填',
              },
            ],
          })(
            <Select>
              {OptionList.map(v => (
                <Option key={v.id} value={v.id}>
                  {v.name}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="职务">
          {f('duties', {
            rules: [
              {
                required: true,
                message: '职务必填',
              },
            ],
          })(<Input></Input>)}
        </Form.Item>

        <Form.Item label="性别">
          {f('sex', {
            rules: [
              {
                required: false,
                message: '性别非必填',
              },
            ],
            initialValue: '1',
          })(
            <Radio.Group>
              <Radio value="1">男</Radio>
              <Radio value="2">女</Radio>
              <Radio value="0">保密</Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="邮箱">
          {f('email', {
            rules: [
              {
                required: false,
                message: '邮箱非必填',
              },
              {
                type: 'email',
                message: '请确认邮箱格式',
              },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        {/* <Form.Item label="手机号">
          {f('mobile', {
            rules: [
              {
                required: false,
                message: '手机号非必填',
              },
              {
                pattern: /^^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/,
                message: '请输入正确的手机号',
              },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item> */}
        <Form.Item label="角色配置">
          {f('roleIdList', {
            rules: [
              {
                required: true,
                message: '角色配置必填',
              },
            ],
          })(
            <Select mode="multiple">
              {roleData.map(v => (
                <Option key={v.roleId} value={v.roleId}>
                  {v.roleName}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="状态">
          {f('status', {
            rules: [
              {
                required: false,
                message: '状态非必填',
              },
            ],
            initialValue: 1,
          })(
            <Radio.Group>
              <Radio value={0}>停用</Radio>
              <Radio value={1}>正常</Radio>
            </Radio.Group>
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Form.create()(ModalEdit)
