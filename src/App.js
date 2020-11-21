import React from 'react'
import { Router } from 'react-router-dom'
import { renderRoutes } from 'react-router-config'
import routes from 'configs/routes'
import { history } from 'utils'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import 'moment/locale/zh-cn'
import moment from 'moment'
// import MessageBox from 'components/MessageBox'
moment.locale('zh-cn')

const validateMessages = {
  required: "'${name}' 是必填字段",
}

export default function App() {
  return (
    <ConfigProvider locale={zhCN} form={{ validateMessages }}>
      <Router history={history}>
        {renderRoutes(routes)}
        {/* <MessageBox history={history} /> */}
      </Router>
    </ConfigProvider>
  )
}
