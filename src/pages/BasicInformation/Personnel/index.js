import React from 'react'
import { Card, message, Modal, Tag } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import PageWrapper from 'components/PageWrapper'
import { SERVERDFWL } from 'configs/service'

export default function Personnel(props) {
  const { organizationType, url, columns, searchForm, scrollX } = props
  const [record] = React.useState()
  const [modalEdit, setModalEdit] = React.useState({ visible: false })
  const [rowKeys, setRowKeys] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()
  const [FINANCEOptions, setFINANCEOptions] = React.useState([])
  const [DEALEROptions, setDEALEROptions] = React.useState([])
  const tableXRef = React.useRef()

  React.useEffect(() => {
    axios
      .post(
        '/dealer/page',
        { pageIndex: 1, pageSize: 100000 },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return
        const list = []
        res.data.data.records.map(v =>
          list.push({ label: v.name, value: v.id })
        )
        setDEALEROptions(list)
      })
    axios
      .post(
        '/finance/institution/page',
        { pageIndex: 1, pageSize: 100000 },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return
        const list = []
        res.data.data.records.map(v =>
          list.push({ label: v.name, value: v.id })
        )
        setFINANCEOptions(list)
      })
  }, [])

  const searchForm1 = [
    {
      label: '资方名称',
      name: 'organizationId',
      preset: 'select',
      options: FINANCEOptions,
    },
    {
      label: '员工姓名',
      name: 'realname',
      preset: 'text',
    },
    {
      label: '状态',
      name: 'status',
      preset: 'select',
      options: [
        { label: '正常', value: '1' },
        { label: '停用', value: '0' },
      ],
    },
  ]
  const searchForm2 = [
    {
      label: '经销商名称',
      name: 'organizationId',
      preset: 'select',
      options: DEALEROptions,
    },
    {
      label: '员工姓名',
      name: 'realname',
      preset: 'text',
    },
    {
      label: '状态',
      name: 'status',
      preset: 'select',
      options: [
        { label: '正常', value: '1' },
        { label: '停用', value: '0' },
      ],
    },
  ]
  const searchForm3 = [
    {
      label: '员工姓名',
      name: 'realname',
      preset: 'text',
    },
    {
      label: '状态',
      name: 'status',
      preset: 'select',
      options: [
        { label: '正常', value: '1' },
        { label: '停用', value: '0' },
      ],
    },
  ]

  function request({ pageIndex, pageSize, fields }) {
    return axios
      .post(`/user/list`, {
        pageIndex,
        pageSize,
        organizationType,
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
        <ModalEdit
          scrollX={scrollX}
          organizationType={organizationType}
          url={url}
          columns={columns}
          searchForm={searchForm}
          record={record}
          onOk={() => (
            setModalEdit({ visible: false }), tableXRef.current.update()
          )}
          onCancel={() => setModalEdit({ visible: false })}
          {...modalEdit}
        ></ModalEdit>
        <TableX
          ref={tableXRef}
          // initialRefresh={false}
          scroll={{ x: 1400 }}
          rowKey="userId"
          request={request}
          searchForm={
            organizationType === 'DEALER'
              ? searchForm2
              : organizationType === 'FINANCE'
              ? searchForm1
              : searchForm3
          }
          toolbarButtons={[
            {
              preset: 'add',
              onClick: () => setModalEdit({ mode: 'add', visible: true }),
            },
            {
              preset: 'del',
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
                        .get('/user/delete', {
                          params: { userIds: rowKeysStr },
                        })
                        .then(({ data: res }) => {
                          if (res.code === 1) {
                            message.success('删除用户成功')
                            tableXRef.current.update()
                            setRowKeys([])
                            setRowKeysStr()
                          } else {
                            message.error(res.msg)
                          }
                        })
                  },
                  onCancel() {},
                })
              },
            },
          ]}
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
          columns={[
            {
              dataIndex: 'realname',
              title: '员工姓名',
              width: 120,
            },
            {
              dataIndex: 'username',
              title: '手机号',
              width: 120,
            },
            {
              dataIndex: 'organizationName',
              title: '隶属单位',
              width: 150,
            },
            {
              dataIndex: 'duties',
              title: '职务',
              width: 120,
            },
            { dataIndex: 'userLevelName', title: '个人类型', width: 120 },
            {
              dataIndex: 'email',
              title: '邮箱',
              width: 150,
            },
            {
              dataIndex: 'sex',
              title: '性别',
              width: 80,
              render: v => {
                return ['保密', '男', '女'][v]
              },
            },
            {
              dataIndex: 'status',
              title: '状态',
              width: 80,
              render: v => (
                <Tag color={['red', 'green'][v]}>{['停用', '正常'][v]}</Tag>
              ),
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
              width: 160,
              render: record => (
                <Options
                  buttons={[
                    {
                      preset: 'edit',
                      onClick: () => {
                        record &&
                          setModalEdit({
                            mode: 'update',
                            visible: true,
                            record,
                          })
                      },
                    },
                    {
                      label: '重置密码',
                      onClick: () => {
                        axios
                          .get('/user/resetPass', {
                            params: { userId: record.userId },
                          })
                          .then(res => {
                            if (!checkres(res)) return
                            if (res.data.code === 1) {
                              message.success('重置成功')
                            } else {
                              message.error(res.data.msg)
                            }
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
