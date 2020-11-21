import React from 'react'
import { Card, List, Switch } from 'antd'

export default function Message() {
  // const [pwdLevel, setPwdLevel] = React.useState('')
  // const [phone, setPhone] = React.useState('')
  // const [email, setEmail] = React.useState('')
  // const [protect, setProtect] = React.useState(false)

  // React.useEffect(() => {
  //   setPwdLevel('强')
  //   setPhone('')
  //   setEmail('')
  //   setProtect(false)
  // }, [])

  return (
    <Card bordered={false} title="新消息通知">
      <List size="small">
        <List.Item
          actions={[
            <Switch
              checkedChildren="开"
              unCheckedChildren="关"
              defaultChecked={true}
              key={1}
            />,
          ]}
        >
          <List.Item.Meta
            title="账户密码"
            description="其他用户的消息将以站内信的形式通知"
          />
        </List.Item>
        <List.Item
          actions={[
            <Switch checkedChildren="开" unCheckedChildren="关" key={2} />,
          ]}
        >
          <List.Item.Meta
            title="系统消息"
            description="系统消息将以站内信的形式通知"
          />
        </List.Item>
        <List.Item
          actions={[
            <Switch checkedChildren="开" unCheckedChildren="关" key={3} />,
          ]}
        >
          <List.Item.Meta
            title="待办任务"
            description="待办任务将以站内信的形式通知"
          />
        </List.Item>
      </List>
    </Card>
  )
}
