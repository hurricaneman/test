import React from 'react'
import { Card, message, Modal, Tag } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import PageWrapper from 'components/PageWrapper'
import { SERVERDFWL } from 'configs/service'

const scrollX = 2400
const organizationType = 'DEALER'
const url = '/dealer/page'
const columns = [
  {
    dataIndex: 'code',
    title: '经销商代码',
  },
  { dataIndex: 'name', title: '经销商名称' },
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
    dataIndex: 'openStatus',
    title: '开闭店',
    render: v => <Tag color={['red', 'green'][v]}>{['闭店', '开店'][v]}</Tag>,
  },
  {
    dataIndex: 'status',
    title: '有效标志',
    render: v => <Tag color={['red', 'green'][v]}>{['无效', '有效'][v]}</Tag>,
  },
  {
    dataIndex: 'province',
    title: '省份',
  },
  {
    dataIndex: 'city',
    title: '城市',
  },
  {
    dataIndex: 'taxNumber',
    title: '税务登记',
  },
  {
    dataIndex: 'address',
    title: '经销商地址',
  },
  {
    dataIndex: 'brand',
    title: '品牌',
  },
  {
    dataIndex: 'createTime',
    title: '注册日期',
  },
]
const searchForm = [
  {
    label: '单位代码',
    name: 'code',
    preset: 'text',
  },
  {
    label: '单位名称',
    name: 'name',
    preset: 'text',
  },
]

export default function SupervisionRatio() {
  const [record] = React.useState()
  const [modalEdit, setModalEdit] = React.useState({
    visible: false,
  })
  const [rowKeys, setRowKeys] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()
  const tableXRef = React.useRef()

  function request({ pageIndex, pageSize, fields }) {
    return axios
      .post(
        `/regulatory/ratio/page`,
        {
          pageIndex,
          pageSize,
          ...fields,
        },
        {
          baseURL: SERVERDFWL,
        }
      )
      .then(res => {
        if (!checkres(res)) return
        if (res && res.data.code === 1) {
          return {
            list: res.data.data.records,
            total: res.data.data.total,
          }
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
          // scroll={{ x: 1400 }}
          rowKey="id"
          request={request}
          searchForm={[
            {
              label: '经销商名称',
              name: 'dealerName',
              preset: 'text',
            },
            {
              label: '有效标志',
              name: 'status',
              preset: 'select',
              options: [
                { label: '无效', value: '0' },
                { label: '有效', value: '1' },
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
          // rowSelection={{
          //   type: 'checkbox',
          //   selectedRowKeys: rowKeys,
          //   onChange: selectRowKeys => {
          //     let str = ''
          //     selectRowKeys.map(v => (str += v + ','))
          //     setRowKeysStr(str)
          //     setRowKeys(selectRowKeys)
          //   },
          // }}
          columns={[
            {
              dataIndex: 'dealerName',
              title: '经销商名称',
            },
            {
              dataIndex: 'moveRatio',
              title: '移动比',
            },
            {
              dataIndex: 'moveAmount',
              title: '移动额度',
            },
            {
              dataIndex: 'moveRule',
              title: '移动规则',
              render: v => {
                return ['按台数移动比', '按固定额度', '按额度移动比'][v]
              },
            },
            {
              dataIndex: 'status',
              title: '有效标志',
              render: v => (
                <Tag color={['red', 'green'][v]}>{['无效', '有效'][v]}</Tag>
              ),
            },
            {
              dataIndex: '',
              title: <span style={{ marginLeft: 15 }}>操作</span>,
              fixed: 'right',
              width: 120,
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
