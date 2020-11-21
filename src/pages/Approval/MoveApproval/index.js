import React from 'react'
import { Card, Tag } from 'antd'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres } from 'utils'
import PageWrapper from 'components/PageWrapper'
import { saveAs } from 'file-saver'
import { SERVERDFWL } from 'configs/service'
import Detail from './Detail.js'

export default function Dealer() {
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()

  const [drawerInfo, setDrawerInfo] = React.useState({
    visible: false,
    record: {},
  })
  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(
        '/mobileapproval/queryPage',
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
        <Detail
          onCancel={() => {
            tableXRef.current.update()
            setDrawerInfo({ visible: false, record: {} })
          }}
          {...drawerInfo}
        ></Detail>
        <TableX
          scroll={{ x: 1750 }}
          rowKey="id"
          ref={tableXRef}
          size="small"
          request={request}
          toolbarButtons={[
            {
              label: 'export',
              onClick: () =>
                axios
                  .post(
                    '/loginlog/export',
                    { ...paramsRef.current, flag: true },
                    {
                      responseType: 'blob',
                    }
                  )
                  .then(res => saveAs(res.data, '经销商信息导出.xls')),
            },
          ]}
          searchForm={[
            {
              label: '经销商',
              name: 'dealerName',
              preset: 'text',
            },
            {
              label: '申请单号',
              name: 'applyOddNumber',
              preset: 'text',
              width: 200,
            },
            {
              label: '审批状态',
              name: 'applyStatus',
              preset: 'select',
              options: [
                { label: '未审批', value: 1 },
                { label: '同意', value: 2 },
                { label: '不同意', value: 3 },
              ],
            },
            {
              label: '起始日期',
              name: 'startTime',
              preset: 'date',
            },
            {
              label: '截止日期',
              name: 'endTime',
              preset: 'date',
            },
          ]}
          columns={[
            {
              dataIndex: 'applyOddNumber',
              title: '申请单号',
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
              dataIndex: 'applyName',
              title: '申请人',
            },
            {
              dataIndex: 'applyNum',
              title: '申请数量',
            },
            {
              dataIndex: 'ratifyNum',
              title: '批准数量',
            },
            {
              dataIndex: 'financeApplyName',
              title: '金融机构审批人',
            },
            {
              dataIndex: 'financeApplyDate',
              title: '金融机构审批日期',
              width: 200,
              render: v => v?.split(' ')[0],
            },
            {
              dataIndex: 'applyStatus',
              title: '审核状态',
              render: v => (
                <Tag color={['yellow', 'yellow', 'green', 'red'][v]}>
                  {['', '待审核', '同意', '不同意', ''][v]}
                </Tag>
              ),
            },
            {
              dataIndex: 'spuerviseName',
              title: '监管员',
            },
            {
              dataIndex: 'superviseAffirmDate',
              title: '监管员确认日期',
            },
            {
              //dataIndex: 'options',
              width: 160,
              fixed: 'right',
              title: '操作',
              render: (v, o) => (
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
