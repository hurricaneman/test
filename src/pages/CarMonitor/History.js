import React, { useEffect } from 'react'
import FormQuery from './FormQuery'
import { Table, message, Button } from 'antd'
import axios from 'axios'
import moment from 'moment'
import { bus } from 'utils'
import { useBus } from 'utils/hooks'
export default function History(props) {
  const { vin } = props
  const formRef = React.useRef()
  const [pagination, setPagination] = React.useState({ current: 1 })
  // const [updateHandle, update] = React.useReducer(x => !x, true)
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState([])

  const vehicleData = v => {
    bus.emit('@/CarMonitor/clean')
    bus.emit('@/CarMonitor/sendMaploading', true)
    axios
      .get('/vehicle/track/smallTrack', {
        params: {
          vin: vin,
          startTime: v.start_time,
          stopTime: v.stop_time,
          posType: 'gcj02',
        },
      })
      .then(({ data: res }) => {
        bus.emit('@/CarMonitor/sendMaploading', false)
        if (res.code !== 1) {
          message.error(res.msg)
          return
        } else {
          res.data.records.map(
            v =>
              (v.collectTime = moment(v.collectTime).format(
                'YYYY-MM-DD HH:mm:ss'
              ))
          )

          bus.emit('@/CarMonitor/live', {
            data: res.data.records,
            type: 'history',
          })
        }
        setLoading(false)
      })
      .catch(() => message.error('获取轨迹失败'), setLoading(false))
  }
  const showHistory = v => {
    bus.emit('@/CarMonitor/sendData')
    bus.emit('@/CarMonitor/sendCardData', v)
    vehicleData(v)
  }
  // 获取数据
  useBus('@/CarMonitor/loadData', opt => {
    const { vin } = opt
    if (!vin) {
      message.error('请选择车辆')
      return
    }
    const { current: form } = formRef
    const parmes = form.getFieldsValue()
    console.log(parmes)
    if (!parmes.startTime) {
      message.error('请选择开始时间')
      return
    }
    if (!parmes.endTime) {
      message.error('请选择结束时间')
      return
    }
    if (moment(parmes.endTime).valueOf() < moment(parmes.startTime).valueOf()) {
      message.error('开始时间不能大于结束时间，请重新选择')
      return
    }
    setLoading(true)
    const stopTime = moment(
      parmes.endTime ? parmes.endTime : Date.now(),
      'YYYY-MM-DD HH:mm:ss'
    ).valueOf()
    const startTime = moment(
      parmes.startTime ? parmes.startTime : Date.now(),
      'YYYY-MM-DD HH:mm:ss'
    ).valueOf()
    axios
      .get('/vehicle/track/vehicleTripList?', {
        params: {
          vin: vin,
          startTime,
          stopTime,
        },
      })
      .then(data => {
        const res = data.data.data
        if (res) {
          res.map((v, i) => (v['key'] = i))
          setPagination(v => ({ ...v, total: res.length }))
          setData(res)
        }
        setLoading(false)
      })
      .catch(e => {
        message.error(e)
        setLoading(false)
      })
  })

  useBus(
    '@/CarMonitor/sendData',
    () => {
      if (vin) {
        bus.emit('@/CarMonitor/setHistoryType', { vin, type: true })
      }
    },
    [vin]
  )
  // 初始化数据
  useEffect(() => {
    bus.on('@/CarMonitor/resetData', () => {
      bus.emit('@/CarMonitor/resetForm')
      setData([])
      setPagination(v => ({ ...v, total: 0 }))
    })
    return () => {
      bus.off('@/CarMonitor/resetData')
    }
  }, [])
  const onQuery = () => {
    setPagination({ current: 1 }), bus.emit('@/CarMonitor/loadData', { vin })
  }
  return (
    <div>
      <FormQuery
        style={{ marginBottom: 12 }}
        wrappedComponentRef={formRef}
        onQuery={onQuery}
      />
      <Table
        rowKey="id"
        loading={loading}
        columns={[
          { dataIndex: 'vin', title: 'VIN', fixed: 'left' },
          { dataIndex: 'time', title: '时间（小时）' },
          { dataIndex: 'vehicleType', title: '车型' },
          {
            dataIndex: 'start_time',
            title: '开始时间',
            render: v => moment(v).format('YYYY-MM-DD HH:mm:ss'),
          },
          {
            dataIndex: 'stop_time',
            title: '结束时间',
            render: v => moment(v).format('YYYY-MM-DD HH:mm:ss'),
          },
          // {
          //   dataIndex: 'is_over',
          //   title: '是否结束',
          //   render: v => (v === 0 ? '否' : '是'),
          // },
          {
            dataIndex: '',
            title: '轨迹',
            render: v => (
              <Button
                type="primary"
                size="small"
                onClick={() => showHistory(v)}
              >
                轨迹显示
              </Button>
            ),
          },
        ]}
        className="table"
        pagination={{ pageSize: 10, ...pagination }}
        dataSource={data}
        onChange={pagination => {
          setPagination(v => ({ ...v, current: pagination.current }))
        }}
      />
    </div>
  )
}
