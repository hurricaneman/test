import React from 'react'
import { Button, Table } from 'antd'

function CarTableSelect(props, ref) {
  const { carSelectTable, updataCarlist, showDelete, getmoved } = props
  const [list, setList] = React.useState([])
  React.useEffect(() => {
    const carList = carSelectTable?.rows.concat(updataCarlist)
    Array.from(new Set(carList))
    setList(carList)
  }, [carSelectTable?.rows, updataCarlist])
  React.useImperativeHandle(
    ref,
    () => ({
      list,
    }),
    [list]
  )

  function deleted(v, o, i) {
    const currentList = [...list]
    currentList.splice(i, 1)
    setList(currentList)
    getmoved(currentList)
  }

  return (
    <>
      <Table
        dataSource={list}
        scroll={1500}
        rowKey="id"
        size="small"
        pagination={false}
        columns={[
          {
            dataIndex: 'options',
            title: '',
            render: (v, o, i) =>
              showDelete ? (
                ''
              ) : (
                <Button onClick={() => deleted(v, o, i)}>删除</Button>
              ),
          },
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
        ]}
      />
    </>
  )
}

export default React.forwardRef(CarTableSelect)
