import React, { useState } from 'react'
import { Icon as LegacyIcon } from '@ant-design/compatible'
import { Card, message } from 'antd'
import ModalEdit from './ModalEdit'
import axios from 'axios'
import TableX from 'components/TableX'
import Options from 'components/TableX/Options'
import PageWrapper from 'components/PageWrapper'

export default function Organization() {
  const [modalEdit, setModalEdit] = React.useState({ visible: false })
  const [treeData, setTreeData] = useState([])
  const [origineData, setOrigineData] = useState([])
  const tableXRef = React.useRef()

  const columns = [
    {
      dataIndex: 'name',
      title: '名称',
      render: v => (
        <div style={{ display: 'inline' }}>
          <LegacyIcon type="apartment"></LegacyIcon>
          <span style={{ marginLeft: 10 }}>{v}</span>
        </div>
      ),
    },
    {
      dataIndex: 'highLevel',
      title: '上级部门',
    },
    {
      dataIndex: 'orderNum',
      title: '排序',
    },
    {
      dataIndex: 'record',
      title: <span style={{ marginLeft: 15 }}>操作</span>,
      render: (v, node) => (
        <Options
          buttons={[
            {
              preset: 'edit',
              onClick: () => {
                setModalEdit({ mode: '修改', visible: true, node, value: v })
              },
            },
            {
              preset: 'delete',
              onClick: () => deleteFunc(v, node),
            },
          ]}
        />
      ),
    },
  ]

  const deleteFunc = (v, node) => {
    axios
      .get('/dept/delete', {
        params: {
          deptId: node.deptId,
          Authorization: window.sessionStorage.getItem('Authorization'),
        },
      })
      .then(({ data: res }) => {
        if (res.code === 1) {
          message.success('删除组织成功')
          tableXRef.current.update()
        } else {
          message.error(res.msg)
        }
      })
  }

  // 转换树状数据结构
  const transformTreeData = (key, arr, id = 0) => {
    return arr
      .sort((a, b) => a.parentId - b.parentId)
      .filter(v => v.parentId === id)
      .sort((a, b) => a.orderNum - b.orderNum)
      .map(v => {
        const parent = arr.find(e => e[key] === v.parentId)
        const children = transformTreeData(key, arr, v[key])

        const data = {
          highLevel: !parent ? '' : parent.name,
          key: v[key],
          title: (
            <div>
              <LegacyIcon style={{ marginRight: 5 }} type="apartment" />
              {v.name}
            </div>
          ),
          value: v[key],
        }
        v = Object.assign(v, data)
        return children.length ? { ...v, children } : v
      })
  }

  const getMenuTreeData = d => transformTreeData('menuId', d)

  function request() {
    return axios
      .post('/dept/list', { pageIndex: 1, pageSize: 100000 })
      .then(({ data: res }) => {
        if (res.code === 1) {
          const d = res.data.list.sort((a, b) => a.parentId - b.parentId)
          setOrigineData(res.data.list)
          const treeData = transformTreeData(
            'deptId',
            res.data.list,
            d[0].parentId
          )
          setTreeData(treeData)
          return { list: treeData }
        } else {
          message.error(res.msg)
        }
      })
    // .catch(e => {
    //   message.error(e)
    // })
  }

  return (
    <PageWrapper>
      <Card>
        <ModalEdit
          onChange={() => {
            tableXRef.current.update()
          }}
          onCancel={() => {
            setModalEdit({ visible: false })
          }}
          mode="新增"
          renderList={treeData}
          origineList={origineData}
          getMenuTreeData={getMenuTreeData}
          {...modalEdit}
        />
        <TableX
          toolbarButtons={[
            {
              preset: 'add',
              onClick: () => {
                setModalEdit({ visible: true })
              },
            },
          ]}
          ref={tableXRef}
          request={request}
          columns={columns}
        />
      </Card>
    </PageWrapper>
  )
}
