import React from 'react'
import { Card, Modal, message } from 'antd'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres } from 'utils'
import PageWrapper from 'components/PageWrapper'
import { SERVERDFWL } from 'configs/service'

export default function AppVersion() {
  const recordRef = React.useRef({})
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()

  const [modalEdit, setModalEdit] = React.useState({ visible: false })
  const [rowKeys, setRowKeys] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()

  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(
        '/edition/query',
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
          scroll={{ x: 1500 }}
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
                          baseURL: SERVERDFWL,
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
            { label: 'APP文件名', name: 'appfileName', preset: 'text' },
            { label: '版本名称', name: 'editionName', preset: 'text' },
            {
              label: '应用类型',
              name: 'applicationType',
              preset: 'select',
              options: [
                { label: 'IOS', value: '1' },
                { label: '安卓', value: '0' },
              ],
            },
          ]}
          columns={[
            {
              dataIndex: 'index',
              title: '序号',
              render: (v, o, i) => i + 1,
              fixed: 'left',
              width: 100,
            },
            { dataIndex: 'appName', title: 'APP名称', fixed: 'left' },
            { dataIndex: 'appfileName', title: 'APP文件名称' },
            { dataIndex: 'editionName', title: '版本名称' },
            { dataIndex: 'versionNumber', title: '版本号' },
            {
              dataIndex: 'applicationType',
              title: '应用类型',
              render: v => ['安卓', 'IOS'][v],
            },
            {
              dataIndex: 'upgrade',
              title: '是否必须升级',
              render: v => ['否', '是'][v],
            },
            {
              dataIndex: 'updateContent',
              title: '更新内容',
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
                        setModalEdit({ mode: 'update', visible: true })
                      },
                    },
                    {
                      label: '下载',
                      onClick: () => {
                        window.open(o.annexUrl)
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
