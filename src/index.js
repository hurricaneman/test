import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import * as serviceWorker from './serviceWorker'
import App from 'App'
import axios from 'axios'
import { SERVER } from 'configs/service'
import { session, history } from 'utils'
import { message } from 'antd'
import { debounce } from 'lodash'

const jump = debounce(() => {
  message.info('登录已过期，请重新登陆')
  history.push('/login')
}, 600)

axios.defaults.baseURL = SERVER
axios.defaults.headers.common.Authorization = session.Authorization
axios.interceptors.response.use(res => {
  if (res.data.code === 401) jump()
  return res
})

if (session['@/System/CssUrl'])
  document.getElementById('link-theme').href = session['@/System/CssUrl']

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
