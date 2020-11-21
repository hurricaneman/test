import React from 'react'
import { Tabs, Card, Table, Button, Badge, message, PageHeader } from 'antd'
import LongTextThumb from 'components/LongTextThumb'
import axios from 'axios'
import { checkres, bus, linkWithParams } from 'utils'
import { useHead } from 'utils/hooks'
const { TabPane } = Tabs

export default function Message() {
  const [data, setData] = React.useState([])
  const [pageIndex, setpageIndex] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [rowKeys, setRowKeys] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()
  const [type, setType] = React.useState('-1')
  const [updateHandle, update] = React.useReducer(x => !x, false)
  const headFixd = useHead()

  React.useEffect(() => {
    if (!type) return
    setLoading(true)
    axios
      .get('/message/page', {
        params: {
          pageIndex: pageIndex,
          pageSize: pageSize,
          msgType: type,
        },
      })
      .then(res => {
        setLoading(false)
        if (!checkres(res)) return
        setData(res.data.data.records)
        setTotal(res.data.data.total)
      })
  }, [type, pageIndex, pageSize, updateHandle])

  React.useEffect(() => {
    axios
      .get('/message/unreadMessages', {
        params: {},
      })
      .then(res => {
        if (!checkres(res)) return
        bus.emit('@/System/message/unReadNum', res.data.data.total)
      })
  }, [updateHandle])

  function callback(key) {
    setType(key)
    setRowKeys([])
    setRowKeysStr(null)
    setpageIndex(1)
    setPageSize(10)
  }
  const columns = [
    {
      dataIndex: 'msgTitle',
      title: <span style={{ marginLeft: 26 }}>预警标题</span>,
      width: 120,
      render: (v, record) => (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          {record.readStatus === 1 ? (
            <Badge style={{ marginRight: 12 }} status="error" />
          ) : (
            <div style={{ marginRight: 12, width: 14, height: 22 }} />
          )}
          <LongTextThumb text={v} width={120} />
        </div>
      ),
    },
    {
      dataIndex: 'msgContent',
      title: '消息内容',
      width: 360,
      render: v => <LongTextThumb text={v} width={260} />,
    },
    {
      dataIndex: 'msgType',
      title: '消息类型',
      width: 120,
      render: v => ['车辆预警', '区域预警', '事故预警', '自定义预警'][v],
    },
    {
      dataIndex: 'createTime',
      title: '预警时间',
      width: 200,
    },
    {
      dataIndex: '',
      title: <span style={{ marginLeft: 15 }}>操作</span>,
      fixed: 'right',
      width: 180,
      render: record => (
        <div>
          <Button
            type="link"
            onClick={() => {
              axios.get('/message/updateIsRead', { params: { ids: record.id } })
              linkWithParams('/carMonitor', { ...record })
            }}
          >
            查看位置
          </Button>
          <Button
            style={{ marginLeft: 12 }}
            type="link"
            onClick={() => {
              axios.get('/message/updateIsRead', { params: { ids: record.id } })
              if (record.msgType === 1) {
                linkWithParams('/vehicleAreaWarning', { ...record })
              } else {
                linkWithParams('/safety-warning', { ...record })
              }
            }}
          >
            预警处理
          </Button>
        </div>
      ),
    },
  ]
  return (
    <>
      <PageHeader
        style={
          headFixd
            ? {
                position: 'sticky',
                zIndex: 99,
                top: 0,
              }
            : {}
        }
        title="消息列表"
        ghost={false}
        breadcrumb={{
          routes: [{ breadcrumbName: '首页' }],
          itemRender: r => <span>{r.breadcrumbName}</span>,
        }}
      />
      <div style={{ padding: 16 }}>
        <Card>
          <Tabs defaultActiveKey={type} onChange={callback}>
            <TabPane tab="全部消息" key="-1"></TabPane>
            <TabPane tab="车辆预警" key="0"></TabPane>
            <TabPane tab="自定义预警" key="3"></TabPane>
            <TabPane tab="事故预警" key="2"></TabPane>
            <TabPane tab="区域预警" key="1"></TabPane>
          </Tabs>
          <div style={{ marginBottom: 12 }}>
            <Button
              disabled={rowKeys.length === 0 ? true : false}
              onClick={() => {
                axios
                  .get('/message/delete', { params: { ids: rowKeysStr } })
                  .then(res => {
                    if (!checkres(res)) return
                    message.success('删除成功')
                    update()
                    setRowKeys([])
                    setRowKeysStr(null)
                  })
              }}
            >
              删除
            </Button>
            <Button
              disabled={rowKeys.length === 0 ? true : false}
              style={{ marginLeft: 12 }}
              onClick={() => {
                axios
                  .get('/message/updateIsRead', { params: { ids: rowKeysStr } })
                  .then(res => {
                    if (!checkres(res)) return
                    message.success('标记已读成功')
                    update()
                    setRowKeys([])
                    setRowKeysStr(null)
                  })
              }}
            >
              标记已读
            </Button>
            <Button
              style={{ marginLeft: 12 }}
              onClick={() => {
                axios.get('/message/updateIsAllRead').then(res => {
                  if (!checkres(res)) return
                  message.success('全部标记已读成功')
                  update()
                })
              }}
            >
              全部已读
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pageIndex,
              pageSize: pageSize,
              total: total,
              onChange: (page, pageSize) => {
                setpageIndex(page)
                setPageSize(pageSize)
              },
            }}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: rowKeys,
              onChange: selectRowKeys => {
                let str = ''
                selectRowKeys.map(v => (str += v + ','))
                setRowKeysStr(str)
                setRowKeys(selectRowKeys)
              },
            }}
          />
        </Card>
      </div>
    </>
  )
}
