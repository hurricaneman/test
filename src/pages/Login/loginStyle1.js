import React, { useState } from 'react'
import { Form, Icon as LegacyIcon } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Input, Row, Col, Button, message, Modal, Result } from 'antd'
import styles from './loginStyle1.module.scss'
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
  const [type, setType] = useState(false)
  const [time, setTime] = useState(0)
  const [uuid] = useState(Math.random())
  const [codeImg, setCodeImg] = useState(
    `${SERVER}/sys/captchaJpg?uuid=` + uuid + '&date=' + new Date().getTime()
  )
  const intervalRef = React.useRef(null)

  async function login(params) {
    const res = await axios.post('/sys/login', params)
    setLoading(false)
    if (!checkres(res)) {
      refreshVcode()
      return
    }

    const { token, user, cssUrl } = res.data.data
    if (user.userId === -1) {
      var dt = new Date()
      dt.setSeconds(dt.getSeconds() + 60)
      document.cookie = `Authorization=${token}; expires=${dt.toGMTString()}; path=/`
      window.location.href = `${window.location.origin}/cvtri-screen/`
    } else {
      message.success('登录成功')
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
  }

  React.useEffect(() => {
    if (time === 59) {
      intervalRef.current = setInterval(() => {
        setTime(preCount => preCount - 1)
      }, 1000)
    } else if (time === 0) {
      clearInterval(intervalRef.current)
    }
  }, [time])

  React.useEffect(() => {
    return () => {
      clearInterval(intervalRef.current)
    }
  }, [])

  const onGetCaptcha = React.useCallback(() => {
    form
      .validateFields(['username'])
      .then(values => {
        axios
          .get('/userLogon/productCode', {
            params: { phoneNo: values.username, source: 1 },
          })
          .then(res => {
            if (!checkres(res)) return
            message.success('验证码已发送到手机，请注意查收')
            setTime(59)
          })
      })
      .catch(errorInfo => {
        console.log(errorInfo)
      })
  }, [])

  function success() {
    Modal.confirm({
      content: (
        <Result
          status="success"
          title="注册成功"
          subTitle="请联系管理员授权（02723456721）"
        />
      ),
      okText: '确定',
      onOk: () => {
        setType(false)
        form.resetFields()
      },
      onCancel: () => {
        setType(false)
        form.resetFields()
      },
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

  const registered = () => {
    form.validateFields((err, values) => {
      if (!err) {
        setLoading(true)
        values.password = window.btoa(values.password)
        axios
          .post('/userLogon/signUp', {
            telephone: values.username,
            password: values.password,
            checkCode: values.captcha,
          })
          .then(res => {
            setLoading(false)
            if (!checkres(res)) return
            success()
          })
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
        <div className={styles.text}>{type ? '欢迎注册' : '用户登录'}</div>
        <Form>
          <Form.Item>
            {f('username', {
              rules: [
                {
                  required: true,
                  message: '请输入手机号',
                },
              ],
            })(
              <Input
                type="text"
                size="large"
                placeholder="请输入手机号"
                style={{ width: 320 }}
                prefix={
                  type ? null : (
                    <LegacyIcon
                      type="user"
                      style={{ color: 'rgba(0,0,0,.25)' }}
                    />
                  )
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
                  type ? null : (
                    <LegacyIcon
                      type="lock"
                      style={{ color: 'rgba(0,0,0,.25)' }}
                    />
                  )
                }
                visibilityToggle
              />
            )}
          </Form.Item>
        </Form>
        <Row>
          <Col span={type ? 15 : 17}>
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
                  placeholder="请输入验证码"
                  style={{ width: type ? 200 : 230 }}
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
          {type ? (
            <Col span={type ? 8 : 6}>
              <Button
                disabled={!!time}
                style={{ height: '40px', width: '100%' }}
                onClick={() => {
                  onGetCaptcha()
                }}
              >
                {time ? `${time} s` : '获取验证码'}
              </Button>
            </Col>
          ) : (
            <Col span={6}>
              <img
                src={codeImg}
                className={styles.image}
                onClick={() => {
                  refreshVcode()
                }}
              />
            </Col>
          )}
        </Row>
        <div>
          {type ? (
            <Button
              type="primary"
              onClick={() => {
                registered()
              }}
              size="large"
              block
              loading={loading}
            >
              注册
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => {
                handleOk()
              }}
              size="large"
              block
              loading={loading}
            >
              登录
            </Button>
          )}
        </div>
        {/* {type ? (
          <div className={styles.flogetPwdMain}>
            <a
              className={styles.flogetPwd}
              style={{ marginLeft: 12 }}
              onClick={() => {
                setType(false)
                form.resetFields()
              }}
            >
              使用已有账户登陆
            </a>
          </div>
        ) : (
          <div className={styles.flogetPwdMain}>
            <a
              className={styles.flogetPwd}
              onClick={() => {
                history.push('/forgetPassword')
              }}
            >
              忘记密码
            </a>
            <a
              className={styles.flogetPwd}
              style={{ marginLeft: 12 }}
              onClick={() => {
                setType(true)
                form.resetFields()
              }}
            >
              立即注册
            </a>
          </div>
        )} */}
      </div>
    </div>
  )
}

export default Form.create()(LoginStyle1)
