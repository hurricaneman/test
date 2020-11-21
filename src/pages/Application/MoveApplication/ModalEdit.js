import React from 'react'
import {
  Modal,
  Input,
  Form,
  Row,
  Col,
  Radio,
  Card,
  Button,
  Select,
  DatePicker,
  Alert,
  message,
} from 'antd'
import axios from 'axios'
import { checkres } from 'utils'
import TableSelectCar from './CarTableList'
import { SERVERDFWL } from 'configs/service'
import { session } from 'utils'
import CarTable from './CarTable'
import moment from 'moment'
import UploadImg from 'components/UploadImg'
const { RangePicker } = DatePicker

const Option = Select.Option
//const selectTableRef = useRef() //定义一个空的
export default function ModalEdit(props) {
  const { visible, onCancel, onOk, mode, record } = props
  const [loading, setLoading] = React.useState()
  const [form] = Form.useForm()
  const formValuesRef = React.useRef(record)
  const pic1 = React.useRef()
  const file1 = React.useRef()

  const [dealersOptions, setDealersOptions] = React.useState([])
  const [wareOptions, setWareOptions] = React.useState([])
  const [dealerId, setDealersId] = React.useState(record?.dealerId)
  const [applyOddNumber, setApplyOddNumber] = React.useState('')
  const [formValues, setFormValues] = React.useState(record)
  const selectCarRef = React.useRef({ rows: [] })
  const currentSelectedCarRef = React.useRef(null)
  const [updataCarlist, setUpdataCarlist] = React.useState([])

  React.useEffect(() => {
    if (mode == 'add') {
      setFormValues({
        status: 1,
      })
    } else if (mode == 'update') {
      setFormValues({
        ...record,
      })
    }
  }, [mode, record])

  React.useEffect(() => {
    if (!visible) return
    switch (mode) {
      case 'add':
        {
          setUpdataCarlist([])
          currentSelectedCarRef.current = null
          selectCarRef.current = { rows: [] }
          form.resetFields()
        }
        break
      case 'update':
        {
          selectCarRef.current = { rows: [] }
          const copyRecord = { ...record }
          copyRecord['applyDate'] = copyRecord.applyDate
            ? moment(record.applyDate, 'YYYY-MM-DD HH:MM:SS')
            : null

          copyRecord['returnDate'] = [
            copyRecord?.returnStartDate
              ? moment(copyRecord.returnStartDate, 'YYYY-MM-DD')
              : null,
            copyRecord?.returnEndDate
              ? moment(copyRecord.returnEndDate, 'YYYY-MM-DD')
              : null,
          ]
          form.setFieldsValue({
            ...copyRecord,
          })
        }
        break
    }
  }, [visible])

  function onSubmit(status) {
    if (currentSelectedCarRef?.current?.list.length == 0) {
      message.warning('至少选择一台车辆')
      return
    }

    console.log(pic1.current, file1.current)
    form.validateFields().then(fields => {
      fields['userId'] = session.userData.userId
      fields['vehicleIds'] = currentSelectedCarRef.current.list
        .map(t => t.id)
        .join()
      fields['applyDate'] = fields?.applyDate?.format('YYYY-MM-DD HH:MM:SS')
      if (fields.status != 1) {
        fields['returnStartDate'] = fields?.returnDate
          ? fields?.returnDate[0]?.format('YYYY-MM-DD')
          : null
        fields['returnEndDate'] = fields?.returnDate
          ? fields?.returnDate[1]?.format('YYYY-MM-DD')
          : null
      }
      fields['applyStatus'] = status
      fields['imgs'] = pic1.current
      fields['files'] = file1.current
      //fields returnDate
      delete fields.returnDate
      setLoading(true)
      if (mode === 'update') {
        fields.id = record.id
        axios
          .post(
            '/mobileapplication/updateinfo',
            { ...fields },
            { baseURL: SERVERDFWL }
          )
          .then(res => {
            setLoading(false)
            if (!checkres(res)) return
            onCancel()
            onOk()
          })
      } else if (mode === 'add') {
        axios
          .post(
            '/mobileapplication/addmobileapplication',
            { ...fields },
            { baseURL: SERVERDFWL }
          )
          .then(res => {
            setLoading(false)
            if (!checkres(res)) return
            onCancel()
            onOk()
          })
      }
    })
  }

  function onCancelData() {
    axios
      .get('mobileapplication/revocationapplication', {
        params: { mobileApplicationId: record.id },
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        onCancel()
      })
  }

  function handleSelectChange(value) {
    setUpdataCarlist([])
    setDealersId(value)
    initGetMoveValue(value)
  }

  function setValuesForm(changedValues, allValues) {
    formValuesRef.current = allValues
    setFormValues(allValues)
  }

  //获取移动比的接口
  function initGetMoveValue(value) {
    return axios
      .post(
        '/regulatory/ratio/page',
        { dealerId: value },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return []
        console.log(res)
        form.setFieldsValue({
          moveProportion: res.data.data?.records[0]?.moveRatio,
          moveRule: res.data.data?.records[0]?.moveRule,
        })
      })
  }

  //  移动后监管比计算
  function getmoved(rows) {
    if (formValues.status != 1) {
      return
    }
    axios
      .get('/regulatory/ratio/moved', {
        params: {
          warehouseId: form.getFieldValue('warehouseId'),
          vehicleIds: rows.map(t => t.id).join(),
          moveRule: form.getFieldValue('moveRule'),
          dealerId: form.getFieldValue('dealerId'),
        },
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        console.log(res)
        form.setFieldsValue({
          moveProportionResidue: res.data.data,
        })
      })
  }

  // React.useEffect(() => {
  //   console.log(currentSelectedCarRef, 'currentSelectedCarRef')
  //   if (currentSelectedCarRef.current?.list.length > 0) {
  //     getmoved()
  //   }
  // }, [currentSelectedCarRef.current])

  React.useEffect(() => {
    axios
      .get('/vehiclecheck/getdealerbysupervisors', {
        params: {},
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        setDealersOptions(res.data?.data ? res.data.data : [])
      })
  }, [record])

  React.useEffect(() => {
    axios
      .get('/vehiclecheck/getdealerwarehouse', {
        params: { dealerId: mode === 'update' ? record.dealerId : dealerId },
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        console.log(res)
        setWareOptions(res.data.data)
      })
  }, [dealerId, record])

  React.useEffect(() => {
    axios
      .get('/mobileapplication/applyoddnumber', {
        params: {},
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        setApplyOddNumber(res.data.data)
      })
  }, [])

  ///mobileapplication/queryapplyinfo  根据申请记录，查询申请明细
  React.useEffect(() => {
    if (record?.id) {
      axios
        .get('/mobileapplication/queryapplyinfo', {
          params: { mobileApplicationId: record.id },
          baseURL: SERVERDFWL,
        })
        .then(res => {
          if (!checkres(res)) return []
          setUpdataCarlist(res.data.data)
        })
    }
  }, [record])

  return (
    <Modal
      visible={visible}
      title={mode === 'add' ? '新增' : '修改'}
      onCancel={onCancel}
      maskClosable={false}
      confirmLoading={loading}
      width={1300}
      footer={
        <>
          <Button onClick={() => onSubmit(0)} type="primary">
            保存
          </Button>
          <Button onClick={() => onSubmit(1)} type="primary">
            提交
          </Button>
          {mode === 'add' || mode === 'update' ? null : (
            <Button type="dashed" onClick={() => onCancelData()}>
              撤销
            </Button>
          )}
        </>
      }
    >
      <Card>
        <Form
          form={form}
          wrapperCol={{ span: 14 }}
          labelCol={{ span: 7 }}
          initialValues={{
            userName: session.userData.username,
            applyDate: moment(new Date()),
          }}
          className="LowSmallForm"
          onValuesChange={setValuesForm}
        >
          <Row>
            <Col span={12}>
              <Form.Item
                name="dealerId"
                label="经销商"
                rules={[{ required: true, message: '监管机构为必填' }]}
              >
                <Select
                  showSearch
                  notFoundContent="无法找到"
                  id="select"
                  onChange={handleSelectChange}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  disabled={mode === 'update' ? true : false}
                >
                  {dealersOptions.map(t => (
                    <Option key={t.id} value={t.id}>
                      {t.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="移库借车"
                rules={[{ required: false }]}
                initialValue={1}
              >
                <Radio.Group>
                  <Radio value={1}>移库</Radio>
                  <Radio value={2}>借车</Radio>
                  <Radio value={3}>借钥匙</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            {formValues.status === 2 || formValues.status === 3 ? (
              <Col span={12}></Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  name="warehouseId"
                  label="网点"
                  rules={[{ required: formValues.status === 1 ? true : false }]}
                >
                  <Select
                    id="select"
                    disabled={formValues.status === 2 ? true : false}
                  >
                    {wareOptions.map(t => (
                      <Option key={t.id} value={t.id}>
                        {t.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item
                name="vehicleIds"
                label="选择车辆"
                rules={[{ required: false }]}
              >
                <TableSelectCar
                  params={formValuesRef.current}
                  ref={selectCarRef}
                  record={record}
                  mode={mode}
                  getmoved={getmoved}
                ></TableSelectCar>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="applyOddNumber"
                label="申请单号"
                initialValue={applyOddNumber}
                rules={[{ required: true, message: '监管机构代码为必填' }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="userName"
                label="申请人"
                rules={[{ required: true }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="applyDate"
                label="申请日期"
                rules={[{ required: false }]}
              >
                <DatePicker disabled={true}></DatePicker>
              </Form.Item>
            </Col>
            {formValues.status === 1 ? (
              <Col span={12}></Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  name="returnDate"
                  label={formValues.status == 3 ? '借钥匙日期' : '借车日期'}
                  rules={[{ required: true }]}
                >
                  <RangePicker />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item
                name="moveProportion"
                label="移动比"
                rules={[{ required: false }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="moveProportionResidue"
                label="移动后的剩余比例"
                rules={[{ required: false }]}
              >
                <Input disabled={true}></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="remark"
                label="备注"
                rules={[{ required: false }]}
              >
                <Input type="textarea" rows="3"></Input>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name="img"
                label="上传图片"
                rules={[{ required: false }]}
                wrapperCol={{ span: 21 }}
                labelCol={{ span: 3 }}
              >
                <Alert
                  style={{ width: '90%', margin: '0 auto' }}
                  showIcon
                  message="支持扩展名：.jpg .png"
                  type="info"
                />
                <div
                  style={{
                    marginTop: 24,
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 24,
                  }}
                >
                  <UploadImg
                    title="上传图片附件"
                    action={`${SERVERDFWL}/uploadFile/upload`}
                    uploadimg={url => (pic1.current = url)}
                    file={record?.imgs}
                  ></UploadImg>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name="file"
                label="上传文件"
                rules={[{ required: false }]}
                wrapperCol={{ span: 21 }}
                labelCol={{ span: 3 }}
              >
                <Alert
                  style={{ width: '90%', margin: '0 auto' }}
                  showIcon
                  message="支持扩展名:.pdf .xlsx .xls .doc,.docx"
                  type="info"
                />
                <div
                  style={{
                    marginTop: 24,
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 24,
                  }}
                >
                  <UploadImg
                    title="上传文件附件"
                    action={`${SERVERDFWL}/uploadFile/upload`}
                    uploadimg={url => (file1.current = url)}
                    //  required={required}
                    type={'file'}
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    file={record?.files}
                  ></UploadImg>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card style={{ marginTop: 10 }} title="已选择的车辆列表">
        <CarTable
          carSelectTable={selectCarRef.current}
          ref={currentSelectedCarRef}
          updataCarlist={updataCarlist}
          getmoved={getmoved}
        ></CarTable>
      </Card>
    </Modal>
  )
}
