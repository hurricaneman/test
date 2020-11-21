/* eslint-disable react/jsx-key */
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import LoginStyle1 from './loginStyle1'
import LoginStyle2 from './loginStyle2'
import LoginStyle3 from './loginStyle3'
import { message, Spin } from 'antd'
export default function Login() {
  const [index, setIndex] = useState()
  useEffect(() => {
    axios
      .get('/sys/loginPageStyle')
      .then(res => {
        if (res.data.code === 1) {
          // setIndex(res.data.data)
          setIndex(1)
        } else {
          setIndex(1)
          message.error('获取登录主题失败，使用默认主题')
        }
      })
      .catch(() => {
        setIndex(1)
        message.error('网络连接失败，请检查网络')
      })
  }, [])
  const list = [
    <LoginStyle1></LoginStyle1>,
    <LoginStyle2></LoginStyle2>,
    <LoginStyle3></LoginStyle3>,
  ]
  return index ? list[index - 1] : <Loading></Loading>
}

function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '100vh',
        alignItems: 'center',
      }}
    >
      <Spin size="large" />
    </div>
  )
}
