import React from 'react'
import { Tag } from 'antd'
import Personnel from 'pages/BasicInformation/Personnel'

export default function DealerPersonnel() {
  return (
    <Personnel
      scrollX={2400}
      organizationType="DEALER"
      url="/dealer/page"
      columns={[
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
          render: v => (
            <Tag color={['red', 'green'][v]}>{['闭店', '开店'][v]}</Tag>
          ),
        },
        {
          dataIndex: 'status',
          title: '有效标志',
          render: v => (
            <Tag color={['red', 'green'][v]}>{['无效', '有效'][v]}</Tag>
          ),
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
      ]}
      searchForm={[
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
      ]}
    ></Personnel>
  )
}
