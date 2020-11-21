import React from 'react'
import { Card, Modal, message, Tag, Upload, Button, Tooltip } from 'antd'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres, session } from 'utils'
import PageWrapper from 'components/PageWrapper'
import { SERVERDFWL } from 'configs/service'
import {
  UploadOutlined,
  CheckCircleTwoTone,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import AuthButton from 'components/Auth/AuthButton'
import moment from 'moment'
import { saveAs } from 'file-saver'

export default function Investor() {
  const recordRef = React.useRef({})
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()
  const [modalEdit, setModalEdit] = React.useState({
    visible: false,
  })

  const [visible, setVisible] = React.useState(false)
  const [data, setData] = React.useState({})
  const [rowKeys, setRowKeys] = React.useState([])
  const [rowKeysStr, setRowKeysStr] = React.useState()

  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(
        '/terminal/page',
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

  const upprops = {
    name: 'file',
    action: `${SERVERDFWL}/uploadFile/singleFileUpload`,
    headers: {
      Authorization: session.Authorization,
    },
    withCredentials: true,
    showUploadList: false,
    onChange: info => {
      if (info.file.status !== 'uploading') {
        if (info.file.response != null) {
          if (info.file.response.code === -1) {
            message.error('上传服务器失败')
            return
          }
          let { fileAcessPath } = info.file.response
          // webAccessPath = webAccessPath.replace(/\\/g, '/')
          axios
            .get('/terminal/importTerminalInfo', {
              params: { filePath: fileAcessPath },
              baseURL: SERVERDFWL,
            })
            .then(res => {
              if (res.data && res.data.code == 1) {
                // message.success('导入成功')
                setVisible(true)
                setData(res.data.data)
                tableXRef.current.update()
              } else {
                message.error(res.data.msg || '导入失败')
              }
            })
        }
      }
    },
  }

  const downFail = () => {
    axios
      .post('/vehicle/downloaderrorvehicleinfo', data.vehicleFailedList, {
        baseURL: SERVERDFWL,
        responseType: 'blob',
      })
      .then(res =>
        saveAs(res.data, `导入失败车辆${moment().format('YYYYMMDDHHmmss')}.xls`)
      )
  }

  return (
    <PageWrapper>
      <Card>
        <ModalEdit
          record={recordRef.current}
          onOk={() => tableXRef.current.update()}
          onCancel={() => setModalEdit({ visible: false })}
          {...modalEdit}
        />
        <Modal
          visible={visible}
          title="导入完成"
          onCancel={() => setVisible(false)}
          maskClosable={false}
          footer={[
            data &&
              data.vehicleFailedList &&
              data.vehicleFailedList.length > 0 && (
                <Button onClick={() => downFail()}>下载导入失败终端信息</Button>
              ),
            <Button type="primary" key="ok" onClick={() => setVisible(false)}>
              确定
            </Button>,
          ]}
        >
          <div>
            <div style={{ width: 60, margin: '12px auto' }}>
              <CheckCircleTwoTone
                style={{ fontSize: 50 }}
                twoToneColor="#52c41a"
              />
            </div>
            {/* <p style={{ textAlign: 'center' }}>
              本次导入成功
              <span style={{ color: '#52c41a' }}>{data.vehicleSuccesNum}</span>
              条，导入失败
              <span style={{ color: '#eb2f96' }}>{data.vehicleFailedNum}</span>
              条
            </p> */}
          </div>
        </Modal>
        <TableX
          scroll={{ x: true }}
          rowKey="id"
          ref={tableXRef}
          request={request}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: rowKeys,
            onChange: selectRowKeys => {
              setRowKeysStr(selectRowKeys.join(','))
              setRowKeys(selectRowKeys)
            },
          }}
          toolbarButtons={[
            {
              preset: 'add',
              onClick: () => setModalEdit({ mode: 'add', visible: true }),
            },
            {
              preset: 'delete',
              onClick: () => {
                if (rowKeys.length === 0) {
                  message.info('请选择一条数据')
                  return false
                }
                Modal.confirm({
                  title: '删除',
                  content: '是否确认删除?',
                  okText: '确认',
                  cancelText: '取消',
                  okType: 'danger',
                  onOk() {
                    rowKeys &&
                      axios
                        .get('/terminal/delete', {
                          params: { ids: rowKeysStr },
                          baseURL: SERVERDFWL,
                        })
                        .then(res => {
                          if (res && res.data && res.data.code === 1) {
                            message.success(res.data.msg)
                            tableXRef.current.update()
                            setRowKeys([])
                            setRowKeysStr()
                          } else {
                            message.error(res.data.msg)
                          }
                        })
                  },
                  onCancel() {},
                })
              },
            },
            {
              label: '下载模板',
              onClick: () =>
                axios
                  .post(
                    '/terminal/downloadTemplate',
                    { ...paramsRef.current },
                    {
                      responseType: 'blob',
                      baseURL: SERVERDFWL,
                    }
                  )
                  .then(res =>
                    saveAs(
                      res.data,
                      `终端模板${moment().format('YYYYMMDDHHmmss')}.xls`
                    )
                  ),
            },
          ]}
          toolbarExtra={
            <>
              <Upload {...upprops}>
                <AuthButton key="导入" label="导入">
                  <UploadOutlined />
                  导入
                </AuthButton>
              </Upload>
              <Tooltip title="需要下载导入终端模板">
                <ExclamationCircleOutlined style={{ marginLeft: 12 }} />
              </Tooltip>
            </>
          }
          searchForm={[
            {
              label: '车辆底盘号',
              name: 'vin',
              preset: 'text',
            },
            {
              label: 'SIM卡号',
              name: 'simCardNo',
              preset: 'text',
            },
            {
              label: '终端编号',
              name: 'terminalNo',
              preset: 'text',
            },
            {
              label: 'ICCID',
              name: 'iccid',
              preset: 'text',
            },
          ]}
          columns={[
            {
              dataIndex: 'id',
              title: '终端ID',
            },
            {
              dataIndex: 'vin',
              title: '车辆底盘号',
            },
            { dataIndex: 'terminalNo', title: '终端编号' },
            { dataIndex: 'simCardNo', title: 'SIM卡号' },
            { dataIndex: 'iccid', title: 'ICCID' },
            {
              dataIndex: 'status',
              title: '入网状态',
              render: v => (
                <Tag color={['red', 'green'][v]}>{['未入网', '已入网'][v]}</Tag>
              ),
            },
            // {
            //   dataIndex: 'address',
            //   title: '备注',
            // },
            {
              dataIndex: 'createTime',
              title: '创建时间',
            },
            {
              dataIndex: 'options',
              width: 160,
              fixed: 'right',
              title: <span style={{ marginLeft: 15 }}>操作</span>,
              render: (v, o) => (
                <Options
                  buttons={[
                    {
                      preset: 'edit',
                      onClick: () => {
                        recordRef.current = o
                        setModalEdit({
                          mode: 'update',
                          visible: true,
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
