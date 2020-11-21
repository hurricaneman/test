import React from 'react'
import { Form, Button, Input, DatePicker, Select } from 'antd'

function SearchForm(props, ref) {
  const { fields = [], loading, onSearch, ...restProps } = props

  const [form] = Form.useForm()

  React.useImperativeHandle(ref, () => form)

  return (
    <Form form={form} layout="inline" {...restProps}>
      {fields.map(v => {
        let { label, name, component, preset, options, ...restProps } = v
        if (!component) {
          switch (preset) {
            case 'date':
              component = <DatePicker />
              break
            case 'dateTime':
              component = <DatePicker showTime />
              break
            case 'select':
              component = (
                <Select style={{ width: 150 }}>
                  {options.map(v => (
                    <Select.Option key={v.value} value={v.value}>
                      {v.label}
                    </Select.Option>
                  ))}
                </Select>
              )
              break
            case 'text':
            default:
              component = <Input allowClear type="text" maxLength="50" />
              break
          }
        }
        return (
          <Form.Item
            label={label}
            name={name}
            key={name}
            style={{ marginBottom: 12 }}
            {...restProps}
          >
            {React.cloneElement(component)}
          </Form.Item>
        )
      })}
      <Form.Item style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          style={{ marginRight: 6 }}
          loading={loading}
          onClick={onSearch}
        >
          查询
        </Button>
        <Button onClick={() => (form.resetFields(), onSearch())}>重置</Button>
      </Form.Item>
    </Form>
  )
}

export default React.forwardRef(SearchForm)
