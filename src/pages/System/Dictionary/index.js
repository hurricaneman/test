import React from 'react'
import { Card, message, Modal, Col, Row, Tag } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import ModalEdit from './ModalEdit'
import ModalEdit2 from './ModalEdit2'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import PageWrapper from 'components/PageWrapper'
import LongTextThumb from 'components/LongTextThumb'

export default function Dictionary() {
  const [record] = React.useState()
  const [recordMore] = React.useState()
  const [modalEdit, setModalEdit] = React.useState({ visible: false })
  const [modalEditMore, setModalEditMore] = React.useState({ visible: false })
  const [rowKeys, setRowKeys] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()
  const [rowKeysMore, setRowKeysMore] = React.useState([])
  const [rowKeysStrMore, setRowKeysStrMore] = React.useState()
  const [dictId, setDictId] = React.useState(null)
  const recordRef = React.useRef()
  const tableXRef = React.useRef()
  const tableXRefMore = React.useRef()

  function requestMore({ pageIndex, pageSize, fields }) {
    recordRef.current = null
    return axios
      .post(`/dict/detailList`, {
        pageIndex,
        pageSize,
        dictId,
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

  function request({ pageIndex, pageSize, fields }) {
    recordRef.current = null
    return axios
      .post(`/dict/list`, {
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
    if (!dictId) {
      return
    }
    tableXRefMore.current.update()
  }, [dictId])

  return (
    <PageWrapper>
      <Row gutter={12}>
        <Col span={12}>
          <Card title="字典列表" style={{ minHeight: '82vh' }}>
            <ModalEdit
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
              scroll={{ x: 770 }}
              rowKey="dictId"
              request={request}
              onRow={record => {
                return {
                  onClick: () => {
                    setDictId(record.dictId.toString())
                  },
                }
              }}
              searchForm={[
                {
                  label: '编码',
                  name: 'code',
                  preset: 'text',
                  labelCol: { span: 8 },
                  wrapperCol: { span: 16 },
                  style: { width: 150 },
                },
                {
                  label: '名称',
                  name: 'name',
                  preset: 'text',
                  labelCol: { span: 8 },
                  wrapperCol: { span: 16 },
                  style: { width: 150 },
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
                            .get('/dict/delete', {
                              params: { ids: rowKeysStr },
                            })
                            .then(({ data: res }) => {
                              if (res.code === 1) {
                                message.success('删除字典列表成功')
                                tableXRef.current.update()
                              } else {
                                message.error('删除字典列表失败')
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
                  dataIndex: 'code',
                  title: '编码',
                  width: 180,
                  render: v => <LongTextThumb text={v} width={180} />,
                },
                {
                  dataIndex: 'name',
                  title: '名称',
                  width: 120,
                  render: v => <LongTextThumb text={v} width={120} />,
                },
                {
                  dataIndex: 'descrip',
                  title: '描述',
                  width: 120,
                  render: v => <LongTextThumb text={v} width={120} />,
                },
                {
                  dataIndex: 'status',
                  title: '状态',
                  width: 120,
                  render: v => {
                    return (
                      <Tag color={['red', 'green'][v]}>
                        {['停用', '启用'][v]}
                      </Tag>
                    )
                  },
                },
                {
                  dataIndex: 'createTime',
                  title: '创建时间',
                  width: 120,
                  render: v => <LongTextThumb text={v} width={120} />,
                },
                {
                  dataIndex: '',
                  title: <span style={{ marginLeft: 15 }}>操作</span>,
                  fixed: 'right',
                  width: 170,
                  render: record => (
                    <Options
                      buttons={[
                        {
                          preset: 'edit',
                          onClick: e => {
                            e.stopPropagation()
                            record &&
                              setModalEdit({
                                mode: 'update',
                                visible: true,
                                record,
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
        </Col>
        <Col span={12}>
          <Card title="字典详情" style={{ minHeight: '82vh' }}>
            <ModalEdit2
              record={recordMore}
              dictId={dictId}
              onOk={() => (
                setModalEditMore({ visible: false }),
                tableXRefMore.current.update()
              )}
              onCancel={() => setModalEditMore({ visible: false })}
              {...modalEditMore}
            ></ModalEdit2>
            <TableX
              scroll={{ x: 770 }}
              ref={tableXRefMore}
              // initialRefresh={false}
              rowKey="dictId"
              request={requestMore}
              searchForm={[
                {
                  label: '编码',
                  name: 'code',
                  preset: 'text',
                  labelCol: { span: 8 },
                  wrapperCol: { span: 16 },
                  style: { width: 150 },
                },
                {
                  label: '名称',
                  name: 'name',
                  preset: 'text',
                  labelCol: { span: 8 },
                  wrapperCol: { span: 16 },
                  style: { width: 150 },
                },
              ]}
              toolbarButtons={[
                {
                  preset: 'add',
                  onClick: () => {
                    if (!dictId) {
                      message.info('请先选择左侧字典列表后再添加')
                      return
                    }
                    setModalEditMore({ mode: 'add', visible: true })
                  },
                },
                {
                  preset: 'del',
                  onClick: () => {
                    if (rowKeysMore.length === 0) {
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
                        rowKeysMore &&
                          axios
                            .get('/dict/delete', {
                              params: { ids: rowKeysStrMore },
                            })
                            .then(({ data: res }) => {
                              if (res.code === 1) {
                                message.success('删除字典详情成功')
                                tableXRefMore.current.update()
                              } else {
                                message.error('删除字典详情失败')
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
                selectedRowKeys: rowKeysMore,
                onChange: selectRowKeys => {
                  let str = ''
                  selectRowKeys.map(v => (str += v + ','))
                  setRowKeysStrMore(str)
                  setRowKeysMore(selectRowKeys)
                },
              }}
              columns={[
                {
                  dataIndex: 'code',
                  title: '编码',
                  width: 180,
                  render: v => <LongTextThumb text={v} width={120} />,
                },
                {
                  dataIndex: 'name',
                  title: '名称',
                  width: 120,
                  render: v => <LongTextThumb text={v} width={120} />,
                },
                {
                  dataIndex: 'descrip',
                  title: '描述',
                  width: 120,
                  render: v => <LongTextThumb text={v} width={120} />,
                },
                {
                  dataIndex: 'status',
                  title: '状态',
                  width: 120,
                  render: v => {
                    return (
                      <Tag color={['red', 'green'][v]}>
                        {['停用', '启用'][v]}
                      </Tag>
                    )
                  },
                },
                {
                  dataIndex: 'createTime',
                  title: '创建时间',
                  width: 120,
                  render: v => <LongTextThumb text={v} width={120} />,
                },
                {
                  dataIndex: '',
                  title: <span style={{ marginLeft: 15 }}>操作</span>,
                  fixed: 'right',
                  width: 100,
                  render: record => (
                    <Options
                      buttons={[
                        {
                          preset: 'edit',
                          onClick: () => {
                            record &&
                              setModalEditMore({
                                mode: 'update',
                                visible: true,
                                record,
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
        </Col>
      </Row>
    </PageWrapper>
  )
}
