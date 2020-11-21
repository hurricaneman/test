import React from 'react'
import { Input, Button, Modal } from 'antd'
import TableX from 'components/TableX'
import axios from 'axios'
import { checkres } from 'utils'
import { SERVERDFWL, SERVER } from 'configs/service'

function TableSelect(props, ref) {
  const {
    value = { name: null, value: null },
    mode,
    onChange,
    selectType = 'radio',
    params = {},
    url = '',
    columns = [],
    searchForm = [],
    scrollX = 1200,
    baseURL = 1, //0:admin 1:dfwl
    disabled = false,
    searchFormInitialValues, //默认搜索值
    dealWith = false, //处理参数
    rowKey = 'id',
    selectName = 'name',
  } = props
  const [visible, setVisible] = React.useState(false)
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()

  const [rowKeys, setRowKeys] = React.useState([])
  const [rows, setRows] = React.useState([])
  // const [rowKeysStr, setRowKeysStr] = React.useState()

  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    if (fields.organizationType && dealWith) {
      if (fields.organizationType === 'REGULATOR') {
        fields.userLevel = 6
      } else if (fields.organizationType === 'DEALER') {
        fields.userLevel = 7
      }
    }
    return axios
      .post(
        url,
        { pageIndex, pageSize, ...params, ...fields },
        { baseURL: [SERVER, SERVERDFWL][baseURL] }
      )
      .then(res => {
        if (!checkres(res)) return []
        return {
          list: res.data.data.records,
          total: res.data.data.total,
        }
      })
  }

  React.useImperativeHandle(ref, () => ({
    clean: () => {
      cleanRow()
    },
  }))

  const cleanRow = () => {
    setRowKeys([])
    setRows([])
  }

  React.useEffect(() => {
    if (!visible) return
    if (mode === 'update') {
      setRowKeys([value.value])
      setRows([value])
    }
  }, [visible, mode])

  return (
    <>
      <Input
        value={value.name}
        onChange={onChange}
        disabled
        style={{ width: 'calc(100% - 76px)' }}
      ></Input>
      <Button
        disabled={disabled}
        style={{
          marginLeft: 12,
        }}
        onClick={() => setVisible(true)}
      >
        选择
      </Button>
      <Modal
        visible={visible}
        title="选择"
        onCancel={() => setVisible(false)}
        onOk={() => {
          onChange({ name: rows[0][selectName], value: rows[0][rowKey] })
          setVisible(false)
        }}
        maskClosable={false}
        width={900}
      >
        <TableX
          showTool={false}
          scroll={{ x: scrollX }}
          rowKey={rowKey}
          ref={tableXRef}
          request={request}
          rowSelection={{
            type: selectType,
            selectedRowKeys: rowKeys,
            onChange: (selectRowKeys, selectedRows) => {
              // setRowKeysStr(selectRowKeys.join(','))
              setRowKeys(selectRowKeys)
              setRows(selectedRows)
            },
          }}
          searchForm={searchForm}
          searchFormInitialValues={searchFormInitialValues}
          columns={columns}
        />
      </Modal>
    </>
  )
}

export default React.forwardRef(TableSelect)
