import React from 'react'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Button, DatePicker } from 'antd'
import { bus } from 'utils'
function FormQuery(props, ref) {
  const {
    form,
    form: { getFieldDecorator: f },
    loading,
    onQuery,
    noRest,
    ...restProps
  } = props
  React.useImperativeHandle(ref, () => form)

  // const showHistory = () => {
  //   bus.emit('@/CarMonitor/sendData')
  // }

  React.useEffect(() => {
    bus.on(
      '@/CarMonitor/resetForm',
      () =>
        form.setFieldsValue({
          startTime: '',
          endTime: '',
        }),
      form.resetFields()
      // onQuery()
    )
    return () => {
      bus.off('@/CarMonitor/resetForm')
    }
  }, [])
  return (
    <Form layout="inline" {...restProps}>
      <Form.Item label="开始">
        {f('startTime')(<DatePicker showTime placeholder="请选择时间" />)}
      </Form.Item>
      <Form.Item label="结束">
        {f('endTime')(<DatePicker showTime placeholder="请选择时间" />)}
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          style={{ marginRight: 6 }}
          loading={loading}
          onClick={onQuery}
        >
          查询
        </Button>
        <Button
          style={{ marginRight: 6, display: noRest ? 'none' : 'inline-block' }}
          onClick={() => (
            form.resetFields(), bus.emit('@/CarMonitor/resetData')
          )}
        >
          重置
        </Button>
        {/* <Button type="primary" onClick={showHistory}>
          轨迹显示
        </Button> */}
      </Form.Item>
    </Form>
  )
}

export default Form.create()(React.forwardRef(FormQuery))
