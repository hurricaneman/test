import React from 'react'
import { Table } from 'antd'

function CarTableSelect(props, ref) {
  const { updataCarlist } = props
  const [list, setList] = React.useState([])
  const [rowKeys, setRowKeys] = React.useState([])
  const [rows, setRows] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()
  console.log(rows, rowKeysStr)
  React.useEffect(() => {
    setList(updataCarlist)
  }, [updataCarlist])

  React.useImperativeHandle(
    ref,
    () => ({
      rows,
      rowKeys,
      rowKeysStr,
    }),
    [rows, rowKeys, rowKeysStr]
  )

  return (
    <>
      <Table
        dataSource={list}
        scroll={1500}
        rowKey="id"
        size="small"
        pagination={false}
        rowSelection={{
          selectedRowKeys: rowKeys,
          onChange: (selectRowKeys, selectedRows) => {
            setRowKeysStr(selectRowKeys.join(','))
            setRowKeys(selectRowKeys)
            setRows(selectedRows)
          },
        }}
        columns={[
          {
            dataIndex: 'vin',
            title: '车辆识别码',
          },
          {
            dataIndex: 'price',
            title: '价格',
          },
          {
            dataIndex: 'dealerId',
            title: '订单单号',
          },
          {
            dataIndex: 'vehicleTypeName',
            title: '车型',
          },
          {
            dataIndex: 'city2',
            title: '发动机号',
          },
          {
            dataIndex: 'warehouseName',
            title: '网点名称',
          },
          {
            dataIndex: 'warehouseType',
            title: '网点分类',
            render: v => {
              return ['主库', '二库', '合作二网', '直营二网'][v]
            },
          },
          {
            dataIndex: 'brand',
            title: '品牌',
          },
          {
            dataIndex: 'color',
            title: '颜色',
          },
          // {
          //   dataIndex: 'createTime',
          //   title: '审核日期',
          // },
        ]}
      />
    </>
  )
}

export default React.forwardRef(CarTableSelect)
