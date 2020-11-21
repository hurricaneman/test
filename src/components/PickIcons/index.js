import React from 'react'
import icons from './icons'
import { Icon as LegacyIcon } from '@ant-design/compatible'
import { Popover, Button, Input } from 'antd'

export default function PickIcons(props) {
  const { value, onChange, ...restProps } = props

  const [visible, setVisible] = React.useState(false)
  const [search, setSearch] = React.useState('')

  return (
    <Popover
      placement="bottomLeft"
      trigger="click"
      overlayStyle={{ padding: 0 }}
      visible={visible}
      onVisibleChange={v => setVisible(v)}
      content={
        <div style={{ width: 400 }}>
          <div style={{ marginBottom: 6, marginRight: 6, textAlign: 'right' }}>
            <Input.Search
              size="small"
              style={{ width: 160 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            ></Input.Search>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              height: 300,
              overflow: 'auto',
              alignContent: 'flex-start',
            }}
          >
            {icons
              .filter(v => v.includes(search))
              .map(v => (
                <div
                  key={v}
                  title={v}
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid #ccc',
                    marginRight: 6,
                    marginBottom: 6,
                    cursor: 'pointer',
                    fontSize: 16,
                    lineHeight: '32px',
                    textAlign: 'center',
                  }}
                  onClick={() => (onChange(v), setVisible(false))}
                >
                  {v && <LegacyIcon type={v}></LegacyIcon>}
                </div>
              ))}
          </div>
        </div>
      }
      {...restProps}
    >
      <Button>{value ? <LegacyIcon type={value}></LegacyIcon> : ' '}</Button>
    </Popover>
  )
}
