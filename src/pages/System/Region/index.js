import React from 'react'
import { Card, message, Tag, Modal } from 'antd'
import ModalEdit from './ModalEdit'
import axios from 'axios'
import { checkres } from 'utils'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import PageWrapper from 'components/PageWrapper'

export default function Region() {
  const [modalEdit, setModalEdit] = React.useState({ visible: false })
  const [treeData, setTreeData] = React.useState([])
  const [data, setData] = React.useState([])
  const recordRef = React.useRef(null)
  const tableXRef = React.useRef()

  function request() {
    recordRef.current = null
    return axios.post('/region/list', { pageSize: 999 }).then(res => {
      if (!checkres(res)) return
      const { data } = res.data
      const tree = ToTree(data.map(v => ({ ...v, title: v.name, value: v.id })))
      setTreeData([{ title: '中国', value: 0, children: tree }])
      setData(data)
      return { list: ToTree(data) }
    })
  }

  function ToTree(data, id = 0) {
    return data
      .filter(v => v.pid === id)
      .map(v => {
        const children = ToTree(data, v.id)
        if (!children.length) return v
        return { ...v, children }
      })
  }

  return (
    <PageWrapper>
      <Card>
        <ModalEdit
          data={data}
          treeData={treeData}
          record={recordRef.current}
          onOk={() => (
            setModalEdit({ visible: false }), tableXRef.current.update()
          )}
          onCancel={() => setModalEdit({ visible: false })}
          {...modalEdit}
        ></ModalEdit>
        <TableX
          ref={tableXRef}
          rowKey="id"
          request={request}
          toolbarButtons={[
            {
              preset: 'add',
              onClick: () => setModalEdit({ mode: 'add', visible: true }),
            },
          ]}
          columns={[
            { dataIndex: 'name', title: '名称' },
            { dataIndex: 'id', title: '区域标识' },
            {
              dataIndex: 'level',
              title: '类型',
              render: v => (
                <Tag color={['', 'red', 'geekblue', 'green'][v]}>
                  {['', '省直辖市', '市', '区县'][v]}
                </Tag>
              ),
            },
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
                        if (o.children) {
                          message.info('需要先删除子节点')
                        } else {
                          Modal.confirm({
                            title: '删除',
                            content: '是否确认删除?',
                            okText: '确认',
                            cancelText: '取消',
                            okType: 'danger',
                            onOk() {
                              axios
                                .get('/region/delete', {
                                  params: { ids: o.id },
                                })
                                .then(res => {
                                  const { data } = res
                                  if (data.code === 1) {
                                    message.success('删除行政区域成功')
                                    tableXRef.current.update()
                                  } else {
                                    message.error('删除行政区域失败')
                                  }
                                })
                            },
                            onCancel() {},
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
        />
      </Card>
    </PageWrapper>
  )
}
