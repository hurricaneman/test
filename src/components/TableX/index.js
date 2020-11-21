import React from 'react'
import { Table, Tooltip, Dropdown, Menu } from 'antd'
import {
  ColumnHeightOutlined,
  FullscreenOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import PopoverAutoRefresh from './PopoverAutoRefresh'
import PopoverColumnSettings from './PopoverColumnSettings'
import ToolButtons from './ToolButtons'
import styles from './index.module.scss'
import classnames from 'classnames'
import SearchForm from './SearchForm'
import { stripObjectEmpty, session } from 'utils'
import { useConfig } from './utils'
import { defaults } from 'lodash'

function TableX(props, ref) {
  const {
    request,
    showTool = true, //显示隐藏小工具
    hasPagination = true,
    fePagination = false,
    // initialRefresh = true,
    toolbarButtons = [],
    toolbarExtra = null,
    searchForm,
    searchFormInitialValues,
    searchExtra = null,
    columns,
    style,
    className,
    ...restProps
  } = props

  const rootRef = React.useRef()
  const formRef = React.createRef()
  const config = useConfig()
  const [dataSource, setDataSource] = React.useState([])
  const [size, setSize] = React.useState(config.size || 'small')
  const [loading, setLoading] = React.useState(false)
  const [columnsSetting, setColumnsSetting] = React.useState([])
  const [pageSize, setPageSize] = React.useState(10)
  const [pageIndex, setPageIndex] = React.useState(1)
  const [updateHandle, update] = React.useReducer(x => !x, false)

  React.useEffect(() => {
    refresh()
  }, [updateHandle])

  function refresh(args = {}) {
    let params = defaults(args, { pageSize, pageIndex })
    if (params.pageIndex !== pageIndex) {
      setPageIndex(params.pageIndex)
    }
    setLoading(true)
    const p = formRef.current
      ? formRef.current
          .validateFields()
          .then(fields =>
            request({ ...params, fields: stripObjectEmpty(fields) })
          )
          .catch(() => setLoading(false))
      : Promise.resolve(request(params))
    p.then(res => {
      setLoading(false)
      if (
        res?.list?.length === 0 &&
        res?.total !== 0 &&
        res.total &&
        res.list
      ) {
        if (pageIndex - 1 > 0) {
          setPageIndex(pageIndex - 1)
          update()
        }
        return
      }
      setDataSource(res || { list: [], total: 0 })
    })
  }

  React.useImperativeHandle(ref, () => ({
    update,
    form: formRef.current,
  }))

  function onTableChange(p) {
    if (p.current !== pageIndex || p.pageSize !== pageSize) {
      refresh({ pageIndex: p.current, pageSize: p.pageSize })
    }
  }

  return (
    <div
      className={classnames(styles.root, className)}
      ref={rootRef}
      style={{ ...style }}
    >
      {searchForm && (
        <SearchForm
          ref={formRef}
          fields={searchForm}
          loading={loading}
          onSearch={() => refresh({ pageIndex: 1 })}
          initialValues={searchFormInitialValues}
        />
      )}
      {searchExtra}
      <div style={{ display: 'flex', marginBottom: 12, alignItems: 'center' }}>
        <ToolButtons buttons={toolbarButtons} />
        {toolbarExtra}
        <div style={{ flex: 1 }} />
        <div style={{ display: showTool ? 'block' : 'none' }}>
          <Tooltip title="密度">
            <Dropdown
              trigger="click"
              placement="bottomCenter"
              overlay={
                <Menu
                  selectedKeys={[size]}
                  onClick={({ key }) => {
                    setSize(key)
                    config.size = key
                  }}
                >
                  <Menu.Item key="default">默认</Menu.Item>
                  <Menu.Item key="middle">中等</Menu.Item>
                  <Menu.Item key="small">紧凑</Menu.Item>
                </Menu>
              }
            >
              <ColumnHeightOutlined
                style={{ fontSize: 18, padding: '0 6px' }}
              />
            </Dropdown>
          </Tooltip>
          <Tooltip title="全屏">
            <FullscreenOutlined
              style={{ fontSize: 18, padding: '0 6px' }}
              onClick={() =>
                document.fullscreenElement
                  ? document.exitFullscreen()
                  : rootRef.current.requestFullscreen()
              }
            />
          </Tooltip>
          <Tooltip title="刷新">
            <ReloadOutlined
              onClick={refresh}
              style={{ fontSize: 18, padding: '0 6px' }}
            />
          </Tooltip>
          <PopoverAutoRefresh
            refresh={() => {
              update()
            }}
          />
          <PopoverColumnSettings
            columns={columns}
            value={columnsSetting}
            onChange={setColumnsSetting}
          />
        </div>
      </div>
      <Table
        className={session['@/System/CssUrl'] ? 'hasccssUrl' : 'nocssUrl'}
        loading={loading}
        size={size}
        columns={columnsSetting}
        dataSource={dataSource.list}
        pagination={
          hasPagination && {
            current: pageIndex,
            showTotal: total => `共${total}条`,
            onChange: v => setPageIndex(v),
            total: dataSource.total,
            showSizeChanger: true,
            onShowSizeChange: (pageIndex, pageSize) => {
              setPageSize(pageSize)
              setPageIndex(pageIndex)
            },
          }
        }
        onChange={fePagination ? undefined : onTableChange}
        {...restProps}
      />
    </div>
  )
}

export default React.forwardRef(TableX)
