import React from 'react'
import { Icon as LegacyIcon } from '@ant-design/compatible'
import { Card, message, Tag } from 'antd'
import ModalEdit from './ModalEdit'
import axios from 'axios'
import { checkres, menuToTree, bus } from 'utils'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import PageWrapper from 'components/PageWrapper'

export default function Menu() {
  const [modalEdit, setModalEdit] = React.useState({ visible: false })
  const recordRef = React.useRef(null)
  const tableXRef = React.useRef()

  function request() {
    recordRef.current = null
    bus.emit('@/System/Menu/Update')
    return axios.post('/menu/list', { pageSize: 999 }).then(res => {
      if (!checkres(res)) return { list: [] }
      const { data } = res.data
      return { list: menuToTree(data.records) }
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
          rowKey="menuId"
          request={request}
          toolbarButtons={[
            {
              preset: 'add',
              onClick: () => setModalEdit({ mode: 'add', visible: true }),
            },
          ]}
          columns={[
            { dataIndex: 'name', title: '名称' },
            {
              dataIndex: 'icon',
              title: '图标',
              render: v => v && <LegacyIcon type={v}></LegacyIcon>,
            },
            {
              dataIndex: 'type',
              title: '类型',
              render: v => (
                <Tag color={['red', 'geekblue', 'green'][v]}>
                  {['目录', '菜单', '按钮', '其他'][v]}
                </Tag>
              ),
            },
            { dataIndex: 'orderNum', title: '排序' },
            { dataIndex: 'url', title: '路由' },
            { dataIndex: 'perms', title: '授权标识' },
            {
              dataIndex: 'ops',
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
                      preset: 'del',
                      onClick: () => {
                        if (o.children && o.children.length > 0) {
                          message.info('需要先删除子节点')
                        } else {
                          axios
                            .get('/menu/delete', {
                              params: { menuId: o.menuId },
                            })
                            .then(({ data: res }) => {
                              if (res.code === 1) {
                                message.success('删除菜单成功')
                                tableXRef.current.update()
                              } else {
                                message.error('删除菜单失败')
                              }
                            })
                        }
                      },
                    },
                  ]}
                />
              ),
            },
          ]}
          hasPagination={false}
        ></TableX>
      </Card>
    </PageWrapper>
  )
}
