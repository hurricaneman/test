import React from 'react'
import { Card, message } from 'antd'
import axios from 'axios'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import { checkres } from 'utils'
import PageWrapper from 'components/PageWrapper'

export default function Role() {
  const recordRef = React.useRef()
  const tableXRef = React.useRef()
  const [modalEdit, setModalEdit] = React.useState({ visible: false })

  function request({ pageIndex, pageSize, fields }) {
    return axios
      .post(`/role/list`, { pageIndex, pageSize, ...fields })
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
          onOk={() => (
            setModalEdit({ visible: false }), tableXRef.current.update()
          )}
          onCancel={() => setModalEdit({ visible: false })}
          {...modalEdit}
        ></ModalEdit>
        <TableX
          ref={tableXRef}
          rowKey="roleId"
          request={request}
          toolbarButtons={[
            {
              preset: 'add',
              onClick: () => {
                setModalEdit({ mode: 'add', visible: true })
              },
            },
          ]}
          searchForm={[
            {
              label: '名称',
              name: 'roleName',
              preset: 'text',
            },
          ]}
          columns={[
            { dataIndex: 'roleName', title: '角色名称' },
            { dataIndex: 'createTime', title: '创建时间' },
            { dataIndex: 'remark', title: '备注' },
            {
              dataIndex: 'ops',
              title: <span style={{ marginLeft: 15 }}>操作</span>,
              width: 200,
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
                      preset: 'delete',
                      onClick: () => {
                        axios
                          .get('/role/delete', {
                            params: { roleIds: o.roleId },
                          })
                          .then(({ data: res }) => {
                            if (res.code === 1) {
                              message.success('删除角色成功')
                              tableXRef.current.update()
                            } else {
                              message.error(res.msg)
                            }
                          })
                      },
                    },
                  ]}
                />
              ),
            },
          ]}
        ></TableX>
      </Card>
    </PageWrapper>
  )
}
