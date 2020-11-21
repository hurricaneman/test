import React from 'react'
import { Icon as LegacyIcon } from '@ant-design/compatible'
import { Tree } from 'antd'
import axios from 'axios'
import { checkres } from 'utils'

export default function TreeDept(props) {
  const { ...restProps } = props

  const [data, setData] = React.useState(null)

  React.useEffect(() => {
    axios.post('/dept/tree').then(res => {
      if (!checkres(res)) return
      setData(res.data.data)
    })
  }, [])

  function renderTree(data) {
    return data.map(v => ({
      key: String(v.value),
      title: v.title,
      isLeaf: !v.children,
      icon: <LegacyIcon type="apartment" />,
      children: v.children ? renderTree(v.children) : null,
    }))
  }

  return (
    data && (
      <Tree
        showIcon
        expandAction={false}
        defaultExpandedKeys={['1']}
        treeData={renderTree(data)}
        {...restProps}
      ></Tree>
    )
  )
}
