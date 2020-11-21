import React from 'react'
import axios from 'axios'
import { checkres } from 'utils'
import { Tree } from 'antd'

function TreeDeptSelect(props, ref) {
  const { value, onChange, ...restProps } = props

  const [data, setData] = React.useState(null)

  React.useImperativeHandle(ref, () => ({}))

  React.useEffect(() => {
    axios.post('/dept/treeForDataPermission').then(res => {
      if (!checkres(res)) return
      setData(res.data.data)
    })
  }, [])

  return (
    data && (
      <Tree
        treeData={data}
        checkable
        checkStrictly
        style={{ maxHeight: 400, overflow: 'auto' }}
        defaultExpandAll
        checkedKeys={{ checked: value, halfChecked: [] }}
        onCheck={checkedKeys => onChange(checkedKeys.checked)}
        {...restProps}
      />
    )
  )
}

export default React.forwardRef(TreeDeptSelect)
