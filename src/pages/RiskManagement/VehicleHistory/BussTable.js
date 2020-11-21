import React from 'react'
import { Card, message } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import TableX from 'components/TableX'
import LongTextThumb from 'components/LongTextThumb'
import PageWrapper from 'components/PageWrapper'

export default function OperationLog() {
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()

  function request({ pageIndex, pageSize, fields }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(`/operationlog/list`, {
        pageIndex,
        pageSize,
        ...fields,
      })
      .then(res => {
        if (!checkres(res)) return
        if (res && res.data.code === 1) {
          return { list: res.data.data.records, total: res.data.data.total }
        } else {
          message.error(res.data.msg)
        }
      })
  }

  return (
    <PageWrapper>
      <Card>
        <TableX
          scroll={{ x: 1200 }}
          ref={tableXRef}
          rowKey="id"
          request={request}
          columns={[
            {
              dataIndex: 'userName',
              title: '车辆识别码',
              width: 80,
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'operation',
              title: '业务单号',
              width: 80,
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'url',
              title: '业务类型',
              width: 180,
              render: v => <LongTextThumb text={v} width={150} />,
            },
            {
              dataIndex: 'operationType',
              title: '申请日期',
              width: 80,
              render: v => <LongTextThumb text={v} width={120} />,
            },
            {
              dataIndex: 'operationContent',
              title: '审核日期',
              width: 180,
              render: v => <LongTextThumb text={v} width={150} />,
            },
            {
              dataIndex: 'totalTime',
              title: '审核状态',
              width: 100,
              render: v => (
                <LongTextThumb text={v ? v + 'ms' : v} width={100} />
              ),
            },
            {
              dataIndex: 'ip',
              title: '确认日期',
              width: 100,
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'area',
              title: '还回日期',
              width: 120,
              render: v => <LongTextThumb text={v} width={120} />,
            },
            {
              dataIndex: 'userAgent',
              title: '审核人',
              width: 180,
              render: v => <LongTextThumb text={v} width={180} />,
            },
          ]}
        />
      </Card>
    </PageWrapper>
  )
}
