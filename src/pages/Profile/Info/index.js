import React, { useEffect } from 'react'
import { Tabs, message, Card } from 'antd'
import Basic from './Basic'
import Safe from './Safe'
// import Message from './Message'
import Log from './Log'
import { session } from 'utils'
import axios from 'axios'
// import { useHead } from 'utils/hooks'
import PageWrapper from 'components/PageWrapper'

const { TabPane } = Tabs

export default function Info() {
  const [userData, setUserData] = React.useState({})
  // const headFixd = useHead()
  useEffect(() => {
    axios
      .get('/user/info/detail', {
        params: { userId: session.userData.userId },
      })
      .then(res => {
        if (res.data.code === 1) {
          setUserData(res.data.data)
          session.userData = res.data.data
        } else {
          message.error(res.data.msg)
        }
      })
  }, [])

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
        title="个人中心"
        ghost={false}
        breadcrumb={{
          routes: [
            { breadcrumbName: '个人设置' },
            { breadcrumbName: '个人中心' },
          ],
          itemRender: r => <span>{r.breadcrumbName}</span>,
        }}
      ></PageHeader> */}
      <PageWrapper>
        <Card title="个人中心">
          <Tabs tabPosition="left">
            <TabPane tab="基本设置" key="1">
              <Basic record={userData}></Basic>
            </TabPane>
            <TabPane tab="安全设置" key="2">
              <Safe></Safe>
            </TabPane>
            {/* 未完成的功能 隐藏 */}
            {/* <TabPane tab="新消息通知" key="3">
              <Message></Message>
            </TabPane> */}
            <TabPane tab="登陆日志" key="4">
              <Log></Log>
            </TabPane>
          </Tabs>
        </Card>
      </PageWrapper>
    </>
  )
}
