import React from 'react'
import { Button, Modal } from 'antd'
import TableX from 'components/TableX'
import axios from 'axios'
import { checkres } from 'utils'
import { SERVERDFWL } from 'configs/service'

function TableSelectCar(props, ref) {
  const {
    onChange,
    selectType = 'checkbox',
    params,
    record,
    getmoved,
    url = '/mobileapplication/selectvehiclelist',
  } = props
  const [visible, setVisible] = React.useState(false)
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()

  const [rowKeys, setRowKeys] = React.useState([])
  const [rows, setRows] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()
  const [paramsCurrent, setParamsCurrent] = React.useState({
    params: {}, // 改变之后Form值
    record: {}, // 修改的时候传过来的默认值
  })
  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .get(url, {
        params: {
          dealerId: paramsCurrent.params.dealerId
            ? paramsCurrent.params.dealerId
            : paramsCurrent.record.dealerId,
          warehouseId: paramsCurrent.params.dealerId
            ? paramsCurrent.params.warehouseId
            : paramsCurrent.record.warehouseId,
          status: params.status,
        },
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        return {
          list: res.data.data,
          // total: res.data.data.totalCount,
        }
      })
  }

  React.useEffect(() => {
    setParamsCurrent({
      params: params,
      record: record,
    })
    // if (tableXRef.current) {
    //   tableXRef.current.update()
    // }
  }, [params, record])

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
      {/* <Input
        value={value.name}
        onChange={onChange}
        disabled
        style={{ width: 240 }}
      ></Input> */}
      <Button
        style={{ marginLeft: 12 }}
        onClick={() => {
          setRowKeysStr()
          setRowKeys([])
          setRows([])
          if (paramsCurrent?.params?.warehouseId) {
            console.log('')
          }
          if (tableXRef.current) {
            tableXRef.current.update()
          }
          setVisible(true)
        }}
      >
        请点击选择车辆
      </Button>
      <Modal
        visible={visible}
        title="选择"
        onCancel={() => setVisible(false)}
        onOk={() => {
          console.log(rowKeysStr, rowKeys, rows)
          onChange({ name: 'xxxxxxx', value: 2 })
          setVisible(false)
          getmoved(rows)
        }}
        maskClosable={false}
        width={900}
      >
        <TableX
          showTool={false}
          scroll={{ x: 1500 }}
          rowKey="id"
          ref={tableXRef}
          pagination={true}
          request={request}
          rowSelection={{
            type: selectType,
            selectedRowKeys: rowKeys,
            onChange: (selectRowKeys, selectedRows) => {
              setRowKeysStr(selectRowKeys.join(','))
              setRowKeys(selectRowKeys)
              setRows(selectedRows)
            },
          }}
          searchForm={[
            {
              label: 'Vin',
              name: 'vin',
              preset: 'text',
            },
          ]}
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
              title: '仓库',
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
            {
              dataIndex: 'createTime',
              title: '审核日期',
            },
          ]}
        />
      </Modal>
    </>
  )
}

export default React.forwardRef(TableSelectCar)
