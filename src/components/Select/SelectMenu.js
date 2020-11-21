import React from 'react'
import { TreeSelect } from 'antd'
import axios from 'axios'
import { menuToTree } from 'utils'

function SelectDepartment(props, ref) {
  const { ...restProps } = props
  const [data, setData] = React.useState(null)

  React.useImperativeHandle(ref, () => ({}))

  React.useEffect(() => {
    axios.get('/menu/select').then(({ data: res }) => {
      if (!res.data) return
      const tree = menuToTree(
        res.data.map(v => ({ ...v, title: v.name, value: v.menuId }))
      )
      setData([{ title: '根节点', value: 0, children: tree }])
    })
  }, [])

  return data && <TreeSelect treeData={data} {...restProps}></TreeSelect>
}

export default React.forwardRef(SelectDepartment)
