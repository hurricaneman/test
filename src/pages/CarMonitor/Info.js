import React from 'react'
import FormQuery from './FormQuery'
import { Table, message } from 'antd'
import axios from 'axios'
import moment from 'moment'
import { checkres } from 'utils'
export default function Info(props) {
  const { vin } = props
  const formRef = React.useRef()
  const [data, setData] = React.useState([])
  const [pageIdx, setPageIdx] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!vin) return
    const { current: form } = formRef
    const parmes = form.getFieldsValue()
    if (!parmes.startTime) {
      // message.error('请选择开始时间')
      return
    }
    if (!parmes.endTime) {
      // message.error('请选择结束时间')
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
    ).format('YYYY-MM-DD HH:mm:ss')
    const startTime = moment(
      parmes.startTime ? parmes.startTime : Date.now(),
      'YYYY-MM-DD HH:mm:ss'
    ).format('YYYY-MM-DD HH:mm:ss')
    axios
      .get('/vehicle/track/vehicleMonitoringInformation', {
        params: {
          pageIdx: pageIdx,
          pageSize: pageSize,
          vin: vin,
          startDate: startTime,
          endDate: stopTime,
        },
      })
      .then(res => {
        setLoading(false)
        if (!checkres(res)) return
        setData(res.data.data.records)
        setTotal(res.data.data.total)
      })
  }, [vin, pageIdx, pageSize])
  const onQuery = () => {
    if (!vin) {
      message.error('请选择车辆')
      return
    }
    const { current: form } = formRef
    const parmes = form.getFieldsValue()
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
    ).format('YYYY-MM-DD HH:mm:ss')
    const startTime = moment(
      parmes.startTime ? parmes.startTime : Date.now(),
      'YYYY-MM-DD HH:mm:ss'
    ).format('YYYY-MM-DD HH:mm:ss')
    axios
      .get('/vehicle/track/vehicleMonitoringInformation', {
        params: {
          pageIdx: pageIdx,
          pageSize: pageSize,
          vin: vin,
          startDate: startTime,
          endDate: stopTime,
        },
      })
      .then(res => {
        setLoading(false)
        if (!checkres(res)) return
        setData(res.data.data.records)
        setTotal(res.data.data.total)
      })
  }

  return (
    <div>
      <FormQuery
        style={{ marginBottom: 12 }}
        wrappedComponentRef={formRef}
        onQuery={onQuery}
        noRest={true}
      />
      <Table
        rowKey="id"
        loading={loading}
        columns={[
          { dataIndex: 'index', title: '序号', render: (v, o, i) => i + 1 },
          { dataIndex: 'vin', title: 'VIN' },
          { dataIndex: 'longitude', title: '经度' },
          { dataIndex: 'latitude', title: '纬度' },
          { dataIndex: 'speed', title: '速度' },
          { dataIndex: 'totalVoltage', title: '总电压' },
          { dataIndex: 'soc', title: 'SOC' },
          { dataIndex: 'gears', title: '挡位' },
        ]}
        className="table"
        dataSource={data}
        pagination={{
          current: pageIdx,
          pageSize: pageSize,
          total: total,
          onChange: (page, pageSize) => {
            setPageIdx(page)
            setPageSize(pageSize)
          },
        }}
      />
    </div>
  )
}
