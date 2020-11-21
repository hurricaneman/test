import React from 'react'
import { Icon as LegacyIcon } from '@ant-design/compatible'
import { Tree, message, Input, Spin, Tooltip, Empty } from 'antd'
import axios from 'axios'
import { rpc, bus } from 'utils'
import { SERVERDFWL } from 'configs/service'
import { cloneDeep } from 'lodash'

const { Search } = Input
export default function CarTree(props) {
  const { onSelect, multiplyMode, search, showOnline } = props
  const [treeList, setTreeList] = React.useState([])
  const [originalTreeList, setoriginalTreeList] = React.useState([])
  const [selectedKeys, setSelectedKeys] = React.useState()
  const [checkedKeys, setCheckedKeys] = React.useState([])
  const treeVinMap = React.useRef(new Map())
  const [expandKeys, setKeys] = React.useState([])
  const [autoExpandParent, setAuto] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  const renderTree = (data, vin) => {
    data.map(v => {
      v.title = v.name
      v.key = v.id
      v.icon = (
        <LegacyIcon
          type={v.type === 0 ? 'apartment' : v.type === 1 ? 'folder' : 'car'}
          style={{
            color: v.online && showOnline ? '#1890ff' : '',
          }}
        />
      )
      v.dataRef = v
      if (v.children) {
        //车型统计在线
        if (v.type === 1 && showOnline) {
          if (v.title.indexOf('(') >= 0) {
            const nTitle =
              v.title.split('(')[0] + `(${v.onlineNum}/${v.vehicleNum})`
            v.title = (
              <Tooltip title={nTitle}>
                <span
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: '248px',
                    display: 'inline-flex',
                  }}
                >
                  {nTitle}
                </span>
              </Tooltip>
            )
          } else {
            const nTitle =
              v.title.split('(')[0] + `(${v.onlineNum}/${v.vehicleNum})`
            v.title = (
              <Tooltip title={nTitle}>
                <span
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: '248px',
                    display: 'inline-flex',
                  }}
                >
                  {nTitle}
                </span>
              </Tooltip>
            )
          }
          //车企统计在线
        } else if (v.type === 0 && showOnline) {
          if (v.title.indexOf('(') >= 0) {
            const nTitle =
              v.title.split('(')[0] + `(${v.onlineNum}/${v.vehicleNum})`
            v.title = (
              <Tooltip title={nTitle}>
                <span
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: '280px',
                    display: 'inline-flex',
                  }}
                >
                  {nTitle}
                </span>
              </Tooltip>
            )
          } else {
            const nTitle = v.title + `(${v.onlineNum}/${v.vehicleNum})`
            v.title = (
              <Tooltip title={nTitle}>
                <span
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    maxWidth: '280px',
                    display: 'inline-flex',
                  }}
                >
                  {nTitle}
                </span>
              </Tooltip>
            )
          }
        }

        renderTree(v.children, vin)
      } else {
        if (v.title === vin) {
          setCheckedKeys([v.id])
          setSelectedKeys([v.id])
          onSelect(vin)
        }
      }
    })
    return data
  }

  const onSelected = (value, node) => {
    console.log(value, node)
    const vin = treeVinMap.current.get(value[0])
    console.log(vin)
    setSelectedKeys(value)

    if (multiplyMode) {
      // const vins = []
      // checkedKeys.map(v => {
      //   const vin = treeVinMap.current.get(v)
      //   if (vin) {
      //     vins.push(vin)
      //   }
      // })
      // const index = vins.find(v => v===vin)

      // bus.emit('@/Map/setChecked',index)
      return
    }

    onSelect(vin, node.node)
  }

  const onChecked = checkKeys => {
    setCheckedKeys(checkKeys)
    if (checkKeys.length > 0) {
      let vins = []
      checkKeys.map(v => {
        const vin = treeVinMap.current.get(v)
        if (vin) {
          vins.push(vin)
        }
      })
      vins = vins.join(',')
      onSelect(vins)
    } else {
      onSelect(undefined)
    }
  }
  // const changeOnlie = (list, vin, state) => {
  //   const arr = []
  //   let obj = {}
  //   list.forEach(v => {
  //     const tmp = { ...v }
  //     if (v.children && v.children.length > 0) {
  //       tmp.children = changeOnlie(tmp.children, vin, state)
  //       obj = { ...tmp }
  //     } else {
  //       if (v.name === vin) {
  //         obj = { ...tmp, online: state }
  //       } else {
  //         obj = { ...tmp }
  //       }
  //     }
  //     arr.push(obj)
  //   })
  //   return arr
  // }

  // const ws = treeList => {
  //   const ws = new WebSocket(`${SERVER_ML_WS}/vehicleOnOffWebSocket`)
  //   ws.onmessage = e => {
  //     if (e.data.indexOf('{') > -1) {
  //       const data = JSON.parse(e.data)
  //       const vin = data.name
  //       const state = data.online
  //       const newdata = changeOnlie(treeList, vin, state)
  //       setTreeList(renderTree(newdata))
  //     }
  //   }
  // }

  React.useEffect(() => {
    return () => {
      setSelectedKeys([])
      setCheckedKeys([])
      onSelect(undefined)
    }
  }, [multiplyMode])

  const onloadData = treeNode => {
    return new Promise(resolve => {
      if (treeNode.children) {
        resolve()
        return
      }
      axios
        .get('/vehicle/getVehicleList', {
          params: {
            warehouseId: treeNode.dataRef.id,
          },
          baseURL: SERVERDFWL,
        })
        .then(res => {
          if (res.data.code === 1) {
            const data = res.data.data
            data.map(v => {
              v.title = v.vin
              v.key = v.vin
              treeVinMap.current.set(v.key, v.title)
              v.isLeaf = true
              v.icon = (
                <LegacyIcon
                  type={
                    v.type === 0 ? 'apartment' : v.type === 1 ? 'folder' : 'car'
                  }
                  style={{
                    color: v.online && showOnline ? '#1890ff' : '',
                  }}
                />
              )
            })
            treeNode.dataRef.children = data
            const cloneTreeData = cloneDeep(treeList)
            setTreeList(cloneTreeData)
          } else {
            message.error('查询失败')
          }
          resolve()
        })
    })
  }

  const getData = ids => {
    setLoading(true)
    axios
      .get('/vehicle/tree', {
        params: {
          ids,
        },
        baseURL: SERVERDFWL,
      })
      .then(({ data: res }) => {
        setLoading(false)
        if (res && res.code === 1 && res.data) {
          const defaultVin = search.split('=')[1]
          const tree = renderTree(res.data, defaultVin)
          setTreeList(tree ? tree : [])
          setoriginalTreeList(tree)
          // if (showOnline) ws(tree)
        } else {
          message.error(res.msg)
        }
      })
  }
  React.useEffect(() => {
    bus.on('@/CarMonitor/getData', ids => {
      getData(ids)
    })
    return () => {
      bus.off('@/CarMonitor/getData')
    }
  }, [])
  React.useEffect(() => {
    if (treeList.length > 0) {
      rpc.local.setVin = v => {
        const renderTree = (data, vin) => {
          data.map(v => {
            if (v.children) {
              renderTree(v.children, vin)
            } else {
              if (v.vin === vin) {
                setCheckedKeys([v.key])
                setSelectedKeys([v.key])
                onSelect(vin)
              }
            }
          })
          return data
        }
        const tree = renderTree(treeList, v)
        setTreeList(tree ? tree : [])
      }
    }
  }, [treeList])
  const onChange = value => {
    const keyList = []
    const copyTree = cloneDeep(originalTreeList)
    const getKeys = (arr, value, keyList) => {
      arr.map(v => {
        if (value && v.name.indexOf(value) > -1) {
          keyList.push(v.key)
          v.title = <span style={{ color: '#ff0000' }}>{v.title}</span>
        }
        if (v.children && v.children.length > 0) {
          getKeys(v.children, value, keyList)
        }
      })
      return keyList
    }
    setTreeList(copyTree)
    setKeys(getKeys(copyTree, value, keyList))
    setAuto(true)
  }
  const onExpand = expandedKeys => {
    setKeys(expandedKeys)
    setAuto(false)
  }
  return (
    <Spin spinning={loading}>
      {treeList.length > 0 ? (
        <>
          <div style={{ textAlign: 'center' }}>
            <Search
              style={{ margin: '8px auto', width: 230 }}
              placeholder="搜索"
              onSearch={onChange}
            />
          </div>

          <Tree
            autoExpandParent={autoExpandParent}
            onExpand={onExpand}
            expandedKeys={expandKeys}
            checkedKeys={checkedKeys}
            selectedKeys={selectedKeys}
            showIcon={true}
            onSelect={onSelected}
            onCheck={onChecked}
            checkable={multiplyMode}
            treeData={treeList}
            // defaultExpandAll={true}
            loadData={onloadData}
            // loadedKeys={}
          />
        </>
      ) : (
        <div style={{ width: '100%', minHeight: 400 }}>
          <Empty description="暂无数据，请选择经销商"></Empty>
        </div>
      )}
    </Spin>
  )
}
