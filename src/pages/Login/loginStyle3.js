import React, { useState } from 'react'
import { Form, Icon as LegacyIcon } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Input, Row, Col, Button, message } from 'antd'
import styles from './loginStyle3.module.scss'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { checkres, session, changeTheme } from 'utils'
import { SERVER } from 'configs/service'

function LoginStyle1(props) {
  const {
    form,
    form: { getFieldDecorator: f },
  } = props
  let history = useHistory()
  const [loading, setLoading] = useState(false)
  const [uuid] = useState(Math.random())
  const [codeImg, setCodeImg] = useState(
    `${SERVER}/sys/captchaJpg?uuid=` + uuid + '&date=' + new Date().getTime()
  )

  async function login(params) {
    const res = await axios.post('/sys/login', params)
    setLoading(false)
    if (!checkres(res)) {
      refreshVcode()
      return
    }
    message.success('登录成功')
    const { token, user, cssUrl } = res.data.data
    session.Authorization = token
    session.userData = user
    session.screenLock = false
    axios.defaults.headers.common.Authorization = token
    axios.get('/userTheme/getTheme').then(res => {
      if (!checkres(res)) return
      const { theme, head, menuType } = res.data.data || {}
      if (cssUrl) {
        changeTheme(theme, head, cssUrl, menuType)
        history.push('/home')
      } else {
        history.push('/home')
      }
    })
  }

  const handleOk = () => {
    form.validateFields((err, values) => {
      if (!err) {
        setLoading(true)
        values.password = window.btoa(values.password)
        login({ ...values, uuid: uuid })
      }
    })
  }
  const refreshVcode = () => {
    setCodeImg(
      `${SERVER}/sys/captchaJpg?uuid=` + uuid + '&date=' + new Date().getTime()
    )
  }
  return (
    <div className={styles.main}>
      <div className={styles.loginBox}>
        <Form>
          <Form.Item>
            {f('username', {
              rules: [
                {
                  required: true,
                  message: '请输入用户名',
                },
              ],
            })(
              <Input
                type="text"
                size="large"
                placeholder="请输入用户名"
                style={{ width: 320 }}
                prefix={
                  <LegacyIcon
                    type="user"
                    style={{ color: 'rgba(0,0,0,.25)' }}
                  />
                }
              />
            )}
          </Form.Item>
          <Form.Item>
            {f('password', {
              rules: [
                {
                  required: true,
                  message: '请输入密码',
                },
              ],
            })(
              <Input.Password
                size="large"
                placeholder="请输入密码"
                type="password"
                style={{ width: 320 }}
                prefix={
                  <LegacyIcon
                    type="lock"
                    style={{ color: 'rgba(0,0,0,.25)' }}
                  />
                }
                visibilityToggle
              />
            )}
          </Form.Item>
        </Form>
        <Row>
          <Col span={17}>
            <Form.Item>
              {f('captcha', {
                rules: [
                  {
                    required: true,
                    message: '请输入验证码',
                  },
                ],
              })(
                <Input
                  type="text"
                  size="large"
                  style={{ width: 230 }}
                  placeholder="请输入验证码"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleOk()
                    }
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={1}></Col>
          <Col span={6}>
            <img
              src={codeImg}
              className={styles.image}
              onClick={() => {
                refreshVcode()
              }}
            />
          </Col>
        </Row>
        <div>
          <Button
            type="primary"
            onClick={() => {
              handleOk()
            }}
            size="large"
            shape="round"
            block
            loading={loading}
            style={{
              backgroundColor: 'rgb(58,170,168)',
              border: 'none',
            }}
          >
            登录
          </Button>
        </div>
        {/* <div className={styles.flogetPwdMain}>
          <a
            className={styles.flogetPwd}
            onClick={() => {
              // history.push('/home')
            }}
          >
            忘记密码
          </a>
        </div> */}
      </div>
    </div>
  )
}
export default Form.create()(LoginStyle1)
