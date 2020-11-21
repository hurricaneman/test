import React from 'react'
import { Drawer, Tabs } from 'antd'
//import moment from 'moment'
import BussTable from './BussTable'
import CarTable from './CarTable'

import { PicCenterOutlined, PicRightOutlined } from '@ant-design/icons'
const { TabPane } = Tabs
export default function DrawerInfo(props) {
  const { visible, onCancel, record } = props

  return (
    <Drawer
      width={1400}
      placement="right"
      closable={true}
      onClose={onCancel}
      visible={visible}
    >
      <Tabs defaultActiveKey="2">
        <TabPane
          tab={
            <span>
              <PicCenterOutlined />
              业务明细
            </span>
          }
          key="1"
        >
          <BussTable record={record} />
        </TabPane>
        <TabPane
          tab={
            <span>
              <PicRightOutlined />
              车辆状态计算
            </span>
          }
          key="2"
        >
          <CarTable record={record} />
        </TabPane>
      </Tabs>
    </Drawer>
  )
}
