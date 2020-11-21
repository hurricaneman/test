/*
 * @Author: DargonPaul.Y
 * @Date: 2020-07-09 13:18:50
 * @LastEditTime: 2020-07-14 19:43:46
 * @LastEditors: DargonPaul.Y
 * @Description:
 * @FilePath: \admin-frontpage\src\utils\index.js
 */

import mitt from 'mitt'
import { message } from 'antd'
import { createHashHistory } from 'history'
import jsonrpc from './jsonrpc'
import moment from 'moment'

export const rpc = new jsonrpc()
export const bus = mitt()
export const history = createHashHistory()

export function proxyStorage(store) {
  return new Proxy(
    {},
    {
      set: (o, k, v) => (store[k] = JSON.stringify(v)),
      get: (o, k) => store[k] && JSON.parse(store[k]),
    }
  )
}

export const mem = proxyStorage({})
export const local = proxyStorage(localStorage)
export const session = proxyStorage(sessionStorage)

export function menuToTree(menu, id = 0) {
  return menu
    .sort((a, b) => a.orderNum - b.orderNum)
    .filter(v => v.parentId === id)
    .map(v => {
      const children = menuToTree(menu, v.menuId)
      if (!children.length && v.type !== 0) return v
      return { ...v, children }
    })
}

export function listToTree(list, id = null, keyId = 'id') {
  let rootIds = [id]
  if (id === null) {
    const listKeys = list.map(v => v[keyId])
    rootIds = list.filter(v => !listKeys.includes(v.parentId))
  }
  return list
    .filter(v => rootIds.includes(v.parentId))
    .map(v => {
      const children = listToTree(list, v[keyId], keyId)
      return children.length ? { ...v, children } : v
    })
}

export function checkres(res) {
  if (!res) {
    console.log('[CHECKRES]: Network error')
    return false
  }
  if (String(res) === '[object Promise]') {
    console.warn('[CHECKRES]: Maybe forget to await')
    return false
  }
  if (res.status !== 200) {
    console.log(`[CHECKRES]: ${res.status}`)
    return false
  }
  if (res.data?.code === 401) {
    return false
  }
  if (res.data?.code !== 1) {
    message.error('请求失败：' + res.data?.msg)
    return false
  }
  return true
}

export function stripObjectEmpty(obj) {
  const out = {}
  Object.entries(obj).forEach(([key, value]) => {
    if (value || value === 0 || value === false) out[key] = value
  })
  return out
}

export function changeTheme(
  theme = '',
  head = false,
  cssUrl = '',
  menuType = 'LEFT'
) {
  session['@/System/Theme'] = theme
  session['@/System/Head'] = head
  session['@/System/menuType'] = menuType
  session['@/System/CssUrl'] = cssUrl
  bus.emit('@/System/Theme', theme)
  bus.emit('@/System/Head', head)
  bus.emit('@/System/menuType', menuType)
  document.getElementById('link-theme').href = cssUrl
}

export function linkWithParams(linkSrc, params = {}) {
  session.linkParams = { ...params }
  history.push(transformURL(`/cvtri-cqvmm/#${linkSrc}`))
  return null
}

export function transformURL(url) {
  if (
    url &&
    (url.startsWith('http') ||
      [
        'vbcs-vmm',
        'vbcs-mec',
        'vbcs-xmg',
        'vbcs-vecc',
        'vbcs-gkg6',
        'cvtri-app',
        'cvtri-cqvmm',
      ].includes(url.split('/')[1]))
  ) {
    return '/iframe/' + encodeURIComponent(url)
  }
  return url
}

export function timeReturn(startTime, endTime) {
  const ms = moment(endTime).valueOf() - moment(startTime).valueOf()
  let time =
    (ms < 1000 && `${ms}毫秒`) ||
    (ms <= 1000 * 60 && `${parseInt(ms / 1000)}秒`) ||
    (ms <= 1000 * 60 * 60 && `${parseInt(ms / (1000 * 60))}分钟`) ||
    (ms > 1000 * 60 * 60 * 60 && `${parseInt(ms / (1000 * 60 * 60))}小时`)
  return time
}
