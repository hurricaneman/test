import React from 'react'
import {
  Modal,
  Input,
  Form,
  Row,
  Col,
  Cascader,
  Radio,
  Select,
  message,
} from 'antd'
import axios from 'axios'
import { checkres, session } from 'utils'
import { SERVERDFWL } from 'configs/service'
// import TableSelect from 'components/TableSelect'
const { Option } = Select

export default function ModalEdit(props) {
  const { visible, onCancel, onOk, mode, record } = props
  const [loading, setLoading] = React.useState()
  const [regionData, setRegionData] = React.useState([])
  const [teachingStaffData, setTeachingStaffData] = React.useState([])
  const [creditManagerData, setCreditManager] = React.useState([])
  const [supervisorsData, setSupervisorsData] = React.useState([])
  const [form] = Form.useForm()

  function ToTree(data, id = 0) {
    return data
      .filter(v => v.pid === id)
      .map(v => {
        const children = ToTree(data, v.id)
        if (!children.length) return v
        return { ...v, children }
      })
  }

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
            ProvinceCity: [record.province, record.city],
            supervisors: record.supervisors
              ? record.supervisors.map(v => v.userId)
              : [],
          })
        }
        break
    }
  }, [visible])

  React.useEffect(() => {
    axios.post('/region/list', {}).then(res => {
      if (!checkres(res)) return
      const data = res.data.data.filter(v => v.level !== 3)
      const tree = ToTree(
        data.map(v => ({ ...v, label: v.name, value: v.name }))
      )
      setRegionData(tree)
    })
    axios
      .post('/user/list', {
        pageIndex: -1,
        pageSize: 1000,
        userLevel: 5,
        organizationType: 'REGULATOR',
      })
      .then(res => {
        if (!checkres(res)) return
        setTeachingStaffData(res.data.data.records)
      })
    axios
      .post('/user/list', {
        pageIndex: -1,
        pageSize: 1000,
        userLevel: 3,
        organizationType: 'FINANCE',
      })
      .then(res => {
        if (!checkres(res)) return
        setCreditManager(res.data.data.records)
      })
    axios
      .post('/user/list', {
        pageIndex: -1,
        pageSize: 1000,
        userLevel: 6,
        organizationType: 'REGULATOR',
      })
      .then(res => {
        if (!checkres(res)) return
        setSupervisorsData(res.data.data.records)
      })
  }, [])

  function onSubmit() {
    form.validateFields().then(fields => {
      setLoading(true)
      if (fields.supervisors) {
        const list = []
        fields.supervisors.map(v => list.push({ userId: v }))
        fields.supervisors = list
      }
      fields.regulatorId = session.userData.organizationId
      fields.province = fields.ProvinceCity[0]
      fields.city = fields.ProvinceCity[1]
      delete fields.ProvinceCity
      if (mode === 'update') fields.id = record.id
      console.log(fields)
      axios
        .post('/dealer/' + mode, { ...fields }, { baseURL: SERVERDFWL })
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
      width={900}
    >
      <Form
        form={form}
        wrapperCol={{ span: 18 }}
        labelCol={{ span: 6 }}
        initialValues={{
          status: 1,
          openStatus: 1,
          regulatorName: session.userData.organizationName,
        }}
        className="LowSmallForm"
      >
        <Row>
          <Col span={12}>
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '名称为必填' }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="regulatorName"
              label="监管机构"
              rules={[{ required: true, message: '监管机构为必填' }]}
            >
              <Input disabled></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="ProvinceCity"
              label="所属区域"
              rules={[{ required: true, message: '所属区域名称为必填' }]}
            >
              <Cascader options={regionData}></Cascader>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="address"
              label="详细地址"
              rules={[{ required: true, message: '详细地址为必填' }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="code"
              label="经销商代码"
              rules={[{ required: false, message: '经销商代码为必填' }]}
            >
              <Input disabled={mode === 'update' ? true : false}></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="depositBank"
              label="开户银行"
              rules={[{ required: false }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="bankAccount"
              label="银行账号"
              rules={[{ required: false }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="legalPerson"
              label="法人代表"
              rules={[{ required: false }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="region"
              label="隶属辖区"
              rules={[{ required: false }]}
            >
              <Select>
                <Option key="1" value="华东">
                  华东
                </Option>
                <Option key="2" value="华南">
                  华南
                </Option>
                <Option key="3" value="华中">
                  华中
                </Option>
                <Option key="4" value="华北">
                  华北
                </Option>
                <Option key="5" value="西北">
                  西北
                </Option>
                <Option key="6" value="西南">
                  西南
                </Option>
                <Option key="7" value="东北">
                  东北
                </Option>
                <Option key="8" value="港澳台">
                  港澳台
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="delegatePerson"
              label="委托人代表"
              rules={[{ required: false }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="taxNumber"
              label="税号"
              rules={[{ required: false }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="有效标志"
              rules={[{ required: false }]}
            >
              <Radio.Group>
                <Radio value={1}>有效</Radio>
                <Radio value={0}>无效</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contractNo"
              label="合同号"
              rules={[{ required: false }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="teachingStaffId"
              label="带教人员"
              rules={[{ required: true, message: '带教人员为必填' }]}
            >
              <Select
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {teachingStaffData.map(v => (
                  <Option key={v.userId} value={v.userId}>
                    {v.realname}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="creditManagerId"
              label="信用经理"
              rules={[{ required: false, message: '信用经理为必填' }]}
            >
              <Select
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {creditManagerData.map(v => (
                  <Option key={v.userId} value={v.userId}>
                    {v.realname}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="supervisors"
              label="监管员"
              rules={[{ required: false, message: '监管员为必填项' }]}
            >
              <Select
                mode="multiple"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {supervisorsData.map(v => (
                  <Option key={v.userId} value={v.userId}>
                    {v.realname}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contacts"
              label="联系人"
              rules={[{ required: false }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="telephone"
              label="联系人电话"
              rules={[{ required: false }]}
            >
              <Input></Input>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
