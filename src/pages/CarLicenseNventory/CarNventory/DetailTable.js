import React from 'react'
import TableX from 'components/TableX'
import axios from 'axios'
import { checkres } from 'utils'
import { Tag } from 'antd'
import { SERVERDFWL } from 'configs/service'
import Money from 'components/Money'
import Options from 'components/TableX/Options'

function DetailTable(props) {
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()
  console.log(props)
  const [record, setRecord] = React.useState({})
  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(
        '/vehiclecheckinfo/queryvehiclecheckinfo',
        {
          pageIndex,
          pageSize,
          vehicleCheckRecordId: record.checkReport,
          ...fields,
        },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return []
        return {
          list: res.data.data.records,
          total: res.data.data.totalCount,
        }
      })
  }

  React.useEffect(() => {
    setRecord(props.record)
    tableXRef.current.update()
  }, [props])

  //判读
  function Read(v) {
    console.log(v)
  }

  //显示异常信息及修改提交
  function ShowLog(v) {
    console.log(v)
  }

  return (
    <>
      <TableX
        showTool={false}
        scroll={{ x: 1400 }}
        rowKey="id"
        ref={tableXRef}
        request={request}
        // rowSelection={{
        //   //type: selectType,
        //   selectedRowKeys: rowKeys,
        //   onChange: (selectRowKeys, selectedRows) => {
        //     setRowKeysStr(selectRowKeys.join(','))
        //     setRowKeys(selectRowKeys)
        //     setRows(selectedRows)
        //   },
        // }}
        searchForm={[
          {
            label: '车辆识别码',
            name: 'vin',
            preset: 'text',
            width: 230,
          },
          {
            label: '是否合格',
            name: 'status',
            preset: 'select',
            options: [
              { label: '未盘点', value: 0 },
              { label: '盘点正常', value: 1 },
              { label: '异常', value: 2 },
            ],
          },
        ]}
        columns={[
          {
            dataIndex: 'serialNumber',
            title: '流水号',
          },
          {
            dataIndex: 'vin',
            title: '车辆识别码',
            width: 200,
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
            dataIndex: 'rfid',
            title: 'rfid',
          },
          {
            dataIndex: 'code',
            title: '图片',
          },
          {
            dataIndex: 'status',
            title: '是否合格',
            render: v => (
              <Tag color={['yellow', 'green', 'red'][v]}>
                {['未盘点', '盘点正常', '异常'][v]}
              </Tag>
            ),
          },
          {
            dataIndex: 'exceptionCause',
            title: '异常详情',
            render: (r, v) => <a onClick={v => ShowLog(v)}>{v}</a>,
          },
          {
            dataIndex: 'price',
            title: '价格',
            render: v => (v ? <Money>{v}</Money> : ''),
          },
          {
            dataIndex: 'vehicleTypeName',
            title: '车型',
          },
          {
            dataIndex: 'option',
            title: '判读',
            render: (r, record) => (
              <Options
                buttons={[
                  {
                    label: '判读',
                    onClick: () => {
                      Read(record)
                    },
                  },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  )
}

export default React.forwardRef(DetailTable)
