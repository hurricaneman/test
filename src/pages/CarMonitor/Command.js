import React, { useEffect } from 'react'
import { Table, Modal } from 'antd'

// import axios from 'axios'
export default function Car(props) {
  const { vin } = props
  const [pagination, setPagination] = React.useState({ current: 1 })
  const [loading] = React.useState(false)
  const [confirmLoading] = React.useState(false)
  const [data, setData] = React.useState([])
  const [visible, setVisible] = React.useState(false)
  const [record, setRecord] = React.useState()
  const columns = [
    { dataIndex: 'commandName', title: '指令名称' },

    {
      dataIndex: '',
      title: '操作',
      render: record => (
        <>
          <a
            onClick={() => {
              setVisible(true)
              setRecord(record)
            }}
          >
            指令下发
          </a>
        </>
      ),
    },
  ]
  const reset = () => {
    console.log(record)
    // 重置数据
    setData([])
    setVisible(false)
    setRecord({})
    setPagination(v => ({ ...v, current: 1, total: 0 }))
  }

  useEffect(() => {
    if (!vin) return
    reset()
    // 查询该vin 的指令列表
    // axios
    //   .post('', {
    //     vin,
    //   })
    //   .then(({ data: res }) => {
    //     if (res.code === 1) {
    //       // setData(res.data)
    //     } else {
    //       message.error(res.msg)
    //     }
    //   })
    //   .catch(e => {
    //     setData([])
    //     message.error(e)
    //   })
    setData([])
  }, [vin])

  return (
    <>
      <Modal
        title="提示"
        visible={visible}
        onOk={() => {
          setVisible(false)
        }}
        confirmLoading={confirmLoading}
        onCancel={() => {
          setVisible(false)
        }}
      >
        {record && record.commandName}
      </Modal>
      <Table
        rowKey="type"
        loading={loading}
        columns={columns}
        className="table"
        pagination={{ pageSize: 10, ...pagination }}
        dataSource={data}
        onChange={pagination => {
          setPagination(v => ({ ...v, current: pagination.current }))
        }}
      />
    </>
  )
}
