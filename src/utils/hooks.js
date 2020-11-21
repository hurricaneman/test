/*
 * @Author: DargonPaul.Y
 * @Date: 2020-07-09 13:18:50
 * @LastEditTime: 2020-07-14 19:48:32
 * @LastEditors: DargonPaul.Y
 * @Description:
 * @FilePath: \admin-frontpage\src\utils\hooks.js
 */

import React from 'react'
import { bus, session } from 'utils'

export function useBus(name, fn, deps = []) {
  React.useEffect(() => {
    bus.on(name, fn)
    return () => bus.off(name, fn)
  }, deps)
}

export function useTheme() {
  const [theme, setTheme] = React.useState(session['@/System/Theme'])
  useBus('@/System/Theme', theme => setTheme(theme))
  return theme
}

export function useHead() {
  const [head, setHead] = React.useState(session['@/System/Head'])
  useBus('@/System/Head', head => setHead(head))
  return head
}

export function useMenuType() {
  const [menuType, setMenuType] = React.useState(
    session['@/System/menuType'] || 'LEFT'
  )
  useBus('@/System/menuType', menuType => setMenuType(menuType))
  return menuType
}

export function useLinkParams(fn) {
  const [linkParams] = React.useState(session['linkParams'])
  React.useEffect(() => {
    if (linkParams && fn) {
      fn(linkParams)
    }
    return () => (session.linkParams = false)
  }, [linkParams])
  session.linkParams = false
  return linkParams
}
