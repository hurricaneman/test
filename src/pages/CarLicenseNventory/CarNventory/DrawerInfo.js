import React from 'react'
import { Drawer, Card } from 'antd'
import DetailTable from './DetailTable'
export default function DrawerInfo(props) {
  const { visible, onCancel, record } = props
  console.log(props)
  return (
    <Drawer
      width={1500}
      placement="right"
      closable={true}
      onClose={onCancel}
      visible={visible}
    >
      <Card title="车辆盘点详情">
        <DetailTable record={record}></DetailTable>
      </Card>
    </Drawer>
  )
}
