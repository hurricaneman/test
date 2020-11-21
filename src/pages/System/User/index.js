import React from 'react'
import { Card, message, Modal } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import PageWrapper from 'components/PageWrapper'

export default function User() {
  const [record] = React.useState()
  const [modalEdit, setModalEdit] = React.useState({ visible: false })
  const [rowKeys, setRowKeys] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()
  const [dutiesSelectOption, setDutiesSelectOption] = React.useState([])
  const tableXRef = React.useRef()

  function request({ pageIndex, pageSize, fields }) {
    return axios
      .post(`/user/list`, {
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

  React.useEffect(() => {
    axios
      .get('/userDuties/page', { params: { pageIndex: 1, pageSize: -1 } })
      .then(res => {
        if (!checkres(res)) return
        setDutiesSelectOption(res.data.data.records)
      })
  }, [])

  return (
    <PageWrapper>
      <Card>
        <ModalEdit
          record={record}
          dutiesSelectOption={dutiesSelectOption}
          onOk={() => (
            setModalEdit({ visible: false }), tableXRef.current.update()
          )}
          onCancel={() => setModalEdit({ visible: false })}
          {...modalEdit}
        ></ModalEdit>
        <TableX
          ref={tableXRef}
          // initialRefresh={false}
          scroll={{ x: 1800 }}
          rowKey="userId"
          request={request}
          searchForm={[
            {
              label: '员工姓名',
              name: 'username',
              preset: 'text',
            },
            {
              label: '单位',
              name: 'sex',
              preset: 'text',
            },
            {
              label: '是否启用',
              name: 'source',
              preset: 'select',
              options: [
                { label: '启用', value: '1' },
                { label: '停用', value: '0' },
              ],
            },
          ]}
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
              dataIndex: 'username',
              title: '手机号',
              width: 130,
              fixed: 'left',
            },
            {
              dataIndex: 'deptName',
              title: '所属部门',
              width: 120,
              fixed: 'left',
            },
            {
              dataIndex: 'dutiesName',
              title: '职务',
              width: 120,
            },
            {
              dataIndex: 'realname',
              title: '员工姓名',
              width: 120,
            },
            {
              dataIndex: 'email',
              title: '邮箱',
              width: 180,
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
              render: v => {
                return ['停用', '正常'][v]
              },
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
              width: 180,
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
