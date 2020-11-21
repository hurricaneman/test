import React from 'react'
import { Card, Radio, message, Button } from 'antd'
import { Icon as LegacyIcon } from '@ant-design/compatible'
import axios from 'axios'
import img1 from './img/img1.png'
import img2 from './img/img2.png'
import img3 from './img/img3.png'
import styles from './style.module.scss'
import PageWrapper from 'components/PageWrapper'

export default function LoginSetting() {
  const [index, setIndex] = React.useState(1)
  const [loading, setLoading] = React.useState()
  React.useEffect(() => {
    axios.get('/sys/loginPageStyle').then(res => {
      if (res.data.code === 1) {
        setIndex(res.data.data * 1)
      } else {
        message.error('获取登录主题失败')
      }
    })
  }, [])
  function onSubmit() {
    if (!index) {
      message.info('请选择主题')
      return
    }
    setLoading(true)
    axios
      .get('/sys/setLoginPageStyle', { params: { style: index } })
      .then(res => {
        setLoading(false)
        if (res.data.code === 1) {
          message.success('设置登录主题成功')
        } else {
          message.error('设置登录主题失败')
        }
      })
  }
  return (
    <PageWrapper>
      <Card>
        <Radio.Group
          size="large"
          style={{ width: '100%' }}
          onChange={e => {
            setIndex(e.target.value)
          }}
          value={index}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <div className={styles.box}>
              <Radio value={1}>主题一</Radio>
              <div className={styles.imgbox}>
                <img src={img1} className={styles.img} />
                <div className={styles.zz}>
                  <LegacyIcon
                    type="eye"
                    className={styles.icon}
                    onClick={() => {
                      window.open(img1)
                    }}
                  ></LegacyIcon>
                </div>
              </div>
            </div>
            <div className={styles.box}>
              <Radio value={2}>主题二</Radio>
              <div className={styles.imgbox}>
                <img src={img2} className={styles.img} />
                <div className={styles.zz}>
                  <LegacyIcon
                    type="eye"
                    className={styles.icon}
                    onClick={() => {
                      window.open(img2)
                    }}
                  ></LegacyIcon>
                </div>
              </div>
            </div>
            <div className={styles.box}>
              <Radio value={3}>主题三</Radio>
              <div className={styles.imgbox}>
                <img src={img3} className={styles.img} />
                <div className={styles.zz}>
                  <LegacyIcon
                    type="eye"
                    className={styles.icon}
                    onClick={() => {
                      window.open(img3)
                    }}
                  ></LegacyIcon>
                </div>
              </div>
            </div>
          </div>
        </Radio.Group>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: 50,
            padding: 100,
          }}
        >
          <Button
            type="primary"
            style={{ width: 120 }}
            loading={loading}
            onClick={() => {
              onSubmit()
            }}
          >
            提交
          </Button>
        </div>
      </Card>
    </PageWrapper>
  )
}
