import React from 'react'
import { Card, message } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import TableX from 'components/TableX'
import LongTextThumb from 'components/LongTextThumb'
import Options from 'components/TableX/Options'
import { saveAs } from 'file-saver'
import DrawerInfo from './DrawerInfo.js'
import PageWrapper from 'components/PageWrapper'

export default function ErrorLog() {
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()
  const [record] = React.useState({})
  const [drawerInfo, setDrawerInfo] = React.useState({ visible: false })

  function request({ pageIndex, pageSize, fields }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(`/exceptionlog/list`, {
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
        <DrawerInfo
          record={record}
          onCancel={() => setDrawerInfo({ visible: false })}
          {...drawerInfo}
        ></DrawerInfo>
        <TableX
          scroll={{ x: 1300 }}
          ref={tableXRef}
          rowKey="id"
          request={request}
          toolbarButtons={[
            {
              label: '导出当前',
              onClick: () =>
                axios
                  .post(
                    '/exceptionlog/export',
                    { ...paramsRef.current, flag: true },
                    {
                      responseType: 'blob',
                    }
                  )
                  .then(res => saveAs(res.data, '异常日志导出.xls')),
            },
            {
              label: '导出全部',
              onClick: () =>
                axios
                  .post(
                    '/exceptionlog/export',
                    { ...paramsRef.current, flag: false },
                    {
                      responseType: 'blob',
                    }
                  )
                  .then(res => saveAs(res.data, '异常日志导出.xls')),
            },
          ]}
          columns={[
            {
              dataIndex: 'url',
              title: '请求url',
              width: 180,
              render: v => <LongTextThumb text={v} width={180} />,
            },
            {
              dataIndex: 'operationType',
              title: '请求方式',
            },
            {
              dataIndex: 'operationContent',
              title: '请求参数',
              width: 180,
              render: v => <LongTextThumb text={v} width={180} />,
            },
            {
              dataIndex: 'ip',
              title: '操作IP',
            },
            {
              dataIndex: 'area',
              title: 'IP归属地',
              width: 120,
              render: v => <LongTextThumb text={v} width={120} />,
            },
            {
              dataIndex: 'userAgent',
              title: 'User-Agent',
              width: 180,
              render: v => <LongTextThumb text={v} width={180} />,
            },
            {
              dataIndex: 'createTime',
              title: '创建时间',
            },
            {
              dataIndex: '',
              title: <span style={{ marginLeft: 15 }}>操作</span>,
              fixed: 'right',
              width: 80,
              render: record => (
                <Options
                  buttons={[
                    {
                      label: '异常信息',
                      onClick: () => {
                        record &&
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
