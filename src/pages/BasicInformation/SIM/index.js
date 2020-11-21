import React from 'react'
import { Card, Modal, message, Tag, DatePicker } from 'antd'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres } from 'utils'
import PageWrapper from 'components/PageWrapper'
import { SERVERDFWL } from 'configs/service'
const RangePicker = DatePicker.RangePicker

export default function Investor() {
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
        '/finance/institution/page',
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
          scroll={{ x: true }}
          rowKey="id"
          ref={tableXRef}
          request={request}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: rowKeys,
            onChange: selectRowKeys => {
              setRowKeysStr(selectRowKeys.join(','))
              setRowKeys(selectRowKeys)
            },
          }}
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
                        .get('/edition/delete', {
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
          ]}
          searchForm={[
            {
              label: 'SIM卡号',
              name: 'sim',
              preset: 'text',
            },
            {
              label: 'ICCID',
              name: 'ICCID',
              preset: 'text',
            },
            {
              label: '卡状态',
              name: 'status',
              preset: 'select',
              options: [
                { label: '启用', value: '1' },
                { label: '停用', value: '0' },
              ],
            },
            {
              label: '激活时间',
              name: 'startTime',
              preset: '',
              component: <RangePicker />,
            },
            {
              label: '创建时间',
              name: 'createTime',
              preset: '',
              component: <RangePicker />,
            },
          ]}
          columns={[
            {
              dataIndex: 'code',
              title: 'SIM卡号',
            },
            { dataIndex: 'name', title: 'ICCID' },
            {
              dataIndex: 'address',
              title: '卡状态',
              render: v => (
                <Tag color={['red', 'green'][v]}>{['停用', '启用'][v]}</Tag>
              ),
            },
            {
              dataIndex: 'creTime',
              title: '创建时间',
            },
            {
              dataIndex: 'options',
              width: 160,
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
