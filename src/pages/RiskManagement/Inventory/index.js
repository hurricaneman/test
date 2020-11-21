import React from 'react'
import { Card, Select, Button, Upload, message, Modal } from 'antd'
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
          scroll={{ x: 1600 }}
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
            // {
            //   label: '订单单号',
            //   name: 'orderNo',
            //   preset: 'text',
            // },
            // {
            //   label: '监管状态',
            //   name: 'status',
            //   preset: 'select',
            //   options: [
            //     { label: '在途', value: 1 },
            //     { label: '质押', value: 2 },
            //     { label: '释放', value: 3 },
            //     { label: '借车', value: 4 },
            //     { label: '销退', value: 5 },
            //   ],
            // },
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
            { dataIndex: 'orderNo', title: '经销商' },
            {
              dataIndex: 'ticketNumber',
              title: '在途',
              children: [
                {
                  dataIndex: 'Number',
                  title: '数量',
                },
                {
                  dataIndex: 'ber',
                  title: '金额',
                },
              ],
            },
            {
              dataIndex: 'financeName',
              title: '总库存',
              children: [
                {
                  dataIndex: 'Number1',
                  title: '数量',
                },
                {
                  dataIndex: 'ber1',
                  title: '金额',
                },
              ],
            },
            {
              title: '库存分布',
              dataIndex: 'financeName1',
              children: [
                {
                  title: '主库',
                  children: [
                    {
                      dataIndex: 'Number2',
                      title: '数量',
                    },
                    {
                      dataIndex: 'ber3',
                      title: '金额',
                    },
                  ],
                },
                {
                  title: '仓库',
                  dataIndex: 'financeName2',
                  children: [
                    {
                      dataIndex: 'Number3',
                      title: '数量',
                    },
                    {
                      dataIndex: 'ber4',
                      title: '金额',
                    },
                  ],
                },
                {
                  title: '直营二网',
                  dataIndex: 'financeNam1',
                  children: [
                    {
                      dataIndex: 'Number5',
                      title: '数量',
                    },
                    {
                      dataIndex: 'ber5',
                      title: '金额',
                    },
                  ],
                },
                {
                  title: '合作二网',
                  dataIndex: 'financeNm1',
                  children: [
                    {
                      dataIndex: 'Number6',
                      title: '数量',
                    },
                    {
                      dataIndex: 'ber6',
                      title: '金额',
                    },
                  ],
                },
                {
                  title: '借车',
                  dataIndex: 'finceNam1',
                  children: [
                    {
                      dataIndex: 'Number7',
                      title: '数量',
                    },
                    {
                      dataIndex: 'ber7',
                      title: '金额',
                    },
                  ],
                },
                {
                  title: '待处理异常',
                  dataIndex: 'fin1',
                  children: [
                    {
                      dataIndex: 'mber7',
                      title: '私移',
                      children: [
                        {
                          dataIndex: 'Ner7g',
                          title: '数量',
                        },
                        {
                          dataIndex: 'ber7fg',
                          title: '金额',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              dataIndex: 'dealerName',
              title: '移库在途',
              children: [
                {
                  dataIndex: 'Nuwer7',
                  title: '数量',
                },
                {
                  dataIndex: 'bewr7',
                  title: '金额',
                },
              ],
            },
          ]}
        />
      </Card>
    </PageWrapper>
  )
}
