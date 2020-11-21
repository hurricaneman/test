import React from 'react'
import { Card, message } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import TableX from 'components/TableX'
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
          scroll={{ x: 1600 }}
          ref={tableXRef}
          rowKey="id"
          request={request}
          columns={[
            {
              dataIndex: 'userName',
              title: '车辆识别码',
              width: 80,
            },
            {
              dataIndex: 'operation',
              title: '业务',
              width: 80,
            },
            {
              dataIndex: 'url',
              title: '仓科名称',
              width: 180,
            },
            {
              dataIndex: 'operationType',
              title: '任务时间',
              width: 80,
            },
            {
              dataIndex: 'operationContent',
              title: '仓库坐标',
              width: 180,
            },
            {
              dataIndex: 'totalTime',
              title: '拍照坐标',
              width: 100,
            },
            {
              dataIndex: 'ip',
              title: '偏移距离',
              width: 100,
            },
            {
              dataIndex: 'area',
              title: '车辆状态',
              width: 120,
            },
            {
              dataIndex: 'userent',
              title: '拍照时间',
              width: 180,
            },
            {
              dataIndex: 'creaTime',
              title: '任务单号',
              width: 120,
            },
            {
              dataIndex: 'creatme',
              title: '盘点单号',
              width: 120,
            },
          ]}
        />
      </Card>
    </PageWrapper>
  )
}
