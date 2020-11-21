import React from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Card, Input, Checkbox, Row, Col, message, Button } from 'antd'
import axios from 'axios'
import { SERVERDFWL } from 'configs/service'
import PageWrapper from 'components/PageWrapper'

function Setting(props) {
  const {
    form,
    form: { getFieldDecorator: f },
  } = props
  const [loading, setLoading] = React.useState()
  const [data, setData] = React.useState({})

  React.useEffect(() => {
    axios
      .get('/sysparam/list', {
        params: {},
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (res.data.code === 1) {
          setData(res.data.data[0])
          form.setFieldsValue({
            password: res.data.data[0].password,
            radius: res.data.data[0].radius,
            checkway: res.data.data[0].checkway.split(','),
          })
        } else {
          message.error(res.data.msg)
        }
      })
  }, [])

  function onSubmit() {
    form.validateFields(async (err, fields) => {
      if (err) return
      setLoading(true)
      fields.id = data.id
      fields.checkway = fields.checkway.join(',')
      await axios
        .post('/sysparam/saveOrUpdate', { ...fields }, { baseURL: SERVERDFWL })
        .then(res => {
          setLoading(false)
          if (res.data.code === 1) {
            message.success(res.data.msg)
          } else {
            message.error(res.data.msg)
          }
        })
    })
  }

  return (
    <PageWrapper>
      <Card title="系统参数设置" bordered={false} style={{ minHeight: '80vh' }}>
        <Form
          layout="horizontal"
          wrapperCol={{ span: 6 }}
          labelCol={{ span: 10 }}
          onSubmit={onSubmit}
        >
          <Form.Item label="默认密码">
            {f('password', {
              rules: [
                { required: true, message: '默认密码必填' },
                {
                  pattern: /(?=.*[a-z])(?=.*\d)(?=.*[#@!~%^&*])[a-z\d#@!~%^&*]{8,16}/,
                  message:
                    '长度8-16位，必须包含数字字母特殊符号,特殊字符为~!@#$%^&*',
                },
              ],
            })(<Input type="text" maxLength="50" />)}
          </Form.Item>
          <Form.Item label="盘点方式">
            {f('checkway', {
              rules: [{ required: false, message: '盘点方式必填' }],
            })(
              <Checkbox.Group style={{ width: '100%' }}>
                <Row>
                  <Col span={8}>
                    <Checkbox value="RFID">RFID</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="拍照">拍照</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="拍视频">拍视频</Checkbox>
                  </Col>
                  {/* <Col span={8}>
                  <Checkbox value="D">D</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="E">E</Checkbox>
                </Col> */}
                </Row>
              </Checkbox.Group>
            )}
          </Form.Item>
          <Form.Item label="电子围栏预警半径(公里)">
            {f('radius', {
              rules: [{ required: true, message: '电子围栏预警半径必填' }],
            })(<Input type="text" maxLength="50" />)}
          </Form.Item>
          {/* <Form.Item label="手机号">
          {f('mobile', {
            rules: [
              { required: false, message: '手机号非必填' },
              {
                pattern: /^^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/,
                message: '请输入正确的手机号',
              },
            ],
          })(<Input type="text" maxLength="50" />)}
        </Form.Item> */}
          <Form.Item wrapperCol={{ offset: 10, span: 14 }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </PageWrapper>
  )
}

export default Form.create()(Setting)
