import React from 'react'
import { Card, message, Upload, Button, Select, Tooltip } from 'antd'
import {
  UploadOutlined,
  CheckCircleTwoTone,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import ModalEdit from './ModalEdit'
import TableX from 'components/TableX'
// import Options from 'components/TableX/Options'
import axios from 'axios'
import { checkres, session } from 'utils'
import PageWrapper from 'components/PageWrapper'
import { saveAs } from 'file-saver'
import { SERVERDFWL } from 'configs/service'
import Modal from 'antd/lib/modal/Modal'
import Money from 'components/Money'
import AuthButton from 'components/Auth/AuthButton'
import moment from 'moment'

const { Option } = Select

export default function DepartureLog() {
  const recordRef = React.useRef({})
  const tableXRef = React.useRef()
  const paramsRef = React.useRef()

  const [modalEdit, setModalEdit] = React.useState({
    visible: false,
  })
  const [visible, setVisible] = React.useState(false)
  const [data, setData] = React.useState({})
  const [FINANCEOptions, setFINANCEOptions] = React.useState([])
  const [dealerOptions, setDealerOptions] = React.useState([])
  const [financeIdValue, setFinanceIdValue] = React.useState(null)
  // const [rowKeys, setRowKeys] = React.useState([])
  // const [rowKeysStr, setRowKeysStr] = React.useState()

  function request({ pageIndex, pageSize, fields = {} }) {
    paramsRef.current = { pageIndex, pageSize, ...fields }
    if (!fields.financeId) {
      setFinanceIdValue(null)
    }
    return axios
      .post(
        '/vehicle/importVehiclePage',
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
          // webAccessPath = webAccessPath.replace(/\\/g, '/')
          axios
            .get('/vehicle/import', {
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

  function handleSelectChange(value) {
    setFinanceIdValue(value)
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
              <span style={{ color: '#52c41a' }}>{data.vehicleSuccesNum}</span>
              条，导入失败
              <span style={{ color: '#eb2f96' }}>{data.vehicleFailedNum}</span>
              条
            </p>
          </div>
        </Modal>
        <TableX
          scroll={{ x: 1800 }}
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
          toolbarButtons={[
            // {
            //   preset: 'add',
            //   onClick: () => setModalEdit({ mode: 'add', visible: true }),
            // },
            // {
            //   preset: 'delete',
            //   onClick: () => {
            //     if (rowKeys.length === 0) {
            //       message.info('请选择一条数据')
            //       return false
            //     }
            //     Modal.confirm({
            //       title: '删除',
            //       content: '是否确认删除?',
            //       okText: '确认',
            //       cancelText: '取消',
            //       okType: 'danger',
            //       onOk() {
            //         rowKeys &&
            //           axios
            //             .get('/dealer/delete', {
            //               params: { ids: rowKeysStr },
            //             })
            //             .then(res => {
            //               if (res && res.data && res.data.code === 1) {
            //                 message.success(res.data.msg)
            //                 tableXRef.current.update()
            //                 setRowKeys([])
            //                 setRowKeysStr()
            //               } else {
            //                 message.error(res.data.msg)
            //               }
            //             })
            //       },
            //       onCancel() {},
            //     })
            //   },
            // },
            {
              label: '下载模板',
              onClick: () =>
                axios
                  .post(
                    '/vehicle/download',
                    { ...paramsRef.current },
                    {
                      responseType: 'blob',
                      baseURL: SERVERDFWL,
                    }
                  )
                  .then(res =>
                    saveAs(
                      res.data,
                      `车辆模板${moment().format('YYYYMMDDHHmmss')}.xls`
                    )
                  ),
            },
          ]}
          toolbarExtra={
            <>
              <Upload {...upprops}>
                <AuthButton
                  key="导入"
                  label="导入"
                  disabled={financeIdValue ? false : true}
                >
                  <UploadOutlined />
                  导入
                </AuthButton>
              </Upload>
              <Tooltip title="先选择资方后才能进行导入">
                <ExclamationCircleOutlined style={{ marginLeft: 12 }} />
              </Tooltip>
            </>
          }
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
                  onChange={handleSelectChange}
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
              style: { width: 180 },
            },
            {
              label: '订单单号',
              name: 'orderNo',
              preset: 'text',
              style: { width: 180 },
            },
          ]}
          columns={[
            {
              dataIndex: 'ticketNumber',
              title: '票号',
            },
            {
              dataIndex: 'financeName',
              title: '资方',
            },
            {
              dataIndex: 'orderNo',
              title: '订单单号',
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
              dataIndex: 'model',
              title: '车型',
            },
            {
              dataIndex: 'series',
              title: '车系',
            },
            {
              dataIndex: 'color',
              title: '颜色',
            },
            {
              dataIndex: 'price',
              title: '价格',
              render: v => <Money>{v}</Money>,
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
              dataIndex: 'vin',
              title: '车辆识别码',
            },
            {
              dataIndex: 'qualifiedNum',
              title: '合格证号',
            },
            {
              dataIndex: 'departTime',
              title: '发车时间',
              width: 180,
            },
            // {
            //   dataIndex: 'options',
            //   width: 100,
            //   fixed: 'right',
            //   title: <span style={{ marginLeft: 15 }}>操作</span>,
            //   render: (v, o) => (
            //     <Options
            //       buttons={[
            //         {
            //           preset: 'edit',
            //           onClick: () => {
            //             recordRef.current = o
            //             setModalEdit({
            //               mode: 'update',
            //               visible: true,
            //             })
            //           },
            //         },
            //       ]}
            //     ></Options>
            //   ),
            // },
          ]}
        />
      </Card>
    </PageWrapper>
  )
}
