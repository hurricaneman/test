import React from 'react'
import { Card, Modal, message, Tag } from 'antd'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres } from 'utils'
import PageWrapper from 'components/PageWrapper'
import { saveAs } from 'file-saver'
import { SERVERDFWL } from 'configs/service'
import LongTextThumb from 'components/LongTextThumb'

export default function Dealer() {
  const recordRef = React.useRef({})
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()

  const [modalEdit, setModalEdit] = React.useState({
    visible: false,
  })
  const [rowKeys, setRowKeys] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()

  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(
        '/dealer/page',
        { pageIndex, pageSize, ...fields },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return []
        return {
          list: res.data.data.records,
          total: res.data.data.total,
        }
      })
  }

  return (
    <PageWrapper>
      <Card>
        <ModalEdit
          record={recordRef.current}
          onOk={() => tableXRef.current.update()}
          onCancel={() => setModalEdit({ visible: false })}
          {...modalEdit}
        />
        <TableX
          scroll={{ x: 2500 }}
          rowKey="id"
          ref={tableXRef}
          request={request}
          // rowSelection={{
          //   type: 'checkbox',
          //   selectedRowKeys: rowKeys,
          //   onChange: selectRowKeys => {
          //     setRowKeysStr(selectRowKeys.join(','))
          //     setRowKeys(selectRowKeys)
          //   },
          // }}
          toolbarButtons={[
            {
              preset: 'add',
              onClick: () => setModalEdit({ mode: 'add', visible: true }),
            },
            {
              preset: 'delete',
              onClick: () => {
                if (rowKeys.length === 0) {
                  message.info('请选择一条数据')
                  return false
                }
                Modal.confirm({
                  title: '删除',
                  content: '是否确认删除?',
                  okText: '确认',
                  cancelText: '取消',
                  okType: 'danger',
                  onOk() {
                    rowKeys &&
                      axios
                        .get('/dealer/delete', {
                          params: { ids: rowKeysStr },
                        })
                        .then(res => {
                          if (res && res.data && res.data.code === 1) {
                            message.success(res.data.msg)
                            tableXRef.current.update()
                            setRowKeys([])
                            setRowKeysStr()
                          } else {
                            message.error(res.data.msg)
                          }
                        })
                  },
                  onCancel() {},
                })
              },
            },
            {
              label: 'export',
              onClick: () =>
                axios
                  .post(
                    '/dealer/export',
                    { ...paramsRef.current, flag: true },
                    {
                      responseType: 'blob',
                    }
                  )
                  .then(res => saveAs(res.data, '经销商信息导出.xls')),
            },
          ]}
          searchForm={[
            {
              label: '经销商代码',
              name: 'code',
              preset: 'text',
            },
            {
              label: '经销商名称',
              name: 'name',
              preset: 'text',
            },
          ]}
          columns={[
            {
              dataIndex: 'code',
              title: '经销商代码',
            },
            {
              dataIndex: 'name',
              title: '经销商名称',
              width: 180,
              render: v => <LongTextThumb text={v} width={180} />,
            },
            {
              dataIndex: 'financeNames',
              title: '资方',
              width: 150,
              render: v => <LongTextThumb text={v} width={150} />,
            },
            { dataIndex: 'telephone', title: '经销商电话' },
            { dataIndex: 'creditManagerName', title: '信用经理' },
            { dataIndex: 'teachingStaffName', title: '带教人员' },
            { dataIndex: 'teachingStaffMobile', title: '带教人员电话' },
            { dataIndex: 'regulatorName', title: '监管机构名称' },
            {
              dataIndex: 'supervisors',
              title: '监管员',
              render: v => v.map((m, i) => <div key={i}>{m.realname}</div>),
            },

            {
              dataIndex: 'supervisorsTel',
              title: '监管员电话',
              render: (v, o) =>
                o.supervisors.map((m, i) => <div key={i}>{m.mobile}</div>),
            },
            {
              dataIndex: 'status',
              title: '有效标志',
              width: 100,
              render: v => (
                <Tag color={['red', 'green'][v]}>{['无效', '有效'][v]}</Tag>
              ),
            },
            {
              dataIndex: 'province',
              title: '省份',
              width: 100,
            },
            {
              dataIndex: 'city',
              title: '城市',
              width: 100,
            },
            {
              dataIndex: 'taxNumber',
              title: '税务登记',
            },
            {
              dataIndex: 'address',
              title: '经销商地址',
              width: 180,
              render: v => <LongTextThumb text={v} width={180} />,
            },
            {
              dataIndex: 'createTime',
              title: '注册日期',
              width: 180,
            },

            {
              dataIndex: 'options',
              width: 100,
              fixed: 'right',
              title: <span style={{ marginLeft: 15 }}>操作</span>,
              render: (v, o) => (
                <Options
                  buttons={[
                    {
                      preset: 'edit',
                      onClick: () => {
                        recordRef.current = o
                        setModalEdit({
                          mode: 'update',
                          visible: true,
                        })
                      },
                    },
                  ]}
                ></Options>
              ),
            },
          ]}
        />
      </Card>
    </PageWrapper>
  )
}
