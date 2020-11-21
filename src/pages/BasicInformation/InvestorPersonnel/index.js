import React from 'react'
import { Tag } from 'antd'
import Personnel from 'pages/BasicInformation/Personnel'

export default function InvestorPersonnel() {
  return (
    <Personnel
      organizationType="FINANCE"
      url="/finance/institution/page"
      columns={[
        {
          dataIndex: 'code',
          title: '金融机构代码',
        },
        { dataIndex: 'name', title: '金融机构名称' },
        { dataIndex: 'manager', title: '负责人' },
        { dataIndex: 'phone', title: '办公电话' },
        {
          dataIndex: 'telephone',
          title: '手机号',
        },
        {
          dataIndex: 'address',
          title: '联系地址',
        },
        {
          dataIndex: 'createTime',
          title: '注册日期',
        },
        {
          dataIndex: 'status',
          title: '启用状态',
          render: v => (
            <Tag color={['red', 'green'][v]}>{['停用', '启用'][v]}</Tag>
          ),
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
