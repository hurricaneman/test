import React from 'react'
import { Card, Modal, message, Tag } from 'antd'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres } from 'utils'
import PageWrapper from 'components/PageWrapper'

export default function Supervision() {
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
      .post('/edition/query', { pageIndex, pageSize, ...fields })
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
              label: '监管机构名称',
              name: 'name',
              preset: 'text',
            },
            {
              label: '启用状态',
              name: 'status',
              preset: 'select',
              options: [
                { label: '启用', value: '1' },
                { label: '停用', value: '0' },
              ],
            },
          ]}
          columns={[
            {
              dataIndex: 'code',
              title: '监管机构代码',
            },
            { dataIndex: 'codeName', title: '监管机构名称' },
            { dataIndex: 'codeName2', title: '单位简称' },
            { dataIndex: 'editionName', title: '负责人' },
            { dataIndex: 'versionNumber', title: '办公电话' },
            {
              dataIndex: 'applicationType',
              title: '手机号',
            },
            {
              dataIndex: 'upgrade',
              title: '联系地址',
            },
            {
              dataIndex: 'updateContent',
              title: '注册日期',
            },
            {
              dataIndex: 'status',
              title: '启用状态',
              render: v => (
                <Tag color={['red', 'green'][v]}>{['停用', '启用'][v]}</Tag>
              ),
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
