import React from 'react'
import { Drawer } from 'antd'
import styles from './Dreawerinfo.module.scss'

export default function DrawerInfo(props) {
  const { visible, onCancel, record } = props
  return (
    <Drawer
      placement="right"
      closable={false}
      onClose={onCancel}
      visible={visible}
      width={480}
    >
      <Descriptions title="用户名" content={record.userName}></Descriptions>
      <Descriptions title="操作类型" content={record.operation}></Descriptions>
      <Descriptions title="状态" content={record.status}></Descriptions>
      <Descriptions title="操作IP" content={record.ip}></Descriptions>
      <Descriptions title="IP归属地" content={record.area}></Descriptions>
      <Descriptions
        title="User-Agent"
        content={record.userAgent}
      ></Descriptions>
      <Descriptions title="创建时间" content={record.createTime}></Descriptions>
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
