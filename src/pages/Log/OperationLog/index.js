import React from 'react'
import { Card, message, Tag } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import TableX from 'components/TableX'
import LongTextThumb from 'components/LongTextThumb'
import { saveAs } from 'file-saver'
import DrawerInfo from './DrawerInfo.js'
import Options from 'components/TableX/Options'
import PageWrapper from 'components/PageWrapper'

export default function OperationLog() {
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()
  const [record] = React.useState({})
  const [drawerInfo, setDrawerInfo] = React.useState({ visible: false })

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
        <DrawerInfo
          record={record}
          onCancel={() => setDrawerInfo({ visible: false })}
          {...drawerInfo}
        ></DrawerInfo>
        <TableX
          scroll={{ x: 1500 }}
          ref={tableXRef}
          rowKey="id"
          request={request}
          searchForm={[
            {
              label: '用户名',
              name: 'userName',
              preset: 'text',
            },
            {
              label: '状态',
              name: 'status',
              preset: 'select',
              options: [
                { label: '失败', value: '失败' },
                { label: '成功', value: '成功' },
              ],
            },
          ]}
          toolbarButtons={[
            {
              label: '导出当前',
              onClick: () =>
                axios
                  .post(
                    '/operationlog/export',
                    { ...paramsRef.current, flag: true },
                    {
                      responseType: 'blob',
                    }
                  )
                  .then(res => saveAs(res.data, '操作日志导出.xls')),
            },
            {
              label: '导出全部',
              onClick: () =>
                axios
                  .post(
                    '/operationlog/export',
                    { ...paramsRef.current, flag: false },
                    {
                      responseType: 'blob',
                    }
                  )
                  .then(res => saveAs(res.data, '操作日志导出.xls')),
            },
          ]}
          columns={[
            {
              dataIndex: 'userName',
              title: '用户名',
              width: 80,
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'operation',
              title: '操作类型',
              width: 80,
              render: v => <LongTextThumb text={v} width={100} />,
            },
            {
              dataIndex: 'url',
              title: '请求url',
              width: 180,
              render: v => <LongTextThumb text={v} width={150} />,
            },
            {
              dataIndex: 'operationType',
              title: '请求方式',
              width: 80,
              render: v => <LongTextThumb text={v} width={120} />,
            },
            {
              dataIndex: 'operationContent',
              title: '请求参数',
              width: 180,
              render: v => <LongTextThumb text={v} width={150} />,
            },
            {
              dataIndex: 'totalTime',
              title: '请求时长',
              width: 100,
              render: v => (
                <LongTextThumb text={v ? v + 'ms' : v} width={100} />
              ),
            },
            {
              dataIndex: 'status',
              title: '状态',
              width: 100,
              render: v =>
                v === '成功' ? (
                  <Tag color="green">{v}</Tag>
                ) : (
                  <Tag color="red">{v}</Tag>
                ),
            },
            {
              dataIndex: 'ip',
              title: '操作IP',
              width: 100,
              render: v => <LongTextThumb text={v} width={100} />,
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
              width: 120,
              render: v => <LongTextThumb text={v} width={120} />,
            },
            {
              dataIndex: '',
              title: <span style={{ marginLeft: 15 }}>操作</span>,
              fixed: 'right',
              width: 100,
              render: record => (
                <Options
                  buttons={[
                    {
                      label: '详情信息',
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
