import React from 'react'
import { Tooltip, Popover, Switch, Input, Button, Form } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { useConfig } from './utils'

export default function PopoverAutoRefresh(props) {
  const { refresh } = props
  const [visible, setVisible] = React.useState(false)
  const [form] = Form.useForm()
  const config = useConfig()
  const timeRef = React.useRef()

  React.useEffect(() => {
    const onMouseDown = () => setVisible(false)
    addEventListener('mousedown', onMouseDown)
    return () => removeEventListener('mousedown', onMouseDown)
  }, [])

  React.useEffect(() => {
    if (config.autoRefresh) onFinish(config.autoRefresh)
  }, [])

  React.useEffect(() => {
    if (visible === false) {
      if (config.autoRefresh) {
        setTimeout(() => {
          form.setFieldsValue({
            ...config.autoRefresh,
          })
        }, 100)
      } else {
        form.setFieldsValue({ status: false, interval: '' })
      }
    }
  }, [visible])

  function onFinish(v) {
    setVisible(false)
    config.autoRefresh = v
    clearInterval(timeRef.current)
    if (v.status) {
      timeRef.current = setInterval(refresh, v.interval * 1000)
    }
  }

  return (
    <Tooltip title="自动刷新">
      <Popover
        placement="bottomRight"
        visible={visible}
        onMouseDown={e => e.stopPropagation()}
        content={
          <Form
            form={form}
            onMouseDown={e => e.stopPropagation()}
            onFinish={onFinish}
            initialValues={config.autoRefresh}
            style={{
              margin: '-12px -16px',
              padding: '12px 16px',
            }}
          >
            <Form.Item label="自动刷新" name="status" valuePropName="checked">
              <Switch checkedChildren="开" unCheckedChildren="关" />
            </Form.Item>
            <Form.Item label="刷新间隔" name="interval">
              <Input addonAfter="秒" size="small" style={{ width: 90 }} />
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" size="small" htmlType="submit">
                确定
              </Button>
            </div>
          </Form>
        }
      >
        <ClockCircleOutlined
          style={{ fontSize: 18, padding: '0 6px' }}
          onClick={() => setVisible(v => !v)}
        />
      </Popover>
    </Tooltip>
  )
}
