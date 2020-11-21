import React from 'react'
import { Card, message, DatePicker, Button, AutoComplete, Select } from 'antd'
import axios from 'axios'
import TableX from 'components/TableX'
import PageWrapper from 'components/PageWrapper'
import moment from 'moment'
import keys from './keys'
import DetailModal from './DetailModal'
// import SelectEnterprise from 'components/SelectEnterprise'
// import SelectVehicleType from 'components/SelectVehicleType'
import { checkres } from 'utils'
import { SERVERDFWL } from 'configs/service'

const { RangePicker } = DatePicker

export default function Power() {
  const tableXRef = React.useRef()

  const [modal, setModal] = React.useState(null)
  // const [enterprise, setEnterprise] = React.useState(undefined)
  // const [vehicleType, setVehicleType] = React.useState(undefined)
  const [vins, setVins] = React.useState([])

  function request({ pageIndex, pageSize, fields }) {
    const { time, vin, ...restFields } = fields

    if (!vin) {
      message.info('请输入VIN进行精确查询')
      return
    }
    const out = { vin, ...restFields }
    if (time && time.length == 2) {
      out.startDate = moment(time[0]).format('YYYY-MM-DD HH:mm:00')
      out.endDate = moment(time[1]).format('YYYY-MM-DD HH:mm:59')
    } else {
      message.warn('请选择时间')
      return
    }
    return axios
      .get(`/historyData/page`, {
        params: { pageIndex, pageSize, ...out },
        baseURL: SERVERDFWL,
      })
      .then(({ data: res }) => {
        if (res && res.code === 1) {
          return { list: res.data.records, total: res.data.total }
        } else {
          message.error(res.msg)
        }
      })
  }

  const columns = [
    {
      title: '序号',
      dataIndex: '',
      width: 80,
      fixed: 'left',
      render: (t, r, i) => i + 1,
      required: true,
    },
    ...Object.entries(keys)
      .map(([dataIndex, title]) => {
        const column = {
          render: t => (Array.isArray(t) ? t.join(',') : t),
          ellipsis: true,
          width: 150,
        }
        if (typeof title === 'string') return { ...column, dataIndex, title }
        return {
          ...column,
          ...title,
          dataIndex,
        }
      })
      .filter(v => !!v.title),
    {
      title: '操作',
      dataIndex: 'id',
      fixed: 'right',
      width: 100,
      render: (t, r) => (
        <Button type="link" onClick={() => setModal(r)}>
          查看
        </Button>
      ),
    },
  ]

  // function setFieldValue(name) {
  //   const { form } = tableXRef.current
  //   form.resetFields([name])
  // }

  // React.useEffect(() => {
  //   setVehicleType(undefined)
  //   setFieldValue('vehicleType', undefined)
  // }, [enterprise])

  // React.useEffect(() => {
  //   setVins([])
  //   setFieldValue('vin', undefined)
  // }, [vehicleType])

  function onVinSearch(input) {
    axios
      .get('/vehicleInfo/page', {
        params: {
          pageIndex: 1,
          pageSize: -1,
          // enterpriseName: enterprise,
          // vehicleTypeName: vehicleType,
          vin: input,
        },
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return
        setVins(res.data.data.records.map(v => v.vin))
      })
  }

  return (
    <PageWrapper>
      <Card>
        <TableX
          ref={tableXRef}
          request={request}
          scroll={{ x: 'max-content' }}
          rowKey="id"
          searchForm={[
            // {
            //   label: '企业名称',
            //   name: 'enterprise',
            //   component: (
            //     <SelectEnterprise onSelect={setEnterprise} allowClear />
            //   ),
            // },
            // {
            //   label: '车型名称',
            //   name: 'vehicleType',
            //   component: (
            //     <SelectVehicleType
            //       enterpriseName={enterprise}
            //       onSelect={setVehicleType}
            //       allowClear
            //     />
            //   ),
            // },
            {
              label: 'VIN',
              name: 'vin',
              component: (
                <AutoComplete
                  allowClear
                  onSearch={onVinSearch}
                  style={{ width: 180 }}
                >
                  {vins.map(v => (
                    <AutoComplete.Option key={v} value={v}>
                      {v}
                    </AutoComplete.Option>
                  ))}
                </AutoComplete>
              ),
            },
            {
              label: '时间',
              name: 'time',
              component: (
                <RangePicker
                  format="YYYY-MM-DD HH:mm"
                  showTime={{ format: 'HH:mm' }}
                  allowClear={false}
                />
              ),
            },
            {
              label: '经纬度状态',
              name: 'historyType',
              component: (
                <Select>
                  <Select.Option value={-1}>全部</Select.Option>
                  <Select.Option value={0}>正常</Select.Option>
                  <Select.Option value={1}>异常</Select.Option>
                </Select>
              ),
            },
          ]}
          searchFormInitialValues={{
            time: [moment().subtract(1, 'days'), moment()],
            historyType: -1,
          }}
          columns={columns}
        />
      </Card>
      {modal && (
        <DetailModal
          visible={!!modal}
          modal={modal}
          onCancel={() => setModal(null)}
        />
      )}
    </PageWrapper>
  )
}
