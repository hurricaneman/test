import React from 'react'
// import { Breadcrumb, PageHeader } from 'antd'
// import { Link, useLocation } from 'react-router-dom'
// import { mem } from 'utils'
// import _ from 'lodash'
// import { useHead } from 'utils/hooks'

// function itemRender(route, params, routes) {
//   const last = routes.indexOf(route) === routes.length - 1
//   return last ? (
//     <span>{route.breadcrumbName}</span>
//   ) : route.path ? (
//     <Link to={route.path}>{route.breadcrumbName}</Link>
//   ) : (
//     <span>{route.breadcrumbName}</span>
//   )
// }

// const getMenuData = (data, list) => list.find(v => v.url === data)

// const getParentList = (list, id) => list.find(v => v.menuId === id)

// const getRouters = (list, id, routes) => {
//   const parentList = getParentList(list, id)
//   routes.push({
//     path: parentList.url,
//     breadcrumbName: parentList.name,
//   })
//   if (parentList.parentId !== 0) {
//     getRouters(list, parentList.parentId, routes)
//   } else {
//     return routes
//   }
// }

export default function PageWrapper(props) {
  const { children, bodyStyle } = props
  // const [routes, setRoutes] = React.useState([])
  // const [title, setTitle] = React.useState()
  // const menuData = mem['@/System/Menu/List']
  // const location = useLocation()
  // const isLoaded = React.useRef(false)
  // const headFixd = useHead()
  // React.useEffect(() => {
  //   if (isLoaded.current) return
  //   if (menuData && location.pathname) {
  //     isLoaded.current = true
  //     let pathname = location.pathname
  //     if (location.pathname.indexOf('iframe') > 0) {
  //       const path = decodeURIComponent(location.pathname.split('/')[2])
  //       pathname = path
  //     }
  //     const data = getMenuData(pathname, menuData)
  //     setTitle(data ? data.name : null)
  //     if (data) {
  //       let list = [
  //         {
  //           path: '/home',
  //           breadcrumbName: `首页`,
  //         },
  //       ]
  //       let routes = getRouters(menuData, data.parentId, list)
  //       routes.push({ path: data.url, breadcrumbName: data.name })
  //       setRoutes(_.uniqBy(routes, 'breadcrumbName'))
  //     }
  //   }
  // }, [menuData])

  // if (!menuData) return null

  return (
    // <div>
    //   <PageHeader
    //     ghost={false}
    //     style={
    //       headFixd
    //         ? {
    //             paddingTop: 6,
    //             paddingBottom: 12,
    //             position: 'sticky',
    //             zIndex: 99,
    //             top: 0,
    //           }
    //         : { paddingTop: 6, paddingBottom: 12 }
    //     }
    //   >
    //     <Breadcrumb itemRender={itemRender} routes={routes}></Breadcrumb>
    //     <div
    //       style={{
    //         fontSize: 20,
    //         fontWeight: 800,
    //         color: 'rgb(0,0,0,0.85)',
    //         lineHeight: '32px',
    //       }}
    //     >
    //       {title}
    //     </div>
    //   </PageHeader>
    <div style={{ padding: '12px', paddingTop: 0, ...bodyStyle }}>
      {children}
    </div>
    // </div>
  )
}
