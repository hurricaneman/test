import React from 'react'
import { Modal, Input, Form, Row, Col, Radio, Card, Button } from 'antd'
import axios from 'axios'
import { checkres, session } from 'utils'
import TableSelect from 'components/TableSelect'
import CarTable from './CarTable'
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
      axios.post('/edition/' + mode, { ...fields }).then(res => {
        setLoading(false)
        if (!checkres(res)) return
        onCancel()
        onOk()
      })
    })
  }

  return (
    <Modal
      visible={visible}
      title={mode === '审批'}
      onCancel={onCancel}
      maskClosable={false}
      confirmLoading={loading}
      width={1000}
      footer={
        <>
          <Button type="primary" onClick={() => onSubmit}>
            审批
          </Button>
          <Button>打回</Button>
          <Button>查看附件</Button>
        </>
      }
    >
      <Card>
        <Form
          form={form}
          wrapperCol={{ span: 18 }}
          labelCol={{ span: 6 }}
          initialValues={{
            status: 1,
          }}
          className="LowSmallForm"
        >
          <Row>
            <Col span={12}>
              <Form.Item
                name="appfileName"
                label="经销商"
                rules={[{ required: true, message: '监管机构为必填' }]}
              >
                <TableSelect></TableSelect>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="appName"
                label="申请单号"
                rules={[{ required: false, message: '监管机构代码为必填' }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="editionName"
                label="申请人"
                rules={[{ required: false }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="editionName3"
                label="申请日期"
                rules={[{ required: false }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="editionName2"
                label="还回日期"
                rules={[{ required: false }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="editionName14"
                label="网点"
                rules={[{ required: false }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="editionName5"
                label="移动比"
                rules={[{ required: false }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="editionName4"
                label="移动后的剩余比例"
                rules={[{ required: false }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="移库借车"
                rules={[{ required: false }]}
              >
                <Radio.Group>
                  <Radio value={1}>开店</Radio>
                  <Radio value={0}>闭店</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="remark"
                label="备注"
                rules={[{ required: false }]}
              >
                <Input type="textarea" disabled={true} rows="3"></Input>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card>
        <CarTable></CarTable>
      </Card>
    </Modal>
  )
}
