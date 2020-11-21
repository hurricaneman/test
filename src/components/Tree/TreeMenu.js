import React from 'react'
import axios from 'axios'
import { checkres, listToTree } from 'utils'
import TreeX from './TreeX'

function TreeMenu(props, ref) {
  const { mode = 'All', deptId, value, onChange, ...restProps } = props

  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const defaultExpandedKeys = React.useRef()

  React.useImperativeHandle(ref, () => ({}))

  React.useEffect(() => {
    if (mode === 'ByDept') {
      if (deptId === undefined || deptId === null) return
      setLoading(true)
      axios.get('/menu/getDeptMenu', { params: { deptId } }).then(res => {
        setLoading(false)
        if (!checkres(res)) return
        const { data } = res.data
        const tree = listToTree(data, 0, 'menuId')
        defaultExpandedKeys.current = tree.map(v => String(v.deptId))
        setData(tree)
      })
    }
    if (mode === 'All') {
      axios.post('/menu/list', { pageSize: 10000 }).then(res => {
        if (!checkres(res)) return
        const { records } = res.data.data
        const tree = listToTree(records, 0, 'menuId')
        defaultExpandedKeys.current = tree.map(v => String(v.deptId))
        setData(tree)
      })
    }
  }, [])

  return (
    <TreeX
      loading={loading}
      keyId="menuId"
      treeData={data}
      style={{ maxHeight: 400, overflow: 'auto' }}
      defaultExpandedKeys={defaultExpandedKeys.current}
      checkedKeys={value}
      onCheck={checkedKeys => onChange(checkedKeys)}
      {...restProps}
    ></TreeX>
  )
}

export default React.forwardRef(TreeMenu)
