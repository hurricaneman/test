import React from 'react'
import { Card, message, Tag, Button } from 'antd'
import axios from 'axios'
import { checkres, session } from 'utils'
import TableX from 'components/TableX'
import LongTextThumb from 'components/LongTextThumb'
// import { saveAs } from 'file-saver'
import DrawerInfo from './DrawerInfo.js'

export default function Loginlog() {
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()
  const [record] = React.useState({})
  const [drawerInfo, setDrawerInfo] = React.useState({ visible: false })

  function request({ pageIndex, pageSize, fields }) {
    fields.userName = session.userData.username
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(`/loginlog/list`, {
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
    <Card bordered={false} title="登录日志">
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
        searchForm={[
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
        // toolbarExtra={
        //   <Button
        //     onClick={() =>
        //       axios
        //         .post('/loginlog/export', paramsRef.current, {
        //           responseType: 'blob',
        //         })
        //         .then(res => saveAs(res.data, '登录日志导出.xls'))
        //     }
        //   >
        //     导出
        //   </Button>
        // }
        columns={[
          {
            dataIndex: 'userName',
            title: '用户名',
            width: 120,
          },
          {
            dataIndex: 'operation',
            title: '操作类型',
            width: 120,
          },
          {
            dataIndex: 'status',
            title: '状态',
            width: 120,
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
            width: 150,
          },
          {
            dataIndex: 'area',
            title: 'IP归属地',
            width: 180,
            render: v => <LongTextThumb text={v} width={180} />,
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
            width: 180,
          },
          {
            dataIndex: '',
            title: <span style={{ marginLeft: 15 }}>操作</span>,
            fixed: 'right',
            width: 150,
            render: record => (
              <Button
                type="link"
                onClick={() => {
                  record &&
                    setDrawerInfo({
                      visible: true,
                      record,
                    })
                }}
              >
                详情信息
              </Button>
            ),
          },
        ]}
      />
    </Card>
  )
}
