import React from 'react'
import { Card, List, Select, message } from 'antd'
import { useHistory } from 'react-router-dom'
import { session, bus } from 'utils'
import axios from 'axios'
const { Option } = Select

export default function Safe() {
  const [pwdLevel, setPwdLevel] = React.useState('')
  // const [phone, setPhone] = React.useState('')
  // const [email, setEmail] = React.useState('')
  let history = useHistory()

  React.useEffect(() => {
    setPwdLevel('强')
    // setPhone('')
    // setEmail('')
  }, [])

  const handleChange = value => {
    axios
      .get('/user/updateLeaveProtectTime', {
        params: { leaveProtectTime: value },
      })
      .then(res => {
        if (res.data.code === 1) {
          session.userData.leaveProtectTime = value
          bus.emit('@/System/safe/screenLock', value)
        } else {
          message.error('设置失败')
        }
      })
  }

  return (
    <Card bordered={false} title="安全设置">
      <List size="small">
        <List.Item
          actions={[
            <a
              key="1"
              onClick={() => {
                history.push('/profile/password')
              }}
            >
              修改
            </a>,
          ]}
        >
          <List.Item.Meta
            title="账户密码"
            description={`当前密码强度: ${pwdLevel}`}
          />
        </List.Item>
        {/* <List.Item actions={[<a key="2">绑定</a>]}>
          <List.Item.Meta
            title="绑定邮箱"
            description={`已绑定邮箱：${email}`}
          />
        </List.Item>
        <List.Item actions={[<a key="3">绑定</a>]}>
          <List.Item.Meta
            title="绑定手机"
            description={`已绑定手机：${phone}`}
          />
        </List.Item> */}
        <List.Item
          actions={[
            <Select
              style={{ width: 90 }}
              key={4}
              defaultValue={session.userData.leaveProtectTime}
              onChange={handleChange}
            >
              <Option value={3}>3分钟</Option>
              <Option value={5}>5分钟</Option>
              <Option value={10}>10分钟</Option>
              <Option value={30}>30分钟</Option>
              <Option value={60}>一小时</Option>
              <Option value={360}>六小时</Option>
              <Option value={0}>永不</Option>
            </Select>,
          ]}
        >
          <List.Item.Meta
            title="开启离开保护"
            description="当超过设定时间系统无操作，整个界面进入锁屏状态，需要重新输入登陆密码方可解锁"
          />
        </List.Item>
      </List>
    </Card>
  )
}
