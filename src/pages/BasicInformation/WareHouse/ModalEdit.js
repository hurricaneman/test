import React from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Modal, Input, Radio, message, Select, Tag, Row, Col } from 'antd'
import axios from 'axios'
import { checkres, session } from 'utils'
import TableSelect from 'components/TableSelect'
import { SERVERDFWL } from 'configs/service'
import { Map, Circle } from 'react-amap'

const { Option } = Select

function ModalEdit(props) {
  const {
    visible,
    onCancel,
    onOk,
    mode,
    record,
    form,
    form: { getFieldDecorator: f },
    organizationType,
    url,
    columns,
    searchForm,
    scrollX,
  } = props
  const [loading, setLoading] = React.useState()
  const tableSeletRef = React.useRef()
  const tableSeletRef2 = React.useRef()
  const [mapCenter, setMapCenter] = React.useState({
    longitude: 114.291272,
    latitude: 30.60403,
  })
  // const [getAddress, setgetAddress] = React.useState('')
  const [zoom, setZoom] = React.useState(5)
  const [radius, setRadius] = React.useState(1500)
  const [hasMarker, setHasMarker] = React.useState(false)
  const [toolEvents] = React.useState({
    created: () => {},
    click(obj) {
      setZoom(13)
      setMapCenter({
        longitude: obj.lnglat.lng,
        latitude: obj.lnglat.lat,
      })
      setHasMarker(true)
    },
  })
  const [mapPlugins] = React.useState(['ToolBar'])

  async function radiusChage(rule, value) {
    if (value) {
      setRadius(value * 1000)
    }
    return Promise.resolve()
  }

  React.useEffect(() => {
    fetch(
      `https://restapi.amap.com/v3/geocode/regeo?key=f60167380d1e1a408d6e5260a51be164&location=${mapCenter.longitude},${mapCenter.latitude}&poitype=&radius=&extensions=all&batch=false&roadlevel=0`
    )
      .then(function(response) {
        return response.json()
      })
      .then(function(myJson) {
        if (myJson.status === '1') {
          if (hasMarker) {
            form.setFieldsValue({
              address: myJson.regeocode.formatted_address,
            })
          }
        }
      })
  }, [mapCenter, hasMarker])

  React.useEffect(() => {
    if (!visible) return
    if (mode === 'add') {
      form.resetFields()
      setZoom(5)
      setHasMarker(false)
      setMapCenter({
        longitude: 114.291272,
        latitude: 30.60403,
      })
      setRadius(1500)
    }
    if (mode === 'update') {
      form.setFieldsValue({
        name: record.name,
        code: record.code,
        address: record.address,
        // longitude: record.longitude,
        // latitude: record.latitude,
        radius: record.radius,
        type: record.type,
        staffUserId: record.staffUserId
          ? { name: record.staffUsername, value: record.staffUserId }
          : { name: '', value: '' },
        status: record.status,
        dealerId: {
          name: record.dealerName,
          value: record.dealerId,
        },
      })
      setZoom(13)
      setHasMarker(true)
      setMapCenter({
        longitude: record.longitude,
        latitude: record.latitude,
      })
      setRadius(record.radius * 1000)
    }
  }, [visible])

  function onSubmit() {
    form.validateFields(async (err, fields) => {
      if (err) return
      if (!hasMarker) {
        message.info('请先选择地图上的网点位置')
        return
      }
      setLoading(true)

      if (mode === 'update') {
        fields.id = record.id
      }
      fields.dealerId = fields.dealerId.value
      fields.staffUserId = fields.staffUserId.value
      fields.longitude = mapCenter.longitude
      fields.latitude = mapCenter.latitude
      // fields.address = getAddress
      await axios
        .post(
          '/warehouse/' + mode,
          { ...fields },
          {
            baseURL: SERVERDFWL,
          }
        )
        .then(res => {
          setLoading(false)
          if (!checkres(res)) return
          if (res.data.code === 1) {
            message.success(res.data.msg)
            onOk()
            tableSeletRef.current.clean()
            tableSeletRef2.current.clean()
          } else {
            message.error(res.data.msg)
          }
        })
    })
  }

  return (
    <Modal
      visible={visible}
      title={mode === 'add' ? '新增' : '修改'}
      onCancel={onCancel}
      okText="确认"
      cancelText="取消"
      onOk={onSubmit}
      confirmLoading={loading}
      width={1000}
    >
      <Form
        layout="horizontal"
        wrapperCol={{ span: 18 }}
        labelCol={{ span: 6 }}
        className="LowSmallForm"
      >
        <Row>
          <Col span={12}>
            <Form.Item label="网点名称">
              {f('name', {
                rules: [
                  {
                    required: true,
                    message: '网点名称必填',
                  },
                ],
              })(<Input type="text" maxLength="50" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="网点代码">
              {f('code', {
                rules: [
                  {
                    required: false,
                    message: '网点代码必填',
                  },
                ],
              })(
                <Input
                  disabled={mode === 'update' ? true : false}
                  type="text"
                  maxLength="50"
                />
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="经销商名称">
              {f('dealerId', {
                rules: [
                  {
                    required: true,
                    message: '经销商名称必填',
                  },
                ],
              })(
                <TableSelect
                  scrollX={scrollX}
                  ref={tableSeletRef}
                  mode={mode}
                  url={url}
                  params={{ organizationType }}
                  columns={columns}
                  searchForm={searchForm}
                ></TableSelect>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="网点地址">
              {f('address', {
                rules: [
                  {
                    required: true,
                    message: '网点地址必填',
                  },
                ],
              })(<Input disabled type="text" maxLength="50" />)}
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item label="地理经度">
              {f('longitude', {
                rules: [
                  {
                    required: false,
                    message: '移动额度必填',
                  },
                ],
              })(<Input type="text" maxLength="50" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="地理纬度">
              {f('latitude', {
                rules: [
                  {
                    required: false,
                    message: '移动额度必填',
                  },
                ],
              })(<Input type="text" maxLength="50" />)}
            </Form.Item>
          </Col> */}
          <Col span={12}>
            <Form.Item label="网点分类">
              {f('type', {
                rules: [
                  {
                    required: true,
                    message: '网点分类必填',
                  },
                ],
              })(
                <Select>
                  <Option key={0} value={0}>
                    主库
                  </Option>
                  <Option key={1} value={1}>
                    二库
                  </Option>
                  <Option key={2} value={2}>
                    合作二网
                  </Option>
                  <Option key={3} value={3}>
                    直营二网
                  </Option>
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="盘点人员">
              {f('staffUserId', {
                rules: [
                  {
                    required: true,
                    message: '盘点人员必填',
                  },
                ],
              })(
                <TableSelect
                  scrollX={null}
                  baseURL={0}
                  ref={tableSeletRef2}
                  mode={mode}
                  url="/user/list"
                  dealWith={true}
                  rowKey="userId"
                  selectName="realname"
                  columns={[
                    {
                      dataIndex: 'realname',
                      title: '员工姓名',
                    },
                    { dataIndex: 'username', title: '手机号' },
                    { dataIndex: 'userLevelName', title: '个人类型' },
                    {
                      dataIndex: 'organizationName',
                      title: '隶属单位',
                    },
                    {
                      dataIndex: 'status',
                      title: '状态',
                      width: 80,
                      render: v => (
                        <Tag color={['red', 'green'][v]}>
                          {['停用', '正常'][v]}
                        </Tag>
                      ),
                    },
                  ]}
                  searchForm={[
                    {
                      label: '员工名称',
                      name: 'realname',
                      preset: 'text',
                    },
                    {
                      label: '员工类型',
                      name: 'organizationType',
                      preset: 'select',
                      options: [
                        { label: '监管员', value: 'REGULATOR' },
                        { label: '经销商人员', value: 'DEALER' },
                      ],
                    },
                  ]}
                  searchFormInitialValues={{
                    organizationType: 'REGULATOR',
                  }}
                ></TableSelect>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="有效标志">
              {f('status', {
                rules: [
                  {
                    required: true,
                    message: '有效标志必填',
                  },
                ],
                initialValue: 1,
              })(
                <Radio.Group>
                  <Radio value={0}>无效</Radio>
                  <Radio value={1}>有效</Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="围栏半径(km)">
              {f('radius', {
                rules: [
                  {
                    required: true,
                    message: '围栏半径必填',
                  },
                  {
                    pattern: /^[1-9](\.\d+)?$/,
                    message: '必须输入小于10的数字',
                  },
                  { validator: radiusChage },
                ],
                validateTrigger: 'onBlur',
                initialValue: 1.5,
              })(<Input type="text" maxLength="50" />)}
            </Form.Item>
          </Col>
          <Col span={24}>
            <div style={{ width: '100%', height: 300 }}>
              <Map
                amapkey={'f97efc35164149d0c0f299e7a8adb3d2'}
                plugins={mapPlugins}
                center={mapCenter}
                zoom={zoom}
                events={toolEvents}
              >
                {!!hasMarker && (
                  <Circle
                    center={mapCenter}
                    radius={radius}
                    style={{
                      strokeColor: session['@/System/CssUrl']
                        ? 'var(--PC)'
                        : '#1890ff',
                      strokeOpacity: 0.3,
                      fillColor: session['@/System/CssUrl']
                        ? 'var(--PC)'
                        : '#1890ff',
                      fillOpacity: 0.3,
                    }}
                  ></Circle>
                )}
              </Map>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default Form.create()(ModalEdit)
