/* eslint-disable prettier/prettier */
import React from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Input, message, Modal } from 'antd'
import axios from 'axios'
// import moment from 'moment'
import { session } from 'utils'
import moment from 'moment'
const { TextArea } = Input
// const { Option } = Select

function ModalEdit(props) {
  const {
    visible,
    onCancel,
    mode,
    vin,
    record,
    form,
    form: { getFieldDecorator: f },
  } = props

  const testSpeedLimitData = {
    limitSpeed: 60,
    pointNum: 1,
    points: `[{"latitude": 114.32387,"longitude": 30.529303}]`,
    speedLimitType: 0,
    startLat: 114.32387,
    startLon: 30.529303,
    vin: 'LFWADRJF011002346',
    // "keyId": 0,
  }
  const testRoadData = {
    alarmList: `[
      {
        "headDirect": 0,
        "id": 1,
        "latitude": 0,
        "longitude": 0,
        "source": 0,
        "speed": 20,
        "type": 1
      }
    ]`,
    alarmNum: 1,
    vin: 'LFWADRJF011002346',
  }

  React.useEffect(() => {
    console.log(visible)
    if (!visible) {
      form.resetFields()
      return
    }
    if (mode === 'speedLimit') {
      form.setFieldsValue({ ...testSpeedLimitData })
    } else {
      form.setFieldsValue({ ...testRoadData })
    }
  }, [visible])

  const addLog = (operationResult, operationTime) => {
    let userData = session.userData
    if (userData) {
      axios.post('/warnlog/add', {
        operationResult,
        operationTime,
        userId: userData.userId,
        userName: userData.username,
        vehicleTypeName: record,
        warnName: mode === 'speedLimit' ? '预警' : '路测',
        warnDescription: mode === 'speedLimit' ? '预警' : '路测',
        vin,
      })
    }
  }

  function onSubmit() {
    form.validateFields(async (err, fields) => {
      if (err) return
      if (!vin) {
        message.error('请选择车辆')
        return
      }
      fields.vin = vin
      try {
        if (mode === 'speedLimit') {
          fields.points = JSON.parse(fields.points)
        }
        if (mode === 'road') {
          fields.alarmList = JSON.parse(fields.alarmList)
        }
      } catch {
        message.error('JSON参数类型错误')
        return
      }

      const url = mode === 'speedLimit' ? 'speedLimit' : 'roadside'
      await axios.post('/earlyWarn/' + url, { ...fields }).then(res => {
        if (res.data.code === 1) {
          message.success(res.data.msg)
          addLog(res.data.msg, moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'))
          onCancel()
        } else {
          addLog(res.data.msg, moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'))
          message.error(res.data.msg)
        }
      })
    })
  }
  // async function judgeUserName(rule, value, callback) {
  //   if (mode === 'update') {
  //     if (record.username === value) {
  //       callback()
  //     }
  //   }
  //   const res = await axios.get('/user/userNameCheck', {
  //     params: { userName: value },
  //   })
  //   if (res.data.code === 1) {
  //     callback()
  //   } else {
  //     callback(res.data.msg)
  //   }
  // }
  return (
    <>
      {visible ? (
        <Modal
          onOk={onSubmit}
          onCancel={onCancel}
          visible={visible}
          title="指令下发"
        >
          <Form
            layout="horizontal"
            wrapperCol={{ span: 10 }}
            labelCol={{ span: 8 }}
          >
            {mode === 'speedLimit' ? (
              <>
                <Form.Item label="限速值">
                  {f('limitSpeed', {
                    rules: [
                      {
                        required: true,
                        message: '必填',
                      },
                    ],
                  })(<Input type="text" maxLength="50" />)}
                </Form.Item>
                <Form.Item label="限速区域轨迹点数">
                  {f('pointNum', {
                    rules: [
                      {
                        required: true,
                        message: '必填',
                      },
                    ],
                  })(<Input type="text" maxLength="50" />)}
                </Form.Item>
                <Form.Item label="限速区域轨迹点列表">
                  {f('points', {
                    rules: [
                      {
                        required: true,
                        message: '必填',
                      },
                    ],
                  })(<TextArea maxLength="100" rows={4} />)}
                </Form.Item>
                <Form.Item label="限速牌类型">
                  {f('speedLimitType', {
                    rules: [
                      {
                        required: true,
                        message: '必填',
                      },
                    ],
                  })(<Input type="text" maxLength="50" />)}
                </Form.Item>
                <Form.Item label="限速点纬度">
                  {f('startLat', {
                    rules: [
                      {
                        required: true,
                        message: '必填',
                      },
                    ],
                  })(<Input type="text" maxLength="50" />)}
                </Form.Item>
                <Form.Item label="限速点经度">
                  {f('startLon', {
                    rules: [
                      {
                        required: true,
                        message: '必填',
                      },
                    ],
                  })(<Input type="text" maxLength="50" />)}
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item label="路测预警点列表">
                  {f('alarmList', {
                    rules: [
                      {
                        required: true,
                        message: '必填',
                      },
                    ],
                  })(<TextArea maxLength="100" rows={8} style={{ width: 300 }} />)}
                </Form.Item>
                <Form.Item label="预警目标数目">
                  {f('alarmNum', {
                    rules: [
                      {
                        required: true,
                        message: '必填',
                      },
                    ],
                  })(<Input type="text" maxLength="50" />)}
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      ) : null}
    </>
  )
}

export default Form.create()(ModalEdit)
