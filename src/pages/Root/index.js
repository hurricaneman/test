import React from 'react'
import { Icon as LegacyIcon } from '@ant-design/compatible'
import { ExclamationCircleTwoTone } from '@ant-design/icons'
import {
  Layout,
  Menu,
  Dropdown,
  Badge,
  message,
  Popover,
  Empty,
  Divider,
  notification,
  Tabs,
} from 'antd'
import { renderRoutes } from 'react-router-config'
import moment from 'moment'
import { Link, useLocation, useHistory } from 'react-router-dom'
import axios from 'axios'
import { session, mem, changeTheme, rpc, checkres, transformURL } from 'utils'
import { menuToTree, bus, linkWithParams } from 'utils'
import { useBus } from 'utils/hooks'
import styles from './index.module.scss'
import imgLogo from 'assets/logo.png'
import imgUser from './img/user.png'
import QRCode from 'qrcode.react'
// import { useTheme, useHead, useMenuType } from 'utils/hooks'
import { useHead, useMenuType } from 'utils/hooks'
import _ from 'lodash'
import ScreenLock from './ScreenLock'
import { SERVER_ML_MSG_WS } from 'configs/service'

const { Header, Content, Sider } = Layout
const { TabPane } = Tabs

function renderMenus(menus) {
  return menus.map(v =>
    v.children ? (
      <Menu.SubMenu
        key={v.menuId}
        title={
          <span>
            {v.icon && <LegacyIcon type={v.icon}></LegacyIcon>}
            <span>{v.name}</span>
          </span>
        }
      >
        {renderMenus(v.children)}
      </Menu.SubMenu>
    ) : (
      <Menu.Item key={v.menuId}>
        <Link to={transformURL(v.url)}>
          {v.icon && <LegacyIcon type={v.icon}></LegacyIcon>}
          <span>{v.name}</span>
        </Link>
      </Menu.Item>
    )
  )
}

function getOpenKeys(menus, path) {
  if (!menus) return
  const out = []
  let parentId = menus.find(v => transformURL(v.url) === path)?.parentId
  for (;;) {
    const node = menus.find(v => v.menuId === parentId)
    if (node) {
      out.push(String(node.menuId))
      parentId = node.parentId
    } else {
      break
    }
  }
  return out
}

