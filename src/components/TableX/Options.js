import React from 'react'
import { Popconfirm, Button } from 'antd'
import AuthButton from 'components/Auth/AuthButton'

export default function Options(props) {
  const { buttons = [] } = props

  return (
    <div>
      {buttons.map(({ label, preset, onClick, ...restProps }) => {
        switch (preset) {
          case 'del':
          case 'delete':
            return (
              <Popconfirm key="del" title="确认删除吗" onConfirm={onClick}>
                <AuthButton label="删除" type="link" {...restProps} />
              </Popconfirm>
            )

          case 'edit':
            return (
              <AuthButton
                type="link"
                key="edit"
                label="修改"
                onClick={onClick}
                {...restProps}
              />
            )
          case 'direct':
          case 'noAuth':
            return (
              <Button type="link" key={label} onClick={onClick} {...restProps}>
                {label}
              </Button>
            )
          default:
            return (
              <AuthButton
                type="link"
                key={label}
                onClick={onClick}
                label={label}
                {...restProps}
              />
            )
        }
      })}
    </div>
  )
}
