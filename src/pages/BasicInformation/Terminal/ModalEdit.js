import React from 'react'
import { Modal, Input, Form, message } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import { SERVERDFWL } from 'configs/service'
import TableSelect from 'components/TableSelect'

export default function ModalEdit(props) {
  const { visible, onCancel, onOk, mode, record } = props
  const [loading, setLoading] = React.useState()
  const [form] = Form.useForm()
  const tableSeletRef = React.useRef()

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
            vin: {
              name: record.vin,
              value: record.vehicleId,
            },
          })
        }
        break
    }
  }, [visible])

  function onSubmit() {
    form.validateFields().then(fields => {
      setLoading(true)
      if (mode === 'update') {
        fields.id = record.id
      }
      fields.vehicleId = fields.vin.value
      delete fields.vin
      axios
        .post('/terminal/' + mode, { ...fields }, { baseURL: SERVERDFWL })
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
          label="车辆底盘号"
          name="vin"
          rules={[{ required: true, message: '车辆底盘号为必填' }]}
        >
          <TableSelect
            scrollX={1200}
            baseURL={1}
            ref={tableSeletRef}
            mode={mode}
            url="/vehicle/page"
            dealWith={true}
            rowKey="id"
            selectName="vin"
            columns={[
              {
                dataIndex: 'vin',
                title: '车辆识别码',
              },
              { dataIndex: 'orderNo', title: '订单号' },
              {
                dataIndex: 'ticketNumber',
                title: '票号',
              },
              {
                dataIndex: 'financeName',
                title: '资方',
              },
              {
                dataIndex: 'carFactory',
                title: '主机厂',
              },
              {
                dataIndex: 'dealerName',
                title: '经销商名称',
              },
              {
                dataIndex: 'brand',
                title: '品牌',
              },
              {
                dataIndex: 'warehouseName',
                title: '网点名称',
              },
              {
                dataIndex: 'warehouseType',
                title: '网点分类',
                render: v => {
                  return ['主库', '二库', '合作二网', '直营二网'][v]
                },
              },
            ]}
            searchForm={[
              {
                label: '车辆识别码',
                name: 'vin',
                preset: 'text',
              },
              {
                label: '订单单号',
                name: 'orderNo',
                preset: 'text',
              },
              {
                label: '监管状态',
                name: 'status',
                preset: 'select',
                options: [
                  { label: '在途', value: 1 },
                  { label: '质押', value: 2 },
                  { label: '释放', value: 3 },
                  { label: '借车', value: 4 },
                  { label: '销退', value: 5 },
                ],
              },
            ]}
            searchFormInitialValues={{
              organizationType: 'REGULATOR',
            }}
          ></TableSelect>
        </Form.Item>
        <Form.Item
          name="iccid"
          label="ICCID"
          rules={[{ required: true, message: '终端SIM卡号为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="simCardNo"
          label="终端SIM卡号"
          rules={[{ required: true, message: '终端SIM卡号为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        <Form.Item
          name="terminalNo"
          label="终端编号"
          rules={[{ required: true, message: '终端编号为必填' }]}
        >
          <Input></Input>
        </Form.Item>
        {/* <Form.Item
          name="mark"
          label="备注"
          rules={[{ required: false, message: '' }]}
        >
          <Input></Input>
        </Form.Item> */}
      </Form>
    </Modal>
  )
}
