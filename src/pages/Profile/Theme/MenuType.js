/*
 * @Author: DargonPaul.Y
 * @Date: 2020-07-14 19:03:09
 * @LastEditTime: 2020-07-14 20:16:14
 * @LastEditors: DargonPaul.Y
 * @Description:
 * @FilePath: \admin-frontpage\src\pages\Profile\Theme\menuType.js
 */
import React from 'react'
import { Tooltip } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import topLeftMenuSvg from './img/topLeftMenu.svg'
import leftMenuSvg from './img/leftMenu.svg'
const MenuType = props => {
  const { onChange, menuType = 'LEFT' } = props
  React.useEffect(() => {
    onChange && onChange(menuType)
  }, [menuType])
  return (
    <div>
      <Tooltip title="仅左侧导航">
        <span
          style={{
            width: 40,
            height: 40,
            position: 'relative',
            cursor: 'pointer',
            marginRight: 10,
          }}
          onClick={() => onChange('LEFT')}
        >
          {menuType == 'LEFT' ? (
            <CheckOutlined
              style={{
                display: 'inline-block',
                position: 'absolute',
                top: 6,
                right: 10,
                fontSize: '16px',
                color: 'var(--PC)',
              }}
            />
          ) : null}
          <img src={leftMenuSvg} />
        </span>
      </Tooltip>
      <Tooltip title="顶部左侧结合导航">
        <span
          style={{
            width: 40,
            height: 40,
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={() => onChange('TOPLEFT')}
        >
          {menuType == 'TOPLEFT' ? (
            <CheckOutlined
              style={{
                display: 'inline-block',
                position: 'absolute',
                top: 6,
                right: 10,
                fontSize: '16px',
                color: 'var(--PC)',
              }}
            />
          ) : null}
          <img src={topLeftMenuSvg} />
        </span>
      </Tooltip>
    </div>
  )
}
export default MenuType
