import React from 'react'
import { Steps, Button, Form, Input, Row, Col, message } from 'antd'
import { SERVER } from 'configs/service'
import { useHistory } from 'react-router-dom'
import axios from 'axios'
import { checkres } from 'utils'
import bg from './img/bg_password.png'
const { Step } = Steps

export default function ForgetPassword() {
  const [current, setCurrent] = React.useState(0)
  const [phoneNo, setPhoneNo] = React.useState(null)
  const [uuid] = React.useState(Math.random())
  const [time, setTime] = React.useState(0)
  const [form] = Form.useForm()
  const [codeImg, setCodeImg] = React.useState(
    `${SERVER}/sys/captchaJpg?uuid=` + uuid + '&date=' + new Date().getTime()
  )
  const refreshVcode = () => {
    setCodeImg(
      `${SERVER}/sys/captchaJpg?uuid=` + uuid + '&date=' + new Date().getTime()
    )
  }
  let history = useHistory()
  const intervalRef = React.useRef(null)
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
      .validateFields(['phoneNo'])
      .then(values => {
        axios
          .get('/userLogon/productCode', {
            params: { phoneNo: values.phoneNo, source: 0 },
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

  const steps = [
    {
      title: '确认账号',
      content: (
        <Form form={form}>
          <Form.Item
            name="phoneNo"
            rules={[{ required: true, message: '手机号必填' }]}
          >
            <Input
              type="text"
              size="large"
              placeholder="请输入手机号"
              style={{ width: 420 }}
            />
          </Form.Item>
          <Row>
            <Col span={14}>
              <Form.Item
                name="captcha"
                rules={[{ required: true, message: '验证码必填' }]}
              >
                <Input
                  type="text"
                  size="large"
                  placeholder="请输入验证码"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={1}></Col>
            <Col span={9}>
              <Form.Item>
                <img
                  src={codeImg}
                  style={{
                    width: '100%',
                    height: 40,
                  }}
                  onClick={() => {
                    refreshVcode()
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      title: '安全验证',
      content: (
        <Form form={form}>
          <Form.Item
            name="phoneNo"
            rules={[{ required: true, message: '手机号必填' }]}
          >
            <Input
              type="text"
              size="large"
              placeholder="请输入手机号"
              disabled={true}
              style={{ width: 420 }}
            />
          </Form.Item>
          <Row>
            <Col span={14}>
              <Form.Item
                name="checkCode"
                rules={[{ required: true, message: '验证码必填' }]}
              >
                <Input
                  type="text"
                  size="large"
                  placeholder="请输入验证码"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={1}></Col>
            <Col span={9}>
              <Form.Item>
                <Button
                  disabled={!!time}
                  style={{
                    width: '100%',
                    height: 40,
                  }}
                  onClick={() => {
                    onGetCaptcha()
                  }}
                >
                  {time ? `${time} s` : '获取验证码'}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      title: '密码重置',
      content: (
        <Form form={form}>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '新密码必填' },
              { validator: judgepwd2 },
            ]}
            validateTrigger="onBlur"
          >
            <Input.Password
              size="large"
              placeholder="请输入新密码"
              style={{ width: 420 }}
            />
          </Form.Item>
          <Form.Item
            name="password2"
            rules={[
              { required: true, message: '确认密码必填' },
              { validator: judgepwd },
            ]}
            // validateTrigger="onBlur"
          >
            <Input.Password
              size="large"
              placeholder="请再次确认密码"
              style={{ width: 420 }}
            />
          </Form.Item>
        </Form>
      ),
    },
  ]

  async function judgepwd(rule, value) {
    const pwd = form.getFieldValue('password')
    if (pwd === value || !value) {
      return Promise.resolve()
    } else {
      return Promise.reject('两次密码输入不相同，请确认')
    }
  }

  async function judgepwd2() {
    form.validateFields(['password2']).then(() => {
      return Promise.resolve()
    })
  }

  const next = () => {
    form.validateFields().then(fields => {
      if (current === 0) {
        axios
          .get('/userLogon/confirmAccount', {
            params: {
              ...fields,
              uuid,
            },
          })
          .then(res => {
            if (!checkres(res)) {
              refreshVcode()
              return
            }
            setCurrent(current + 1)
          })
      } else if (current === 1) {
        axios
          .get('/userLogon/securityVerification', {
            params: {
              ...fields,
            },
          })
          .then(res => {
            if (!checkres(res)) {
              return
            }
            const phoneNo = form.getFieldValue('phoneNo')
            setPhoneNo(phoneNo)
            setCurrent(current + 1)
          })
      }
    })
  }
  const pre = () => {
    setCurrent(current - 1)
  }
  const submit = () => {
    form.validateFields().then(fields => {
      if (!phoneNo) {
        message.error('请返回上一步验证手机号')
        return
      }
      axios
        .get('/userLogon/passwordReset', {
          params: {
            password: window.btoa(fields.password),
            phoneNo: phoneNo,
          },
        })
        .then(res => {
          if (!checkres(res)) {
            return
          }
          message.success('密码修改成功')
          history.push('/login')
        })
    })
  }
  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100px',
          background: 'rgba(240,240,240,1)',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '442px',
            height: '24px',
            fontSize: '26px',
            fontWeight: 500,
            marginLeft: '16%',
          }}
        >
          新能源汽车安全监测及大数据分析平台
        </div>
        <div
          style={{
            width: '72px',
            height: '24px',
            fontSize: '18px',
            marginLeft: '18px',
            marginTop: 20,
          }}
        >
          找回密码
        </div>
      </div>
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          backgroundImage: `url(${bg})`,
          backgroundSize: '100% 100%',
        }}
      >
        <Button
          style={{ position: 'absolute', top: 39, right: '16%' }}
          type="link"
          onClick={() => {
            history.push('/login')
          }}
        >
          使用已有帐户登录
        </Button>
        <div style={{ width: '800px', marginTop: 50 }}>
          <Steps current={current}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              height: 240,
              alignItems: 'center',
            }}
          >
            {steps[current].content}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {current < steps.length - 1 && (
              <Button type="primary" onClick={() => next()}>
                下一步
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={() => submit()}>
                提交
              </Button>
            )}
            {current > 0 && current < steps.length - 1 && (
              <Button style={{ margin: '0 8px' }} onClick={() => pre()}>
                上一步
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
