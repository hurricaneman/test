import React from 'react'
import { Button } from 'antd'
import { mem } from 'utils'
import { useLocation } from 'react-router-dom'
import { Icon } from '@ant-design/compatible'

function AuthButton(props, ref) {
  let { icon, label, children, ...restProps } = props
  const location = useLocation()

  React.useImperativeHandle(ref, () => ({}))

  const authList = mem['@/System/Menu/List']
  if (!authList) return null
  const menu = authList.find(v => v.url === location.pathname)
  const buttons = authList.filter(v => v.parentId === menu.menuId)
  const button = buttons.find(v => v.buttonId === label)
  if (!button) return null

  let iconComponent = null
  if (icon) {
    iconComponent = typeof icon === 'string' ? <Icon type={icon}></Icon> : icon
  }

  return (
    <Button icon={iconComponent} {...restProps}>
      {button.name || children}
    </Button>
  )
}

export default React.forwardRef(AuthButton)
