import React from 'react'
import { Tree, Spin } from 'antd'

function getParentsIdsFromTree(tree, nodeId, keyId = '') {
  const fn = tree =>
    tree.reduce((a, v) => {
      if (a === true || Array.isArray(a)) return a
      if (v[keyId] === nodeId) return true
      if (v.children) {
        const res = fn(v.children)
        if (res === true) return [v[keyId]]
        if (Array.isArray(res)) return [v[keyId], ...res]
      }
      return false
    }, false)
  const res = fn(tree)
  if (!Array.isArray(res)) return []
  return res
}

function getChildrenIdsFromTree(tree, keyId = 'id') {
  if (!tree) return []
  const fn = tree =>
    tree.flatMap(v => (v.children ? [v[keyId], ...fn(v.children)] : [v[keyId]]))
  return fn(tree)
}

export default function TreeX(props) {
  const {
    treeData,
    loading,
    keyId = 'id',
    keyTitle = 'name',
    checkedKeys = [],
    onCheck,
    checkedInfluenceParent = true,
    checkedInfluenceChildren = true,
    uncheckedInfluenceParent = false,
    uncheckedInfluenceChildren = true,
    ...restProps
  } = props

  function onCheck0(checkedKeys0, { checked, node }) {
    let out = checkedKeys.slice()
    const { dataRef } = node
    const nodeId = dataRef[keyId]
    const parentIds = getParentsIdsFromTree(treeData, nodeId, keyId)
    const childrenIds = getChildrenIdsFromTree(dataRef.children, keyId)
    if (checked) {
      out.push(nodeId)
    }
    if (checked && checkedInfluenceParent) {
      out.push(...parentIds)
    }
    if (checked && checkedInfluenceChildren) {
      out.push(...childrenIds)
    }
    if (!checked) {
      out = out.filter(v => v !== nodeId)
    }
    if (!checked && uncheckedInfluenceParent) {
      out = out.filter(v => !parentIds.includes(v))
    }
    if (!checked && uncheckedInfluenceChildren) {
      out = out.filter(v => !childrenIds.includes(v))
    }
    onCheck(Array.from(new Set(out)))
  }

  function renderTree(data) {
    return data.map(v => ({
      key: v[keyId],
      title: v[keyTitle],
      isLeaf: !v.children,
      dataRef: v,
      children: v.children ? renderTree(v.children) : null,
    }))
  }

  return (
    <Spin spinning={loading}>
      <Tree
        checkable
        checkStrictly
        checkedKeys={{ checked: checkedKeys, halfChecked: [] }}
        onCheck={onCheck0}
        treeData={renderTree(treeData)}
        {...restProps}
      ></Tree>
    </Spin>
  )
}
