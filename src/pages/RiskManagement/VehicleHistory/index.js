import React from 'react'
import { Card, Button, Upload, message, Modal } from 'antd'
import TableX from 'components/TableX'
import { UploadOutlined, CheckCircleTwoTone } from '@ant-design/icons'
// import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres, session } from 'utils'
import PageWrapper from 'components/PageWrapper'
import { SERVERDFWL } from 'configs/service'
import { saveAs } from 'file-saver'
import AuthButton from 'components/Auth/AuthButton'
import moment from 'moment'
import Detail from './Detail.js'
import Options from 'components/TableX/Options'

export default function Departure() {
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()
  const [visible, setVisible] = React.useState(false)
  const [data, setData] = React.useState({})
  const [exportLoading, setExportLoading] = React.useState(false)
  const [exportLoadingAll, setExportLoadingAll] = React.useState(false)
  const [drawerInfo, setDrawerInfo] = React.useState({
    visible: false,
  })
  // const [rowKeys, setRowKeys] = React.useState([])
  // const [rowKeysStr, setRowKeysStr] = React.useState()
  console.log(exportLoading, exportLoadingAll)
  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    return axios
      .post(
        '/vehicle/page',
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
          axios
            .get('/vehicle/importRelease', {
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
      .post('/vehicle/downloadErrorReleaseInfo', data.vehicleFailedList, {
        baseURL: SERVERDFWL,
        responseType: 'blob',
      })
      .then(res =>
        saveAs(res.data, `导入失败车辆${moment().format('YYYYMMDDHHmmss')}.xls`)
      )
  }

  return (
    <PageWrapper>
      <Detail
        onCancel={() => {
          //tableXRef.current.update()
          setDrawerInfo({ visible: false, record: {} })
        }}
        {...drawerInfo}
      ></Detail>
      <Card>
        <Modal
          visible={visible}
          title="导入完成"
          onCancel={() => setVisible(false)}
          maskClosable={false}
          footer={[
            data &&
              data.releaseFailedList &&
              data.releaseFailedList.length > 0 && (
                <Button onClick={() => downFail()}>下载导入失败车辆</Button>
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
            <p style={{ textAlign: 'center' }}>
              本次导入成功
              <span style={{ color: '#52c41a' }}>{data.releaseSuccesNum}</span>
              条，导入失败
              <span style={{ color: '#eb2f96' }}>{data.releaseFailedNum}</span>
              条
            </p>
          </div>
        </Modal>
        <TableX
          scroll={{ x: 1500 }}
          rowKey="id"
          ref={tableXRef}
          request={request}
          // rowSelection={{
          //   type: 'checkbox',
          //   selectedRowKeys: rowKeys,
          //   onChange: selectRowKeys => {
          //     setRowKeysStr(selectRowKeys.join(','))
          //     setRowKeys(selectRowKeys)
          //   },
          // }}
          searchForm={[
            {
              label: '车辆识别码',
              name: 'vin',
              preset: 'text',
            },
            {
              label: '业务单号',
              name: 'orderNo',
              preset: 'text',
            },
          ]}
          toolbarButtons={[
            {
              label: '导出当前',
              loading: exportLoading,
              onClick: () => {
                setExportLoading(true)
                axios
                  .post(
                    '/vehicle/export',
                    { ...paramsRef.current, sign: 0 },
                    {
                      responseType: 'blob',
                      baseURL: SERVERDFWL,
                    }
                  )
                  .then(res => {
                    setExportLoading(false)
                    saveAs(
                      res.data,
                      `当前页车辆信息导出${moment().format(
                        'YYYYMMDDHHmmss'
                      )}.xls`
                    )
                  })
              },
            },
            {
              label: '导出全部',
              loading: exportLoadingAll,
              onClick: () => {
                setExportLoadingAll(true)
                axios
                  .post(
                    '/vehicle/export',
                    { ...paramsRef.current, sign: 1 },
                    {
                      responseType: 'blob',
                      baseURL: SERVERDFWL,
                    }
                  )
                  .then(res => {
                    setExportLoadingAll(false)
                    saveAs(
                      res.data,
                      `全部车辆信息导出${moment().format('YYYYMMDDHHmmss')}.xls`
                    )
                  })
              },
            },
          ]}
          toolbarExtra={
            <Upload {...upprops}>
              <AuthButton key="释放车辆导入" label="释放车辆导入">
                <UploadOutlined />
                释放车辆导入
              </AuthButton>
            </Upload>
          }
          columns={[
            { dataIndex: 'orderNo', title: '车辆识别码' },
            {
              dataIndex: 'ticketNumber',
              title: '发车单号',
            },
            {
              dataIndex: 'financeName',
              title: '经销商',
            },
            {
              dataIndex: 'carFactory',
              title: '仓库',
            },
            {
              dataIndex: 'dealerName',
              title: '质押状态',
            },
            {
              dataIndex: 'brand',
              title: '证状态',
            },
            {
              dataIndex: 'vin',
              title: '业务单号',
            },
            {
              dataIndex: 'price',
              title: '接车日期',
            },
            {
              dataIndex: 'warehouseName',
              title: '释放日期',
            },
            {
              dataIndex: 'warehouseType',
              title: '金融机构收证',
            },
            {
              dataIndex: 'dealerCode',
              title: '监管总部收证',
            },
            {
              dataIndex: 'wehouseType',
              title: '监管总部发证',
            },
            {
              dataIndex: 'dealeode',
              title: '监管员收证',
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
