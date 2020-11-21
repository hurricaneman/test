import React from 'react'
import { Modal, Input, Form, message } from 'antd'
import axios from 'axios'
import TreeMenu from 'components/Tree/TreeMenu'
// import TreeDeptSelect from 'components/Tree/TreeDeptSelect'
import { session, changeTheme } from 'utils'
import { useHistory } from 'react-router-dom'

export default function ModalEdit(props) {
  const { visible, onCancel, onOk, mode, record } = props
  // const [type, setType] = React.useState()
  const [loading, setLoading] = React.useState()
  const [form] = Form.useForm()
  let history = useHistory()

  React.useEffect(() => {
    if (!visible) {
      form.resetFields()
      return
    }
    if (visible && mode === 'update') {
      form.setFieldsValue({
        roleName: record.roleName,
        remark: record.remark,
        menuIdList: record.menuIdList,
        dataPermissionType: record.dataPermissionType,
        dataDeptIdList: record.dataDeptIdList,
      })
      // setType(record.dataPermissionType)
    }
  }, [visible])

  function onSubmit() {
    form.validateFields().then(async fields => {
      setLoading(true)
      fields.deptIdList = []
      if (mode === 'update') {
        fields.roleId = record.roleId
      }
      await axios.post('/role/' + mode, { ...fields }).then(({ data: res }) => {
        setLoading(false)
        if (res.code === 1) {
          let num = null
          if (record) {
            num = session.userData.roleIdList.find(v => v === record.roleId)
          }
          if (num && mode === 'update') {
            message.success(
              `${
                mode === 'update' ? '修改' : '新增'
              }角色成功,检测到为当前用户正在使用的角色，请重新登陆获取最新的权限`
            )
            changeTheme()
            axios.post('/sys/logout')
            session.tabActiveKey = null
            session.tabList = []
            history.push('/login')
          } else {
            message.success(`${mode === 'update' ? '修改' : '新增'}角色成功`)
            onOk()
          }
        } else {
          message.error(`${mode === 'update' ? '修改' : '新增'}角色失败`)
        }
      })
    })
  }

  async function judgeName(rule, value) {
    if (mode === 'update') {
      if (record.roleName === value) {
        return Promise.resolve()
      }
    }
    if (value) {
      const res = await axios.get('/role/userNameCheck', {
        params: { roleName: value },
      })
      if (res.data.code === 1) {
        return Promise.resolve()
      } else {
        return Promise.reject(res.data.msg)
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
      destroyOnClose
    >
      <Form
        form={form}
        layout="horizontal"
        wrapperCol={{ span: 18 }}
        labelCol={{ span: 6 }}
      >
        <Form.Item
          name="roleName"
          label="名称"
          rules={[
            { required: true, message: '名称必填' },
            { validator: judgeName },
          ]}
          validateTrigger="onBlur"
        >
          <Input type="text" maxLength="50" />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input type="text" maxLength="50" />
        </Form.Item>
        <Form.Item name="menuIdList" label="菜单授权">
          <TreeMenu mode="All"></TreeMenu>
        </Form.Item>
        {/* <Form.Item name="dataPermissionType" label="数据权限类型">
          <Radio.Group
            buttonStyle="solid"
            onChange={e => setType(e.target.value)}
          >
            <Radio.Button value={1}>全部</Radio.Button>
            <Radio.Button value={2}>本级</Radio.Button>
            <Radio.Button value={3}>本级及子集</Radio.Button>
            <Radio.Button value={4}>自定义</Radio.Button>
            <Radio.Button value={5}>个人</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {type === 4 && (
          <Form.Item name="dataDeptIdList" label="部门ID集合">
            <TreeDeptSelect mode="ByDept" deptId={deptId} />
          </Form.Item>
        )} */}
      </Form>
    </Modal>
  )
}