export default function Root(props) {
  const { route } = props

  const [collapsed, setCollapsed] = React.useState(false)
  // const [menusType, setMenusType] = React.useState('LEFT')
  const [menus, setMenus] = React.useState()
  const [menuData, setMenuData] = React.useState([])
  const [menuChildData, setMenuChildData] = React.useState()
  const [openKeys, setOpenKeys] = React.useState([])
  const [selectedKeys, setSelectedKeys] = React.useState([])
  const [headerMenuKey, setHeaderMenuKey] = React.useState(false)
  const [screenLock, setScreenLock] = React.useState(session.screenLock)
  const [messageNum, setMessageNum] = React.useState(0)
  const [messageList, setMessageList] = React.useState([])
  const [tabList, setTabList] = React.useState(session.tabList || [])
  const [activeKey, setActiveKey] = React.useState(session.tabActiveKey || null)
  // const theme = useTheme()
  const history = useHistory()
  const location = useLocation()
  const headFixd = useHead()
  const menusType = useMenuType()
  const ws = React.useRef()
  const [time, setTime] = React.useState(
    session.userData?.leaveProtectTime || 0
  )
  const [messageVisible, setMessageVisible] = React.useState(false)
  const [updateHandle, update] = React.useReducer(x => !x, false)

  useBus('@/System/safe/screenLock', value => {
    setTime(value)
  })

  useBus('@/System/message/unReadNum', value => {
    setMessageNum(value)
  })

  React.useEffect(() => {
    if (messageVisible) {
      axios
        .get('/message/page', {
          params: {
            pageIndex: 1,
            pageSize: 3,
          },
        })
        .then(res => {
          if (!checkres(res)) return
          setMessageList(res.data.data.records)
        })
    }
  }, [messageVisible])

  //获取未读消息条数
  React.useEffect(() => {
    axios
      .get('/message/unreadMessages', {
        params: {},
      })
      .then(res => {
        if (!checkres(res)) return
        setMessageNum(res.data.data.total)
      })
  }, [updateHandle])

  //scoket消息推送弹窗
  React.useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket(
        SERVER_ML_MSG_WS + '/websocket/messageWebSocket'
      )
      ws.current.onmessage = e => {
        if (e.data !== '连接成功') {
          const data = JSON.parse(e.data).data
          // console.log(data)
          const key = '0'
          fetch(
            `https://restapi.amap.com/v3/geocode/regeo?key=f60167380d1e1a408d6e5260a51be164&location=${data.location}&poitype=&radius=&extensions=all&batch=false&roadlevel=0`
          )
            .then(function(response) {
              return response.json()
            })
            .then(function(myJson) {
              // console.log(myJson)
              let address = ''
              if (myJson.status === '1') {
                address = myJson.regeocode.formatted_address
              }
              // console.log(address)
              notification.open({
                message: (
                  <div>
                    <ExclamationCircleTwoTone twoToneColor="#FAAD14" />
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        marginLeft: 12,
                      }}
                    >
                      预警提醒
                    </span>
                  </div>
                ),
                description: (
                  <div
                    style={{
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '30px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 14,
                      }}
                    >
                      <div>{data.vin ? data.vin.toUpperCase() : ''}</div>
                      <div
                        style={{
                          width: 56,
                          height: 26,
                          borderRadius: 2,
                          textAlign: 'center',
                          lineHeight: '26px',
                          color: '#ffffff',
                          fontWeight: 500,
                          background: [
                            '#F0C826',
                            '#EB8C2F',
                            '#E55050',
                            '#E55050',
                          ][data.alarmLevel],
                        }}
                      >
                        {data.alarmLevel}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '30px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 14,
                      }}
                    >
                      <div>
                        {
                          ['车辆预警', '区域预警', '事故预警', '自定义预警'][
                            data.type
                          ]
                        }
                      </div>
                      <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                        {moment(data.date).format('YYYY-MM-DD HH:MM:ss')}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        fontSize: 12,
                        height: '30px',
                        lineHeight: '30px',
                        color: 'rgba(0,0,0,0.65)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {address}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <a
                        style={{
                          color: session['@/System/CssUrl']
                            ? 'var(--PC)'
                            : '#1890ff',
                          fontSize: 14,
                        }}
                        onClick={() => {
                          notification.close(key)
                          if (data.type === 1) {
                            linkWithParams('/vehicleAreaWarning', { ...data })
                          } else {
                            linkWithParams('/safety-warning', { ...data })
                          }
                        }}
                      >
                        立即处理
                      </a>
                    </div>
                  </div>
                ),
                duration: 10,
                key: key,
                placement: 'bottomRight',
              })
              update() //更新未读消息条数
            })
        }
      }
    }
    return () => {
      ws.current?.close()
    }
  }, [])

  const defaultLink = menu => {
    if (menu.children) {
      defaultLink(menu.children)
    } else if (menu.length) {
      defaultLink(menu[0])
    } else {
      if (menu.url) {
        history.push(transformURL(menu.url))
      } else {
        history.push(transformURL(menu[0].url))
      }
    }
  }

  const headerMenuKeyClick = menu => {
    const loop = setInterval(() => {
      setHeaderMenuKey(menu.menuId)
      clearInterval(loop)
    }, 200)
    if (menu.children) {
      setMenuChildData(menu.children)
    }
    defaultLink(menu)
  }

  const renderRootMenus = menus => {
    return menus.map(v => (
      <span
        key={v.menuId}
        onClick={() => {
          headerMenuKeyClick(v)
        }}
        className={
          v.menuId == headerMenuKey
            ? `${styles.headerMenuSub} ${styles.active}`
            : `${styles.headerMenuSub}`
        }
      >
        {v.icon && (
          <LegacyIcon style={{ fontSize: 22 }} type={v.icon}></LegacyIcon>
        )}
        <br />
        <span>{v.name}</span>
      </span>
    ))
  }

  React.useEffect(() => {
    function popup() {
      if (session.screenLock) return
      axios.get('/sys/loginLock').then(res => {
        if (res.data.code === 1) {
          session.screenLock = true
          setScreenLock(true)
        }
      })
    }
    if (time === 0) return
    const fn = _.debounce(popup, time * 60 * 1000)
    rpc.local.screenLock = fn
    // 定义子项目的页面带参数跳转函数
    rpc.local.linkWithParams = linkSrc => {
      history.push(transformURL(linkSrc))
    }
    window.addEventListener('mousemove', fn)
    return () => {
      window.removeEventListener('mousemove', fn)
    }
  }, [])

  React.useEffect(() => {
    async function getMenu() {
      const { data: res } = await axios.get('/menu/nav')
      if (!res.data) return
      const menus = menuToTree(
        res.data
          .filter(v => v && v.type < 2)
          .map(v => ({ ...v, title: v.name, value: v.menuId }))
      )
      mem['@/System/Menu/List'] = res.data
      setTimeout(() => {
        bus.emit('update/messageBox', res.data)
      }, 500)
      setMenus(menus)
      setMenuData(res.data)
      return menus
    }

    getMenu().then(menus => {
      if (location.pathname === '/home') {
        // console.log(menus)
        defaultLink(menus)
        // history.push(transformURL(menus[0].children[0].url))
      }
    })

    bus.on('@/System/Menu/Update', getMenu)
    return () => {
      bus.off('@/System/menuType', getMenu)
    }
  }, [])

  React.useEffect(() => {
    const { pathname } = location
    const openKeys = getOpenKeys(menuData, pathname)
    const selectedKeys = menuData
      ? [String(menuData.find(v => transformURL(v.url) === pathname)?.menuId)]
      : []
    setOpenKeys(openKeys)
    if (openKeys && openKeys.length > 0) {
      setHeaderMenuKey(
        (openKeys && openKeys.length > 0 && openKeys[0]) || false
      )
      const menuChild = menus.filter(
        item => String(item.menuId) === openKeys[0]
      )[0]
      setMenuChildData((menuChild && menuChild.children) || [])
    } else {
      setHeaderMenuKey(selectedKeys || false)
      setMenuChildData([])
    }
    setSelectedKeys(selectedKeys)
    onHandlePage(pathname, menuData)
  }, [location.pathname, menuData])

  const isIframe = location.pathname.startsWith('/iframe/')

  React.useEffect(() => {
    if (menuData && location.pathname) {
      rpc.local.pageHeaderinfo = () => ({
        menuData: menuData,
        pathname: location.pathname,
        headFixd: headFixd,
      })
    }
  }, [location.pathname, menuData])

  // React.useEffect(() => {
  //   if (menus && menus.length > 0) {
  //     defaultLink(menus[0])
  //   }
  // }, [menus])

  function close(v) {
    axios
      .get('/sys/loginUnLock', { params: { password: window.btoa(v) } })
      .then(res => {
        if (res.data.code === 1) {
          session.screenLock = false
          setScreenLock(false)
        } else {
          message.error('密码错误请重新输入')
        }
      })
  }

  const getMenuData = (data, list) => list.find(v => v.url === data)

  const onHandlePage = (key, menuData) => {
    if (!tabList || menuData.length === 0) return
    const data = getMenuData(key, menuData)
    if (!data) return
    if (!tabList.map(v => v.url).includes(key)) {
      const list = tabList
      list.push(data)
      setTabList(list)
      session.tabList = list
    }
    setActiveKey(key)
    session.tabActiveKey = key
  }

  const remove = key => {
    if (tabList.length === 1) {
      message.info('无法删除最后一个标签页')
      return
    }
    let index = tabList.findIndex(v => v.url === key)
    const list = tabList.filter(v => v.url !== key)
    setTabList(list)
    session.tabList = list
    if (index > list.length - 1) {
      index = list.length - 1
    }
    const url = list[index].url
    setActiveKey(url)
    session.tabActiveKey = url
    history.push(url)
  }

  const MessageContent = (
    <div style={{ width: 320 }}>
      {messageList.length > 0 ? (
        messageList.map(v => (
          <div
            key={v.id}
            style={{
              borderBottom: '1px solid rgba(232,232,232,1)',
              cursor: 'pointer',
            }}
            onClick={() => {
              history.push('/message')
              setMessageVisible(false)
            }}
          >
            <p style={{ marginBottom: 0, fontFamily: 'pingfang' }}>
              {v.msgContent}
            </p>
            <p
              style={{
                color: 'rgba(0,0,0,0.45)',
                marginBottom: 12,
                fontFamily: 'pingfang',
              }}
            >
              {v.createTime}
            </p>
          </div>
        ))
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="无最新消息"
        ></Empty>
      )}

      <Divider style={{ marginBottom: 12 }}></Divider>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <a
          onClick={() => {
            history.push('/message')
            setMessageVisible(false)
          }}
        >
          查看全部消息
        </a>
      </div>
    </div>
  )

  return (
    <>
      {screenLock ? (
        <ScreenLock
          close={close}
          username={
            session.userData.username ? session.userData.username : null
          }
        ></ScreenLock>
      ) : null}

      <Layout>
        <Header
          style={{
            position: 'relative',
            display: 'flex',
            background:
              menusType == 'LEFT'
                ? 'rgba(255,255,255)'
                : 'linear-gradient(180deg, rgba(43, 57, 71, 1) 0%, rgba(43, 57, 71, 1) 6%, rgba(29, 38, 47, 1) 100%, rgba(29, 38, 47, 1) 100%)',
            padding: 0,
            paddingRight: 16,
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            zIndex: 999,
          }}
        >
          <div
            style={{
              height: 64,
              position: 'relative',
              overflow: 'hidden',
              left: 'calc((100vw - 372px)/2)',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                width: 176,
                height: 64,
                backgroundImage: `url(${imgLogo})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                float: 'left',
                marginLeft: 24,
                marginRight: 12,
              }}
            />
            <span
              style={{
                display: 'inline-block',
                color: menusType == 'LEFT' ? '#333333' : '#ffffff',
                fontSize: 20,
                height: 64,
                lineHeight: '64px',
                fontWeight: 600,
                float: 'left',
              }}
            >
              东风物流监管平台
            </span>
          </div>
          <div style={{ flex: 1, marginLeft: 52 }}>
            {menus && menusType == 'TOPLEFT' && (
              <div>{renderRootMenus(menus)}</div>
            )}
          </div>
          <div
            className={styles.headerButton}
            style={{
              color: menusType == 'LEFT' ? '#333333' : '#ffffff',
            }}
          >
            <Popover
              content={
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: 24,
                    }}
                  >
                    <QRCode
                      value={window.location.origin + '/h5/index.html'}
                    ></QRCode>
                  </div>

                  <div style={{ marginTop: 24 }}>
                    请使用手机扫描二维码下载APP
                  </div>
                </div>
              }
            >
              <LegacyIcon type="mobile" style={{ fontSize: 20 }}></LegacyIcon>
              <span style={{ marginLeft: 5 }}>APP下载</span>
            </Popover>
          </div>
          <div
            className={styles.headerButton}
            style={{
              color: menusType == 'LEFT' ? '#333333' : '#ffffff',
            }}
          >
            <Popover
              placement="bottomRight"
              arrowPointAtCenter
              content={MessageContent}
              title={<div style={{ textAlign: 'center' }}>消息</div>}
              trigger="click"
              visible={messageVisible}
              onVisibleChange={visible => setMessageVisible(visible)}
            >
              <Badge count={messageNum}>
                <LegacyIcon type="bell" style={{ fontSize: 20 }}></LegacyIcon>
              </Badge>
            </Popover>
          </div>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item>
                  <Link to="/profile/info">个人中心</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/profile/password">修改密码</Link>
                </Menu.Item>
                <Menu.Item>
                  <Link to="/profile/theme">主题配置</Link>
                </Menu.Item>
                <Menu.Divider></Menu.Divider>
                <Menu.Item
                  onClick={() => {
                    changeTheme()
                    setTabList([])
                    setActiveKey(null)
                    session.tabActiveKey = null
                    session.tabList = []
                    axios.post('/sys/logout')
                    history.push('/login')
                  }}
                >
                  退出登录
                </Menu.Item>
              </Menu>
            }
          >
            <div
              className={styles.headerButton}
              style={{
                color: menusType == 'LEFT' ? '#333333' : '#ffffff',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  backgroundImage: `url(${
                    session.userData?.imgUrl
                      ? session.userData?.imgUrl
                      : imgUser
                  })`,
                  backgroundSize: 'cover',
                  marginRight: 8,
                }}
              ></div>
              <div>{session.userData?.username}</div>
              <LegacyIcon type="caretDown"></LegacyIcon>
            </div>
          </Dropdown>
        </Header>
        <Layout>
          {(menuChildData &&
            menuChildData.length &&
            menuChildData.length > 0 &&
            menusType == 'TOPLEFT') ||
          menusType == 'LEFT' ? (
            <Sider
              width={256}
              trigger={null}
              collapsible
              collapsed={collapsed}
              style={{
                boxShadow: '2px 0 6px rgba(0,21,41,.35)',
                height: 'calc(100vh - 64px)',
              }}
              className={styles.menu}
            >
              <div
                style={{
                  height: 'calc(100vh - 64px)',
                  overflow: 'auto',
                }}
              >
                {menus && menusType == 'LEFT' && (
                  <Menu
                    theme="dark"
                    mode="inline"
                    openKeys={openKeys}
                    onOpenChange={openKeys => setOpenKeys(openKeys)}
                    selectedKeys={selectedKeys}
                  >
                    {renderMenus(menus)}
                  </Menu>
                )}
                {menuChildData && menusType == 'TOPLEFT' && (
                  <Menu
                    theme="dark"
                    mode="inline"
                    openKeys={openKeys}
                    onOpenChange={openKeys => setOpenKeys(openKeys)}
                    selectedKeys={selectedKeys}
                    onHandlePage={() => {}}
                  >
                    {renderMenus(menuChildData)}
                  </Menu>
                )}
              </div>
            </Sider>
          ) : null}
          <Layout>
            <Tabs
              tabBarExtraContent={{
                left: (
                  <LegacyIcon
                    style={{ fontSize: 20, margin: '0 12px' }}
                    type={collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={() => setCollapsed(v => !v)}
                  />
                ),
              }}
              tabBarStyle={{
                marginBottom: 12,
                boxShadow: '-10px 0 10px #9e9e9e',
                background: '#fff',
              }}
              tabBarGutter={0}
              hideAdd
              type="editable-card"
              activeKey={activeKey}
              onChange={v => {
                setActiveKey(v)
                session.tabActiveKey = v
                history.push(transformURL(v))
              }}
              tabPosition="top"
              onEdit={key => remove(key)}
            >
              {tabList.map(item => (
                <TabPane
                  key={item.url}
                  tab={<span key={item.url}>{item.name}</span>}
                />
              ))}
            </Tabs>
            <Content
              style={{
                height: isIframe
                  ? 'calc(100vh - 124px)'
                  : 'calc(100vh - 124px)',
                overflow: 'auto',
              }}
            >
              {renderRoutes(route.routes)}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </>
  )
}
