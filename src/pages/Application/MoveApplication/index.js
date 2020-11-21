import React from 'react'
import { Card, Tag } from 'antd'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres } from 'utils'
import PageWrapper from 'components/PageWrapper'
import { SERVERDFWL } from 'configs/service'
import Detail from './Detail.js'
import LongTextThumb from 'components/LongTextThumb'

export default function Dealer() {
  const recordRef = React.useRef({})
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()
  const [modalEdit, setModalEdit] = React.useState({
    visible: false,
  })
  const [drawerInfo, setDrawerInfo] = React.useState({
    visible: false,
    record: {},
  })

  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(
        '/mobileapplication/queryPage',
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

  function onCancelData(o) {
    axios
      .get('mobileapplication/revocationapplication', {
        params: { mobileApplicationId: o.id },
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        tableXRef.current.update()
      })
  }

  return (
    <PageWrapper>
      <Card>
        <Detail
          onCancel={() => setDrawerInfo({ visible: false, record: {} })}
          {...drawerInfo}
        ></Detail>
        <ModalEdit
          record={recordRef.current}
          onOk={() => tableXRef.current.update()}
          onCancel={() => {
            recordRef.current = null
            setModalEdit({ visible: false })
          }}
          {...modalEdit}
        />
        <TableX
          scroll={{ x: 1820 }}
          rowKey="id"
          ref={tableXRef}
          request={request}
          toolbarButtons={[
            {
              preset: 'add',
              onClick: () => {
                recordRef.current = null
                setModalEdit({ mode: 'add', visible: true })
              },
            },
          ]}
          searchForm={[
            {
              label: '申请单号',
              name: 'applyOddNumber',
              preset: 'text',
            },
            {
              label: '经销商',
              name: 'dealerName',
              preset: 'text',
            },
            {
              label: '申请起始日期',
              name: 'applyDate',
              preset: 'date',
            },
            {
              label: '状态查询',
              name: 'applyStatus',
              preset: 'select',
              options: [
                { label: '已保存', value: 0 },
                { label: '待审核', value: 1 },
                { label: '同意', value: 2 },
                { label: '不同意', value: 3 },
                { label: '已撤回', value: 4 },
              ],
            },
          ]}
          columns={[
            {
              dataIndex: 'applyOddNumber',
              title: '申请单号',
              width: 170,
            },
            {
              dataIndex: 'status',
              title: '业务类型',
              render: v => (
                <Tag color={['', 'blue', 'green', 'blue'][v]}>
                  {['', '移库', '借车', '借钥匙'][v]}
                </Tag>
              ),
            },
            {
              dataIndex: 'dealerName',
              title: '经销商',
            },
            {
              dataIndex: 'applyDate',
              title: '申请起始日期',
              render: v => v?.split(' ')[0],
            },
            {
              dataIndex: 'returnEndDate',
              title: '还回时间',
              render: v => v?.split(' ')[0],
            },
            {
              dataIndex: 'applyStatus',
              title: '审核状态',
              render: v => (
                <Tag color={['blue', 'yellow', 'green', 'red'][v]}>
                  {['未提交', '待审核', '同意', '不同意', '已撤回'][v]}
                </Tag>
              ),
            },
            {
              dataIndex: 'applyName',
              title: '申请人',
            },
            {
              dataIndex: 'applyNum',
              title: '申请数量',
              width: 100,
            },
            {
              dataIndex: 'ratifyNum',
              title: '批准数量',
              width: 100,
            },
            {
              dataIndex: 'financeApplyName',
              title: '金融机构审批人',
              width: 160,
            },
            {
              dataIndex: 'financeApplyDate',
              title: '金融机构审批日期',
              width: 150,
              render: v => v?.split(' ')[0],
            },

            // {
            //   dataIndex: 'submit',
            //   title: '提交状态',
            //   render: v => (
            //     <Tag color={['yellow', 'green', 'red'][v]}>
            //       {['未提交', '已提交', '已撤销'][v]}
            //     </Tag>
            //   ),
            // },
            // {
            //   dataIndex: 'spuerviseName',
            //   title: '监管员',
            // },
            // {
            //   dataIndex: 'superviseAffirmDate',
            //   title: '监管员确认日期',
            // },
            {
              dataIndex: 'remark',
              title: '备注',
              render: v => <LongTextThumb text={v} width={180} />,
            },
            {
              dataIndex: 'options',
              width: 230,
              fixed: 'right',
              title: <span style={{ marginLeft: 15 }}>操作</span>,
              render: (v, o) =>
                o.applyStatus == 0 ||
                o.applyStatus == 4 ||
                o.applyStatus == 3 ? (
                  <Options
                    buttons={[
                      {
                        key: '查看详情',
                        label: '查看详情',
                        onClick: () => {
                          o &&
                            setDrawerInfo({
                              visible: true,
                              record: o,
                            })
                        },
                      },
                      {
                        key: 'edit',
                        preset: 'edit',
                        onClick: () => {
                          recordRef.current = o
                          setModalEdit({
                            mode: 'update',
                            visible: true,
                          })
                        },
                      },
                      o.applyStatus != 0 && o.applyStatus != 4
                        ? {
                            label: '撤销',
                            key: '撤销',
                            onClick: () => {
                              o && onCancelData(o)
                            },
                          }
                        : {},
                    ]}
                  />
                ) : (
                  <Options
                    buttons={[
                      {
                        key: '查看详情',
                        label: '查看详情',
                        onClick: () => {
                          o &&
                            setDrawerInfo({
                              visible: true,
                              record: o,
                            })
                        },
                      },
                      o.applyStatus == 1
                        ? {
                            label: '撤销',
                            key: '撤销',
                            onClick: () => {
                              o && onCancelData(o)
                            },
                          }
                        : {},
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
