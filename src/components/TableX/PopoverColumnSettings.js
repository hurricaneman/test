import React from 'react'
import { Popover, Tooltip, Checkbox, Button } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { cloneDeep } from 'lodash'
import { useConfig } from './utils'

export default function ColumnSettings(props) {
  const { columns, value, onChange } = props

  const config = useConfig()
  const [settings, setSettings] = React.useState(config.columnSettings || [])

  function reset() {
    setSettings(columns.map(({ dataIndex }) => ({ dataIndex, show: true })))
  }

  React.useEffect(() => {
    if (!config.columnSettings) reset()
  }, [])

  React.useEffect(() => {
    config.columnSettings = settings
    if (
      columns
        .map(v => v.dataIndex)
        .sort()
        .join(',') ===
      settings
        .map(v => v.dataIndex)
        .sort()
        .join(',')
    ) {
      const value = settings.reduce((a, v) => {
        if (!v.show) return a
        const targetColumn = columns.find(v0 => v0.dataIndex === v.dataIndex)
        if (!targetColumn) throw new Error()
        return a.concat(Object.assign(targetColumn, v))
      }, [])
      onChange(value)
    } else {
      reset()
    }
  }, [settings])

  return (
    <Tooltip title="列设置">
      <Popover
        trigger="click"
        placement="bottomRight"
        content={
          <div>
            <div style={{ marginBottom: 12 }}>
              <Button.Group size="small">
                <Button
                  onClick={() =>
                    setSettings(v => v.map(v0 => ({ ...v0, show: true })))
                  }
                >
                  全选
                </Button>
                <Button
                  onClick={() =>
                    setSettings(v => v.map(v0 => ({ ...v0, show: false })))
                  }
                >
                  反选
                </Button>
                <Button onClick={() => reset()}>重置</Button>
              </Button.Group>
            </div>
            {columns.map(v => (
              <div key={v.dataIndex}>
                <Checkbox
                  checked={Boolean(
                    value.find(v0 => v0.dataIndex === v.dataIndex)?.show
                  )}
                  onChange={e => {
                    const { checked } = e.target
                    setSettings(v0 => {
                      const out = cloneDeep(v0)
                      out.find(
                        v1 => v1.dataIndex === v.dataIndex
                      ).show = checked
                      return out
                    })
                  }}
                >
                  {v.title}
                </Checkbox>
              </div>
            ))}
          </div>
        }
      >
        <SettingOutlined style={{ fontSize: 18, padding: '0 6px' }} />
      </Popover>
    </Tooltip>
  )
}
