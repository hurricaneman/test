import React from 'react'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import AuthButton from 'components/Auth/AuthButton'

export default function ToolButtons(props) {
  const { buttons } = props

  return (
    <div>
      {buttons.map(v0 => {
        let { preset, ...v } = v0
        switch (preset) {
          case 'add':
            v = {
              type: 'primary',
              label: '添加',
              icon: <PlusOutlined />,
              ...v,
            }
            break
          case 'edit':
          case 'modify':
            v = {
              label: '修改',
              icon: <EditOutlined />,
              ...v,
            }
            break
          case 'del':
          case 'delete':
            v = {
              type: 'danger',
              label: '删除',
              icon: <DeleteOutlined />,
              ...v,
            }
            break
          case 'export':
            v = {
              label: '导出',
              icon: <ExportOutlined />,
              ...v,
            }
            break
        }
        return (
          <AuthButton
            key={v.label}
            style={{ marginRight: 8, ...v.style }}
            {...v}
          >
            {v.label}
          </AuthButton>
        )
      })}
    </div>
  )
}
