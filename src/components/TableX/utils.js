import { useLocation } from 'react-router-dom'
import { local } from 'utils'

export function useConfig() {
  const { pathname } = useLocation()
  const tableId = `@/TableX/${pathname}`
  return new Proxy(
    {},
    {
      set: (o, k, v) => (local[`${tableId}/${k}`] = v),
      get: (o, k) => local[`${tableId}/${k}`],
    }
  )
}
