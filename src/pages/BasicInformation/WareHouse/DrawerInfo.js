import React from 'react'
import { Drawer } from 'antd'
import styles from './Dreawerinfo.module.scss'
import { Map, Circle } from 'react-amap'
import { session } from 'utils'

export default function DrawerInfo(props) {
  const { visible, onCancel, record } = props
  const [position] = React.useState({
    longitude: 114.291272,
    latitude: 30.60403,
  })
  return (
    <Drawer
      width={600}
      placement="right"
      closable={true}
      onClose={() => {
        console.log('xxx')
        onCancel()
      }}
      // onClose={onCancel}
      visible={visible}
    >
      <Descriptions title="网点名称" content={record.name} />
      <Descriptions title="网点代码" content={record.code} />
      <Descriptions title="经销商" content={record.dealerName} />
      <Descriptions
        title="网点分类"
        content={['主库', '二库', '合作二网', '直营二网'][record.type]}
      />
      <Descriptions title="网点地址" content={record.address} />
      <Descriptions title="二网拍照账号" content={record.staffUsername} />
      <Descriptions title="围栏半径(km)" content={record.radius} />
      <Descriptions title="有效标志" content={record.status} />
      <Descriptions title="创建时间" content={record.createTime} />
      <Descriptions
        title=""
        content={
          <div style={{ width: 546, height: 340, marginBottom: 12 }}>
            <Map
              amapkey={'f97efc35164149d0c0f299e7a8adb3d2'}
              plugins={['ToolBar']}
              zoom={13}
              center={
                record.longitude && record.latitude
                  ? { longitude: record.longitude, latitude: record.latitude }
                  : position
              }
            >
              {record.longitude && record.latitude && (
                <Circle
                  center={{
                    longitude: record.longitude,
                    latitude: record.latitude,
                  }}
                  radius={record.radius * 1000}
                  style={{
                    strokeColor: session['@/System/CssUrl']
                      ? 'var(--PC)'
                      : '#1890ff',
                    strokeOpacity: 0.3,
                    fillColor: session['@/System/CssUrl']
                      ? 'var(--PC)'
                      : '#1890ff',
                    fillOpacity: 0.3,
                  }}
                ></Circle>
              )}
            </Map>
          </div>
        }
      />
    </Drawer>
  )
}

function Descriptions(props) {
  const { title, content } = props
  return (
    <div className={styles.box}>
      <div className={styles.title}>{title ? title + ':' : ''}</div>
      <div className={styles.content}>{content}</div>
    </div>
  )
}
