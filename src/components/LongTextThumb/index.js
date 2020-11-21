import React from 'react'
import { Tooltip } from 'antd'

export default function LongTextThumb(props) {
  const { text, width } = props
  return (
    <Tooltip title={text} placement="topLeft">
      <div
        style={{
          width,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {text}
      </div>
    </Tooltip>
  )
}
