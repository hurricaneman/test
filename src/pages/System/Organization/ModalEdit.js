/* eslint-disable */
import React from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Modal, Input, TreeSelect, InputNumber, message, Switch } from 'antd'
import axios from 'axios'
import TreeMenu from 'components/Tree/TreeMenu'
import TreeDept from 'components/Tree/TreeDept'

function ModalEdit(props) {
  const {
    visible, // 是否显示
    onChange, // 修改新增
    onCancel, // 取消
    node, // 当前节点数据
    renderList, // 树状节点数据
    origineList, // 原始节点书
    getMenuTreeData, // 获取菜单树状节点方法
    mode, // 模式
    form,
    form: { getFieldDecorator: f },
  } = props
  const [loading, setLoading] = React.useState(false)
  const [disabledFlag, setDisabledFlag] = React.useState(true)
  const { userLevel } = JSON.parse(window.sessionStorage.getItem('userData'))
  const [defaultChecked, setChecked] = React.useState(
    node ? (node.saasFlag === 0 ? false : true) : false
  )
  // 当前选择的上级部门的菜单列表
  const [upperMenuIdList, setUpperMenuIdList] = React.useState([])
  const [deptId, setDeptId] = React.useState()
  const onSubmit = () => {
    const requestUrl = mode === '新增' ? '/dept/add' : '/dept/update'
    form.validateFields(async (err, fields) => {
      if (err) return

      const flag = fields.saasFlag || defaultChecked ? 1 : 0

      // 根据类型切换文字和value值
      let parentId
      if (mode === '新增') {
        parentId = fields.highLevel
      } else if (!isNaN(Number(fields.highLevel))) {
        parentId = fields.highLevel
      } else {
        parentId = node.parentId
      }
      // 如果未设置任何菜单则继承父级菜单
      if (!fields.menuIdList || fields.menuIdList.length === 0) {
        const list = []
        upperMenuIdList.map(e => list.push(e.menuId))
        fields.menuIdList = list
      }
      let option = {
        deptId: node ? node.deptId : null,
        parentId: parentId,
        name: fields.name,
        orderNum: fields.orderNum,
        menuIdList: fields.menuIdList ? fields.menuIdList : [],
        saasFlag: flag,
        username: fields.username ? fields.username : node ? node.username : '',
        Authorization: window.sessionStorage.getItem('Authorization'),
      }
      // if(mode === "新增") {
      //   option = Object.assign(option,{
      //     saasFlag: flag,
      //   })
      // }
      if (option.deptId === option.parentId) {
        message.error('不能设置上级部门为自己，请重新选择')
        return
      }
      setLoading(true)
      axios
        .post(requestUrl, option)
        .then(({ data: res }) => {
          setLoading(false)

          if (res.code === 1) {
            message.success(res.msg)
            onChange()
            onCancel()
          } else {
            message.error(res.msg)
          }
        })
        .catch(e => {
          setLoading(false)
          message.error(e)
          onCancel()
        })
    })
  }

  // 获取上级部门所有菜单
  const upperDepartmentMenuList = '/menu/getDeptMenu'
  // 获取部门所有菜单
  const departmentMenuList = '/dept/info/getDeptById'
  const getMenuListPromise = function(deptId, url) {
    return axios.get(url, {
      params: {
        deptId,
      },
    })
  }

  const onTreeSelectChange = v => {
    async function init() {
      setDeptId(v)
      // 从原始数据列表查找单项内容
      const item = origineList.find(e => e.deptId === v)
      // 动态修改菜单内容

      let upperMenu = await getMenuListPromise(v, upperDepartmentMenuList)
      const list = []
      const defaaultMenu = []
      upperMenu.data.data.map((v, index) => {
        if (v) {
          v['key'] = index
          v['title'] = v.name
          v['value'] = v.menuId
          list.push(v)
          defaaultMenu.push(v.menuId)
        }
      })
      setUpperMenuIdList(list)
      // 动态修改菜单被选中的内容
      if (mode === '修改') {
        const menu = await getMenuListPromise(node.deptId, departmentMenuList)
        form.setFieldsValue({
          menuIdList: menu.data.data.menuIdList,
        })
      }
      if (mode === '新增') {
        // 新增时默认设置当前父级所有菜单
        form.setFieldsValue({
          menuIdList: defaaultMenu,
        })
      }
      if (item && item.parentId === 0) {
        setDisabledFlag(false)
      } else {
        setDisabledFlag(true)
      }
    }
    init()
  }

  async function judgeUserName(rule, value, callback) {
    const res = await axios.get('/user/userNameCheck', {
      params: { userName: value },
    })
    if (res.data.code === 1) {
      callback()
    } else {
      setLoading(false)
      callback(res.data.msg)
    }
  }

  async function judgeName(rule, value, callback) {
    if (mode === '修改') {
      if (node.name === value) {
        callback()
      }
    }
    if (value) {
      const res = await axios.get('/dept/judgeName', {
        params: { name: value },
      })
      if (res.data.code === 1) {
        callback()
      } else {
        callback(res.data.msg)
      }
    }
  }

  React.useEffect(() => {
    async function init() {
      if (!visible) {
        setChecked(false)
        setDeptId(undefined)
        form.resetFields()
        return
      }
      // 初始化表格时需要去获取一下上级菜单和当前菜单
      const parentId = node ? node.parentId : 1

      const upperMenu = await getMenuListPromise(
        parentId,
        upperDepartmentMenuList
      )
      const list = []
      upperMenu?.data?.data?.map((v, index) => {
        if (v) {
          v['key'] = index + Math.random()
          v['title'] = v.name
          v['value'] = v.menuId
          list.push(v)
        }
      })

      setUpperMenuIdList(list)

      setChecked(node ? (node.saasFlag === 0 ? false : true) : false)
      if (visible && mode === '修改' && node) {
        setDeptId(node.deptId)
        // 设置默认菜单被选中的内容
        const menu = await getMenuListPromise(node.deptId, departmentMenuList)

        setDisabledFlag(node.parentId !== 1)
        form.setFieldsValue({
          menuIdList: menu.data.data.menuIdList,
          name: node.name,
          highLevel: node.highLevel,
          orderNum: node.orderNum,
        })
      }
      if (visible && mode === '新增') {
        setDisabledFlag(true)
        form.setFieldsValue({
          orderNum: 0,
        })
      }
    }
    init()
  }, [visible])
  return (
    <Modal
      visible={visible}
      title={mode}
      okText="确认"
      cancelText="取消"
      onOk={onSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form
        layout="horizontal"
        wrapperCol={{ span: 18 }}
        labelCol={{ span: 6 }}
      >
        <Form.Item label="名称">
          {f('name', {
            rules: [
              { required: true, message: '名称必填' },
              { validator: judgeName },
            ],
            validateTrigger: 'onBlur',
          })(<Input type="text" maxLength="50" />)}
        </Form.Item>
        <Form.Item label="上级部门">
          {f('highLevel', {
            rules: [{ required: true, message: '上级部门必填' }],
          })(
            <TreeSelect
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder={node ? node.name : ''}
              allowClear
              treeData={renderList}
              // treeIcon={true}
              onChange={onTreeSelectChange}
            ></TreeSelect>
            //   <TreeDept
            //   selectedKeys={[deptId?deptId:node?node.deptId:'']}
            //   onSelect={onTreeSelectChange}
            // ></TreeDept>
          )}
        </Form.Item>
        <Form.Item label="排序">
          {f('orderNum', {
            rules: [{ pattern: /^[0-9]*$/, message: '必须输入数字' }],
          })(<InputNumber size="large" min={0} max={100000} />)}
        </Form.Item>
        {/* {userLevel == 1 && mode === '新增' && visible ? (
          <Form.Item label="是否租户">
            {f('saasFlag', {
              rules: [],
            })(
              <Switch
                disabled={disabledFlag}
                checked={defaultChecked}
                onChange={v => setChecked(v)}
              />
            )}
          </Form.Item>
        ) : null}
        {defaultChecked && mode === '新增' ? (
          <Form.Item label="管理员账号">
            {f('username', {
              rules: [
                { required: true, message: '管理员账号必填' },
                {
                  pattern: /^[a-zA-Z0-9_-]{4,16}$/,
                  message: '用户名4到16位（字母，数字，下划线，减号）',
                },
                { validator: judgeUserName },
              ],
              validateTrigger: 'onBlur',
            })(<Input type="text" maxLength="50" />)}
          </Form.Item>
        ) : null}
        {defaultChecked && userLevel == 1 ? (
          <Form.Item label="菜单管理">
            {f('menuIdList', {
              rules: [],
            })(
              <TreeMenu
                mode={mode === '新增' && !deptId ? 'ByDept' : 'ByDept'}
                deptId={deptId ? deptId : node ? node.parentId : ''}
              ></TreeMenu>
              // <TreeSelect
              //   showSearch
              //   style={{ width: '100%' }}
              //   dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              //   allowClear
              //   multiple
              //   treeDefaultExpandAll
              //   treeCheckable={true}
              //   treeData={getMenuTreeData(upperMenuIdList)}
              // ></TreeSelect>
            )}
          </Form.Item>
        ) : null} */}
      </Form>
    </Modal>
  )
}
export default Form.create()(ModalEdit)
