import React from 'react'
import { Form, Icon as LegacyIcon } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Modal, Input, Radio, message, TreeSelect, Select } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
const { Option } = Select

const { TreeNode } = TreeSelect
function ModalEdit(props) {
  const {
    visible,
    onCancel,
    onOk,
    mode,
    record,
    form,
    form: { getFieldDecorator: f },
    dutiesSelectOption,
  } = props
  const [loading, setLoading] = React.useState()
  const [treeData, setTreeData] = React.useState([])
  const [roleData, setRoleData] = React.useState([])
  React.useEffect(() => {
    if (!visible) {
      form.resetFields()
      return
    }
    if (visible && mode === 'update') {
      form.setFieldsValue({
        username: record.username,
        deptId: record.deptId,
        realname: record.realname,
        sex: record.sex,
        email: record.email,
        // mobile: record.mobile,
        status: record.status,
        roleIdList: record.roleIdList,
        duties: record.duties,
      })
    }
  }, [visible])

  React.useEffect(() => {
    axios.post('/dept/tree', {}).then(res => {
      if (!checkres(res)) return
      if (res.data.code === 1) {
        setTreeData(res.data.data)
      } else {
        message.error(res.data.msg)
      }
    })
    axios.post('/role/getDeptRole', {}).then(res => {
      if (!checkres(res)) return
      if (res.data.code === 1) {
        setRoleData(res.data.data)
      } else {
        message.error(res.data.msg)
      }
    })
  }, [])

  function onSubmit() {
    form.validateFields(async (err, fields) => {
      if (err) return
      setLoading(true)
      if (mode === 'update') {
        fields.userId = record.userId
      }
      fields.mobile = fields.username
      await axios.post('/user/' + mode, { ...fields }).then(res => {
        setLoading(false)
        if (!checkres(res)) return
        if (res.data.code === 1) {
          message.success(res.data.msg)
          onOk()
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

  // allcheck:所有节点都有checkbox
  const loop = (data, FaIcon, chIcon, allcheck, isDept) =>
    data.map(item => {
      if (item.children && item.children.length) {
        return (
          <TreeNode
            key={
              isDept
                ? item.children === null
                  ? item.key
                  : isDept + item.key
                : item.key
            }
            title={
              <>
                <LegacyIcon style={{ marginRight: 5 }} type={FaIcon} />
                {item.title}
              </>
            }
            value={
              isDept
                ? item.children === null
                  ? item.value
                  : isDept + item.value
                : item.value
            }
            checkable={allcheck ? true : false}
            selectable={allcheck ? true : false}
          >
            {loop(item.children, FaIcon, chIcon, allcheck, isDept)}
          </TreeNode>
        )
      }
      return (
        <TreeNode
          key={
            isDept
              ? item.children === null
                ? item.key
                : isDept + item.key
              : item.key
          }
          title={
            <>
              <LegacyIcon
                style={{ marginRight: 5 }}
                type={item.children === null ? chIcon : FaIcon}
              />
              {item.title}
            </>
          }
          value={
            isDept
              ? item.children === null
                ? item.value
                : isDept + item.value
              : item.value
          }
          checkable={allcheck ? true : item.children === null ? true : false}
          selectable={allcheck ? true : item.children === null ? true : false}
        />
      )
    })

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
        <Form.Item label="所属部门">
          {f('deptId', {
            rules: [
              {
                required: true,
                message: '所属部门必填',
              },
            ],
          })(
            <TreeSelect treeCheckable={false}>
              {loop(treeData, 'apartment', 'apartment', true, null)}
            </TreeSelect>
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
          })(
            <Select>
              {dutiesSelectOption.map(v => (
                <Option key={v.id} value={v.id}>
                  {v.dutiesName}
                </Option>
              ))}
            </Select>
          )}
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
            <TreeSelect allowClear multiple treeCheckable={true}>
              {loop(roleData, 'apartment', 'team', false, 'deptId')}
            </TreeSelect>
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
