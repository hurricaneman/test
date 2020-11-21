import React from 'react'
import { Input, Button } from 'antd'
import lock from './img/lock.png'

export default function ScreenLock(props) {
  const { close, username } = props
  const [value, setValue] = React.useState()

  const onChange = e => {
    setValue(e.target.value)
  }

  const submit = () => {
    close(value)
  }

  return (
    <div
      style={{
        backgroundColor: 'rgba(0,0,0,0.65)',
        zIndex: 1000,
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 'calc(50vw - 60vh)',
          top: 'calc(50vh - 32.4vh)',
          width: '120vh',
          height: '64.8vh',
          backgroundImage: `url(${lock})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          zIndex: 1001,
        }}
      ></div>
      <div
        style={{
          color: '#ffffff',
          position: 'absolute',
          left: 'calc(50vw + 5vh)',
          top: 'calc(50vh - 22.5vh)',
          fontSize: '2.1vh',
          fontWeight: 600,
          zIndex: 1001,
        }}
      >
        <p style={{ marginBottom: '1vh' }}>{username ? username : ''}</p>
        <p>由于长时间未操作，系统已锁定，请重新输入登录密码解锁系统</p>
        <Input.Password
          size="small"
          style={{ width: '25vh', marginRight: '2vh' }}
          onChange={onChange}
        ></Input.Password>
        <Button size="small" type="primary" onClick={submit}>
          解锁
        </Button>
      </div>
    </div>
  )
}
