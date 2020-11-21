import React from 'react'
import { Card, message, DatePicker, Select } from 'antd'
import axios from 'axios'
import { checkres, timeReturn } from 'utils'
import TableX from 'components/TableX'
import LongTextThumb from 'components/LongTextThumb'
import PageWrapper from 'components/PageWrapper'
//import TableSelect from 'components/TableSelect'
import DrawerInfo from './DrawerInfo.js'
import Options from 'components/TableX/Options'
import { SERVERDFWL } from 'configs/service'
// startTime: time[0].format('YYYYMMDD'),
// endTime: time[1].format('YYYYMMDD'),
const RangePicker = DatePicker.RangePicker
const Option = Select.Option

export default function OperationLog() {
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()
  const [record] = React.useState({})
  console.log(record)
  // const [recordlist, setRecord] = React.useState({})
  const [drawerInfo, setDrawerInfo] = React.useState({ visible: false })
  const [dealersOptions, setDealersOptions] = React.useState([])
  const [wareOptions, setWareOptions] = React.useState([])
  const [dealersId, setDealersId] = React.useState()

  console.log(dealersOptions, dealersId)
  function request({ pageIndex, pageSize, fields }) {
    console.log(fields)
    if (fields.time) {
      fields['beginTime'] = fields?.time[0].format('YYYY-MM-DD HH:MM:SS')
      fields['endTime'] = fields?.time[1].format('YYYY-MM-DD HH:MM:SS')
      delete fields['time']
    }
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(
        `/vehiclecheckrecord/queryvehiclecheckrecord`,
        {
          pageIndex,
          pageSize,
          ...fields,
        },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return
        if (res && res.data.code === 1) {
          return { list: res.data.data.records, total: res.data.data.total }
        } else {
          message.error(res.data.msg)
        }
      })
  }

  React.useEffect(() => {
    axios
      .get('/vehiclecheck/getdealerbysupervisors', {
        params: {},
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        setDealersOptions(res.data.data ? res.data.data : [])
      })
  }, [])

  React.useEffect(() => {
    axios
      .get('/vehiclecheck/getdealerwarehouse', {
        params: { dealerId: dealersId },
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        console.log(res)
        setWareOptions(res.data.data)
      })
  }, [dealersId])

  function handleSelectChange(value) {
    console.log(`selected ${value}`)
    setDealersId(value)
  }

  return (
    <PageWrapper>
      <Card>
        <DrawerInfo
          record={record}
          onCancel={() => setDrawerInfo({ visible: false })}
          {...drawerInfo}
        ></DrawerInfo>
        <TableX
          ref={tableXRef}
          rowKey="id"
          scroll={{ x: 1500 }}
          request={request}
          searchForm={[
            {
              label: '经销商',
              name: 'dealerId',
              preset: '',
              component: (
                <Select
                  showSearch
                  notFoundContent="无法找到"
                  id="select"
                  size="large"
                  style={{ width: 200 }}
                  onChange={handleSelectChange}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {dealersOptions.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              ),
            },
            {
              label: '网点分类',
              name: 'warehouseId',
              preset: '',
              component: (
                <Select id="select" size="large" style={{ width: 200 }}>
                  {wareOptions.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              ),
            },
            {
              label: '监管员',
              name: 'status',
              preset: 'text',
            },
            {
              label: '起止时间',
              name: 'time',
              preset: '',
              component: <RangePicker />,
            },
          ]}
          columns={[
            {
              dataIndex: 'checkReport',
              title: '盘点单号',
              width: 100,
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'dealerName',
              title: '经销商',
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'shouldNum',
              title: '账存数量',
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'alreadyNum',
              title: '实盘数量',
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'exceptionNum',
              title: '盘点差异',
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'beginTime',
              title: '盘点时间',
              width: 170,
            },
            {
              dataIndex: 'ip',
              title: '盘点耗时',
              render: (v, t) => timeReturn(t.beginTime, t.endTime),
            },
            {
              dataIndex: 'userName',
              title: '盘点人',
              render: v => <LongTextThumb text={v} width={120} />,
            },
            {
              dataIndex: 'warehouseName',
              title: '实际主库',
            },
            {
              dataIndex: 'warehouseType',
              title: '网点分类',

              render: v => {
                if (v == '0') {
                  return '主库'
                } else if (v == '1') {
                  return '二库'
                } else if (v == '2') {
                  return '合作二网'
                } else if (v == '3') {
                  return '直营二网'
                }
              },
            },
            {
              dataIndex: 'remark',
              title: '备注',
              render: v => <LongTextThumb text={v} width={180} />,
            },
            {
              dataIndex: 'options',
              title: '操作',
              width: 180,
              render: (r, record) => (
                <Options
                  buttons={[
                    {
                      label: '查看详情',
                      onClick: () => {
                        console.log(r)
                        setDrawerInfo({
                          visible: true,
                          record,
                        })
                      },
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </Card>
    </PageWrapper>
  )
}
