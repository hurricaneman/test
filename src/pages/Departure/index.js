import React from 'react'
import { Card, Select, Button, Upload, message, Modal } from 'antd'
import TableX from 'components/TableX'
import { UploadOutlined, CheckCircleTwoTone } from '@ant-design/icons'
// import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres, session } from 'utils'
import PageWrapper from 'components/PageWrapper'
import { SERVERDFWL } from 'configs/service'
import Money from 'components/Money'
import { saveAs } from 'file-saver'
import AuthButton from 'components/Auth/AuthButton'
import moment from 'moment'

const { Option } = Select

export default function Departure() {
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()

  const [FINANCEOptions, setFINANCEOptions] = React.useState([])
  const [dealerOptions, setDealerOptions] = React.useState([])
  const [visible, setVisible] = React.useState(false)
  const [data, setData] = React.useState({})
  const [exportLoading, setExportLoading] = React.useState(false)
  const [exportLoadingAll, setExportLoadingAll] = React.useState(false)
  // const [rowKeys, setRowKeys] = React.useState([])
  // const [rowKeysStr, setRowKeysStr] = React.useState()

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

  React.useEffect(() => {
    axios
      .post(
        '/finance/institution/page',
        { pageIndex: 1, pageSize: 100000 },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return
        setFINANCEOptions(res.data.data.records)
      })
    axios
      .post(
        '/dealer/page',
        { pageIndex: 1, pageSize: 100000 },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return
        setDealerOptions(res.data.data.records)
      })
  }, [])

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
          scroll={{ x: 2800 }}
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
              label: '资方',
              name: 'financeId',
              preset: '',
              component: (
                <Select
                  showSearch
                  notFoundContent="无法找到"
                  style={{ width: 150 }}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {FINANCEOptions.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              ),
            },
            {
              label: '经销商',
              name: 'dealerId',
              preset: '',
              component: (
                <Select
                  showSearch
                  notFoundContent="无法找到"
                  style={{ width: 150 }}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {dealerOptions.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              ),
            },
            {
              label: '车辆识别码',
              name: 'vin',
              preset: 'text',
            },
            {
              label: '订单单号',
              name: 'orderNo',
              preset: 'text',
            },
            {
              label: '监管状态',
              name: 'status',
              preset: 'select',
              options: [
                { label: '在途', value: 1 },
                { label: '质押', value: 2 },
                { label: '释放', value: 3 },
                { label: '借车', value: 4 },
                { label: '销退', value: 5 },
              ],
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
            { dataIndex: 'orderNo', title: '订单号' },
            {
              dataIndex: 'ticketNumber',
              title: '票号',
            },
            {
              dataIndex: 'financeName',
              title: '资方',
            },
            {
              dataIndex: 'carFactory',
              title: '主机厂',
            },
            {
              dataIndex: 'dealerName',
              title: '经销商名称',
            },
            {
              dataIndex: 'brand',
              title: '品牌',
            },
            {
              dataIndex: 'vin',
              title: '车辆识别码',
            },
            {
              dataIndex: 'price',
              title: '价格',
              render: v => <Money>{v}</Money>,
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
              dataIndex: 'dealerCode',
              title: '经销商编号',
            },
            {
              dataIndex: 'series',
              title: '车系',
            },
            {
              dataIndex: 'model',
              title: '车型',
            },
            {
              dataIndex: 'color',
              title: '颜色',
            },
            {
              dataIndex: 'twentyDeposit',
              title: '已付金额/已付价格',
              render: v => <Money>{v}</Money>,
            },
            {
              dataIndex: 'balance',
              title: '赎证应付尾款',
              render: v => <Money>{v}</Money>,
            },
            {
              dataIndex: 'engineNumber',
              title: '发动机号',
            },

            {
              dataIndex: 'status',
              title: '车辆监管状态',
              render: v => ['', '在途', '质押', '释放', '借车', '销退'][v],
            },

            {
              dataIndex: 'departTime',
              title: '发车时间',
            },
            {
              dataIndex: 'arriveTime',
              title: '入库时间',
            },
            {
              dataIndex: 'qualifiedNum',
              title: '合格证号',
            },
            {
              dataIndex: 'qualifiedStatus',
              title: '合格证状态',
              render: v => {
                switch (v) {
                  case 1002:
                    return '在途'
                  case 1003:
                    return '质押'
                  case 1004:
                    return '释放'
                  case 1005:
                    return '销退'
                  default:
                    return '--'
                }
              },
            },
            {
              dataIndex: 'releaseTime',
              title: '释放时间',
            },
            {
              dataIndex: '',
              title: '钥匙状态',
              render: o =>
                `${['', '在途', '质押', '释放', '借车', '销退'][o.status]}/${
                  o.keyNumber || o.keyNumber === 0 ? o.keyNumber : '-'
                }把`,
            },
          ]}
        />
      </Card>
    </PageWrapper>
  )
}
