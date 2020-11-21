import React, { useState } from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Card, Input, Button, message } from 'antd'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
// import { useHead } from 'utils/hooks'
import { changeTheme, session } from 'utils'
import PageWrapper from 'components/PageWrapper'

function Password(props) {
  const [loading, setLoading] = useState(false)
  let history = useHistory()
  const {
    form,
    form: { getFieldDecorator: f },
  } = props
  // const headFixd = useHead()
  const submit = () => {
    form.validateFields((err, values) => {
      if (!err) {
        if (values.newPassword !== values.newPassword2) {
          message.info('两次密码输入不一样，请重新检查')
          return
        }
        delete values.newPassword2
        values.password = window.btoa(values.password)
        values.newPassword = window.btoa(values.newPassword)
        if (values.password === values.newPassword) {
          message.error('不能设置与原密码相同的密码，请重新输入')
          return
        }
        setLoading(true)
        axios.get('/user/password', { params: { ...values } }).then(res => {
          setLoading(false)
          if (res.data.code === 1) {
            message.success('修改密码成功,请重新登陆')
            changeTheme()
            axios.post('/sys/logout')
            session.tabActiveKey = null
            session.tabList = []
            history.push('/login')
          } else {
            message.error(res.data.msg)
          }
        })
      }
    })
  }
  const compareToFirstPassword = (rule, value, callback) => {
    if (value && value !== form.getFieldValue('newPassword')) {
      callback('确认密码与密码输入不一致')
    } else {
      callback()
    }
  }
  return (
    <>
      {/* <PageHeader
        style={
          headFixd
            ? {
                position: 'sticky',
                zIndex: 99,
                top: 0,
              }
            : {}
        }
        title="修改密码"
        ghost={false}
        breadcrumb={{
          routes: [
            { breadcrumbName: '个人设置' },
            { breadcrumbName: '修改密码' },
          ],
          itemRender: r => <span>{r.breadcrumbName}</span>,
        }}
      ></PageHeader> */}

      <PageWrapper>
        <Card title="修改密码">
          <Form
            layout="horizontal"
            wrapperCol={{ span: 6 }}
            labelCol={{ span: 10 }}
          >
            <Form.Item label="原密码">
              {f('password', {
                rules: [
                  {
                    required: true,
                    message: '请输入原密码',
                  },
                ],
              })(
                <Input.Password
                  size="large"
                  placeholder="请输入原密码"
                  type="password"
                  visibilityToggle
                  style={{ width: 280 }}
                />
              )}
            </Form.Item>
            <Form.Item label="新密码">
              {f('newPassword', {
                rules: [
                  {
                    required: true,
                    message: '请输入新密码',
                  },
                  {
                    pattern: /(?=.*[a-z])(?=.*\d)(?=.*[#@!~%^&*])[a-z\d#@!~%^&*]{8,16}/,
                    message:
                      '长度8-16位，必须包含数字字母特殊符号,特殊字符为~!@#$%^&*',
                  },
                ],
              })(
                <Input.Password
                  size="large"
                  placeholder="请输入新密码"
                  type="password"
                  visibilityToggle
                  style={{ width: 280 }}
                />
              )}
            </Form.Item>
            <Form.Item label="确认新密码">
              {f('newPassword2', {
                rules: [
                  {
                    required: true,
                    message: '请输入新密码',
                  },
                  {
                    validator: compareToFirstPassword,
                  },
                ],
              })(
                <Input.Password
                  size="large"
                  placeholder="请输入新密码"
                  type="password"
                  visibilityToggle
                  style={{ width: 280 }}
                />
              )}
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 10, span: 14 }}>
              <Button
                type="primary"
                loading={loading}
                onClick={() => {
                  submit()
                }}
              >
                提交
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </PageWrapper>
    </>
  )
}
export default Form.create()(Password)
