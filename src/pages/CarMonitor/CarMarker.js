/* eslint-disable no-undef */
import React, { useEffect } from 'react'
import moment from 'moment'
// import { useBus } from 'utils/hooks'
export default function CarMarker(props) {
  const { data, amap, clean } = props
  const flag = React.useRef()
  const marker = React.useRef([])
  const infoWindow = React.useRef()
  const checked = React.useRef(false)
  const init = () => {
    if (marker.current) {
      flag.current = undefined
      amap.remove([marker.current])
      marker.current = undefined
    }
    if (infoWindow.current) {
      checked.current = false
      amap.remove([infoWindow.current])
      infoWindow.current = undefined
    }
  }

  const initMarker = (map, position) => {
    if (position) {
      return new AMap.Marker({
        map: map,
        position: position,
        icon: new AMap.Icon({
          image:
            '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
          size: new AMap.Size(30, 40), //图标大小
          imageSize: new AMap.Size(30, 40),
        }),
        offset: new AMap.Pixel(-15, -40),
        // autoRotation: true,
        // angle: -90,
      })
    }
    return null
  }
  const setDomStr = data => {
    return `
    <div>
      <div style="textalign:center;background:#fff">VIN：${data.vin}</div>
      <div style="textalign:center;background:#fff">车辆状态：${
        data.vehicleStatus
      }</div>
      <div style="textalign:center;background:#fff">速度：${data.speed}</div>
      <div style="textalign:center;background:#fff">车辆归属：${
        data.vehicleCompany
      }</div>
      <div style="textalign:center;background:#fff">经度：${
        data.location[0]
      }</div>
      <div style="textalign:center;background:#fff">纬度：
      ${data.location[1]}</div>
      <div style="textalign:center;background:#fff">收集时间：${moment(
        data.collectTime
      ).format('YYYY-MM-DD HH:mm:ss')}</div>
    </div>`
  }
  const initInfoWindow = data => {
    return new AMap.InfoWindow({
      // isCustom: true, //使用自定义窗体
      content: setDomStr(data),
      offset: new AMap.Pixel(0, -45),
    })
  }
  // const convertFrom = (lnglat, data, type) => {
  //   return new Promise((resolve, reject) => {
  //     AMap.convertFrom(lnglat, type, (status, result) => {
  //       if (result.info === 'ok') {
  //         const resLnglat = result.locations[0]
  //         resolve(
  //           Object.assign(data, {
  //             longitude: resLnglat.lng,
  //             latitude: resLnglat.lat,
  //           })
  //         )
  //       } else {
  //         reject(result)
  //       }
  //     })
  //   })
  // }

  // 树列表选择车辆时切换绑定marker
  // useEffect(() => {
  //   console.log(activeIndex)
  //   if (activeIndex && activeIndex === data.vin) {
  //     console.log('laile')
  //     checked.current = true
  //   }
  //   return () => {
  //     checked.current = false
  //     infoWindow.current.close()
  //   }
  // }, [activeIndex])

  useEffect(() => {
    async function init(d) {
      // const data = await convertFrom([d.longitude, d.latitude], d, 'gps')
      const data = Object.assign(d, {
        longitude: d.gcj[0],
        latitude: d.gcj[1],
      })
      if (!flag.current) {
        marker.current = initMarker(amap, [data.longitude, data.latitude])
        flag.current = true
        infoWindow.current = initInfoWindow(data)
        AMap.event.addListener(marker.current, 'click', () => {
          amap.setFitView()
          checked.current = true
          infoWindow.current.open(amap, marker.current.getPosition())
        })
        infoWindow.current.on('close', () => {
          checked.current = false
        })
        amap.setFitView()
      } else {
        if (checked.current) {
          infoWindow.current.setContent(setDomStr(data))
          infoWindow.current.open(amap, [data.longitude, data.latitude])
          amap.setFitView()
        }
        marker.current.setPosition([data.longitude, data.latitude])
      }
    }
    init(data)
  }, [data])

  useEffect(() => {
    return () => init()
  }, [])
  useEffect(() => {
    return () => init()
  }, [clean])

  return null
}
