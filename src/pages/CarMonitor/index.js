/* eslint-disable prettier/prettier */
import React, { useEffect } from 'react'
import {
  Card,
  Tabs,
  message,
  // Row,
  // Col,
  Switch,
  Empty,
  Descriptions,
  Button,
  Form,
  Select,
} from 'antd'
import CarTree from './CarTree'
import Amap from './Amap'
import History from './History'
import Info from './Info'
import { bus, checkres } from 'utils'
import { useBus } from 'utils/hooks'
import { SERVER_ML_WS, SERVERDFWL } from 'configs/service'
// import axios from 'axios'
import moment from 'moment'
import Map from './Map'
import PageWrapper from 'components/PageWrapper'
import { useLinkParams } from 'utils/hooks'
import axios from 'axios'

const { TabPane } = Tabs
const { Option } = Select

export default function CameraMonitor(props) {
  const { location } = props
  const [vin, setVin] = React.useState()
  const isHistory = React.useRef(false)
  const webs = React.useRef()
  const [multiplyMode, setMultiplyMode] = React.useState(false)
  const [cleanMultilplyMap, setClean] = React.useReducer(x => !x, true)
  const [baseInfo, setBaseInfo] = React.useState()
  const [DEALEROptions, setDEALEROptions] = React.useState([])
  const [form] = Form.useForm()

  useEffect(() => {
    axios
      .post(
        '/dealer/page',
        { pageIndex: 1, pageSize: 100000 },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return
        const list = []
        res.data.data.records.map(v =>
          list.push({ label: v.name, value: v.id })
        )
        setDEALEROptions(list)
      })
  }, [])

  useLinkParams(linkParams => {
    setVin(linkParams.vin)
  })

  const getData = () => {
    isHistory.current = false
    const carList = []
    if (vin) {
      const ws = new WebSocket(`${SERVER_ML_WS}/MLWebsocket`)
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            scenesId: '0',
            vins: vin ? vin : '',
          })
        )
      }
      ws.onmessage = e => {
        if (multiplyMode) {
          const data = JSON.parse(e.data)
          const { car: raw } = data
          if (!raw) return
          const car = {
            ...raw,
            lon: raw.location?.[0] || 0,
            lat: raw.location?.[1] || 0,
            // timestamp,
          }
          const index = carList.findIndex(v => v.vin === raw.vin)
          if (index !== -1) carList[index] = car
          else carList.push(car)
          const out = [...carList]
          bus.emit('@/Map/CarList', { carList: out })
        } else {
          const msg = JSON.parse(e.data)
          bus.emit('@/CarMonitor/live', { data: msg.car, type: 'live' })
          setBaseInfo(msg.car)
        }
      }
      ws.onclose = () => {
        // bus.emit('@/CarMonitor/resetForm')
        // bus.emit('@/CarMonitor/resetData')
        bus.emit('@/CarMonitor/clean')
      }
      webs.current = ws
    }
  }

  useEffect(() => {
    bus.emit('@/CarMonitor/resetForm')
    bus.emit('@/CarMonitor/resetData')
    bus.emit('@/CarMonitor/clean')
    getData()
    return () => {
      if (multiplyMode) {
        setClean()
      }
      setBaseInfo(undefined)
      webs.current?.close()
    }
  }, [vin])

  useBus(
    '@/Map/alive',
    () => {
      getData()
    },
    [vin]
  )

  useBus('@/CarMonitor/setHistoryType', opt => {
    //判断是否选择车辆
    if (!opt.vin) {
      message.error('请选择车辆')
      return
    }
    webs.current?.close()
    //查询数据
    // bus.emit('@/CarMonitor/loadData', opt)
  })

  const onSelect = v => {
    setVin(v)
  }

  return (
    <PageWrapper>
      <Card style={{marginBottom:12}}>
        <Form form={form} layout="inline">
          <Form.Item name="ids" label="经销商">
            <Select
              style={{ width: 900 }}
              mode="multiple"
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {DEALEROptions.map(v => (
                <Option key={v.value} value={v.value}>
                  {v.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              style={{ marginRight: 6 }}
              onClick={() => {
                const ids = form.getFieldValue('ids')
                const idsStr = ids.join(',')
                bus.emit('@/CarMonitor/getData', idsStr)
              }}
            >
              查询
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <div style={{ display: 'flex' }}>
        <Card
          style={{
            width: 340,
            marginRight: 12,
            minHeight: 'calc(100vh - 64px - 48px)',
          }}
          title="车辆列表"
          bodyStyle={{ padding: '16px 0 0 0' }}
          extra={
            <>
              <Switch
                defaultChecked={multiplyMode}
                checkedChildren="多车"
                unCheckedChildren="多车"
                onChange={checked => setMultiplyMode(checked)}
              />
            </>
          }
        >
          <CarTree
            showOnline={true}
            search={location.search}
            onSelect={onSelect}
            multiplyMode={multiplyMode}
          />
        </Card>
        {multiplyMode ? (
          <Card style={{ flex: 1 }} bodyStyle={{ height: '100%' }}>
            <Map cleanMultilplyMap={cleanMultilplyMap} />
          </Card>
        ) : (
          <Card style={{ flex: 1 }}>
            <Amap vin={vin} />
            <Tabs defaultActiveKey="3">
              <TabPane tab="车辆监控信息" key="3">
                <Info vin={vin} />
              </TabPane>
              <TabPane tab="车辆实时信息" key="1">
                {baseInfo ? (
                  <Descriptions>
                    <Descriptions.Item label="VIN">
                      {baseInfo.vin}
                    </Descriptions.Item>
                    <Descriptions.Item label="车型名称">
                      {baseInfo.vehicleType}
                    </Descriptions.Item>
                    <Descriptions.Item label="SOC状态">
                      {baseInfo.soc}%
                    </Descriptions.Item>
                    <Descriptions.Item label="当前车速">
                      {baseInfo.speed}km/h
                    </Descriptions.Item>
                    <Descriptions.Item label="车辆状态">
                      {baseInfo.vehicleStatus}
                    </Descriptions.Item>
                    <Descriptions.Item label="累计行驶里程">
                      {baseInfo.accumulativeMile}km
                    </Descriptions.Item>
                    <Descriptions.Item label="充电状态">
                      {baseInfo.chargingStatus}
                    </Descriptions.Item>
                    {/* <Descriptions.Item label="累计行驶时长">
                      {baseInfo.location[1]}
                    </Descriptions.Item> */}
                    <Descriptions.Item label="收集时间">
                      {moment(baseInfo.collectTime).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty />
                )}
              </TabPane>
              <TabPane tab="轨迹回放" key="2">
                <History vin={vin} />
              </TabPane>
            </Tabs>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
