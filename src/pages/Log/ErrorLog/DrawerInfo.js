import React from 'react'
import { Drawer } from 'antd'
import styles from './Dreawerinfo.module.scss'

export default function DrawerInfo(props) {
  const { visible, onCancel, record } = props
  return (
    <Drawer
      width={1200}
      placement="right"
      closable={false}
      onClose={onCancel}
      visible={visible}
    >
      <Descriptions title="请求url" content={record.url}></Descriptions>
      <Descriptions
        title="请求方式"
        content={record.operationType}
      ></Descriptions>
      <Descriptions
        title="请求参数"
        Jsonflag={true}
        content={record.operationContent}
      ></Descriptions>
      <Descriptions title="操作IP" content={record.ip}></Descriptions>
      <Descriptions title="IP归属地" content={record.area}></Descriptions>
      <Descriptions
        title="User-Agent"
        content={record.userAgent}
      ></Descriptions>
      <Descriptions title="创建时间" content={record.createTime}></Descriptions>
      <Descriptions title="异常信息" content={record.content}></Descriptions>
    </Drawer>
  )
}

function Descriptions(props) {
  const { title, content, Jsonflag = false } = props
  return (
    <div className={styles.box}>
      <div className={styles.title}>{title}</div>
      {Jsonflag ? (
        <div className={styles.content}>
          {content ? (
            <pre className={styles.code}>
              {JSON.stringify(JSON.parse(content), null, 2)}
            </pre>
          ) : null}
        </div>
      ) : (
        <div className={styles.content}>{content}</div>
      )}
    </div>
  )
}
