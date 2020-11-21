/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useEffect } from 'react'
import { useBus } from 'utils/hooks'
import { bus } from 'utils'
import { Icon as LegacyIcon } from '@ant-design/compatible'
import { Button, Slider, Checkbox, Card, Spin } from 'antd'
import moment from 'moment'
import './amap.css'
import icon from './img/img_car.png'
export default function Amap(props) {
  const { vin } = props
  const amap = React.useRef()
  const marker = React.useRef()
  const polyline = React.useRef()
  const passedPolyline = React.useRef()
  const moveList = React.useRef([])
  const flag = React.useRef(false)
  const [item, setItem] = React.useState()
  const [cardData, setCardData] = React.useState({})
  const [mode, setMode] = React.useState('')
  const [speed, setSpeed] = React.useState(1)
  const [display, setDisplay] = React.useState(true)
  const infoWindow = React.useRef()
  const checked = React.useRef(true)
  const lockView = React.useRef(true)
  const [isStart, setIsStart] = React.useState(false)
  const [isPause, setIsPause] = React.useState(false)
  const [mapLoading, setMapLoading] = React.useState(false)
  const [lock, setLock] = React.useState(true)
  useEffect(() => {
    init()
    if (!amap.current) {
      amap.current = new AMap.Map('container', {
        center: [106.29395945767213, 29.51857103435052],
        zoom: 12,
      })
    }
  }, [vin])

  const init = () => {
    moveList.current.length = 0
    setMode('')
    setItem(undefined)
    if (marker.current) {
      resumeAnimation()
      marker.current.off('on')
      amap.current.remove([marker.current])
    }
    if (polyline.current) {
      amap.current.remove([polyline.current])
    }
    if (infoWindow.current) {
      amap.current.remove([infoWindow.current])
    }
    if (passedPolyline.current) {
      amap.current.remove([passedPolyline.current])
    }
  }

  const initMarker = (map, position, type) => {
    if (position) {
      return new AMap.Marker({
        map: map,
        position: position,
        icon: new AMap.Icon({
          image:
            type === 'history'
              ? icon
              : '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png',
          size:
            type === 'history' ? new AMap.Size(54, 22) : new AMap.Size(30, 40), //图标大小
          imageSize:
            type === 'history' ? new AMap.Size(54, 22) : new AMap.Size(30, 40),
        }),
        offset: new AMap.Pixel(-15, -10),
        autoRotation: true,
        // angle: type === 'history' ? 180 : 0,
      })
    }
    return null
  }
  const initPolyline = (map, lineArr) => {
    return new AMap.Polyline({
      map: map,
      path: lineArr,
      showDir: true,
      strokeColor: '#28F', //线颜色
      strokeWeight: 6, //线宽
    })
  }
  const initPassedPolyline = map => {
    return new AMap.Polyline({
      map: map,
      strokeColor: '#AF5',
      strokeWeight: 6,
    })
  }
  const startAnimation = () => {
    if (marker.current) {
      marker.current.moveAlong(moveList.current, speed * 100)
    }
  }
  const resumeAnimation = () => {
    if (marker.current) {
      marker.current.resumeMove()
    }
  }
  const pauseAnimation = () => {
    if (marker.current) {
      marker.current.pauseMove()
    }
  }
  const stopAnimation = () => {
    if (marker.current) {
      marker.current.stopMove()
    }
  }
  const setDomStr = data => {
    return `
    <div>
      <div style="textalign:center;background:#fff">VIN：${data.vin}</div>
      <div style="textalign:center;background:#fff">车辆状态：${
        data.vehicleStatus
      }</div>
      <div style="textalign:center;background:#fff">速度：${
        data.speed
      }km/h</div>
      <div style="textalign:center;background:#fff">企业名称：${
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
      offset: new AMap.Pixel(0, -15),
    })
  }

  // const convertFrom = (lnglat, data, type) => {
  //   return new Promise((resolve, reject) => {
  //     AMap.convertFrom(lnglat, type, (status, result) => {
  //       if (result.info === 'ok') {
  //         const resLnglat = result.locations[0]
  //         resolve(
  //           Object.assign(data, {
  //             longitude: resLnglat.Q,
  //             latitude: resLnglat.P,
  //           })
  //         )
  //       } else {
  //         reject(result)
  //       }
  //     })
  //   })
  // }
  const debounce = (func, delay) => {
    let timer
    // 通过闭包使timer一直存在内存中
    return function(...args) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        func.apply(this, args)
      }, delay)
    }
  }

  useBus('@/CarMonitor/sendCardData', opt => {
    setCardData(opt)
    setIsStart(false)
    setIsPause(false)
  })
  useBus('@/CarMonitor/sendMaploading', opt => {
    setMapLoading(opt)
  })
  useBus('@/CarMonitor/live', opt => {
    const { data, type } = opt

    async function initData(d) {
      // const data = await convertFrom([d.longitude, d.latitude], d, 'gps')
      if (type === 'history') {
        const data = d
        init()
        setMode(type)
        data.map(v => moveList.current.push([v.longitude, v.latitude]))
        // data.map(v => moveList.current.push(v.location))
        marker.current = initMarker(amap.current, moveList.current[0], type)
        amap.current.setFitView()
        polyline.current = initPolyline(amap.current, moveList.current)
        passedPolyline.current = initPassedPolyline(amap.current)
        setItem(data[0])
        if (marker.current) {
          // eslint-disable-next-line prettier/prettier

          marker.current.on('moving', function(e) {
            if (data[e.passedPath.length]) {
              setItem(data[e.passedPath.length])
            }
            // amap.current &&
            //   amap.current.setZoomAndCenter(18, [
            //     data[e.passedPath.length].longitude,
            //     data[e.passedPath.length].latitude,
            //   ])
            debounce(() => {
              if (lockView.current) {
                amap.current && amap.current.setFitView([marker.current])
              }
            }, 1000)()
            passedPolyline.current.setPath(e.passedPath)
          })
        }
      } else if (type === 'live') {
        const data = Object.assign(d, {
          longitude: d.gcj[0],
          latitude: d.gcj[1],
        })
        setMode(type)
        setItem(data)
        if (!flag.current) {
          marker.current = initMarker(
            amap.current,
            [data.longitude, data.latitude],
            type
          )
          amap.current.setFitView()
          flag.current = true
          infoWindow.current = initInfoWindow(data)
          AMap.event.addListener(marker.current, 'click', () => {
            amap.current.setFitView()
            checked.current = true
            infoWindow.current.open(amap.current, marker.current.getPosition())
          })
          infoWindow.current.on('close', () => {
            checked.current = false
          })
        } else {
          marker.current.setPosition([data.longitude, data.latitude])
          if (checked.current) {
            infoWindow.current.setContent(setDomStr(data))
            infoWindow.current.open(amap.current, [
              data.longitude,
              data.latitude,
            ])
            if (lockView.current) {
              amap.current && amap.current.setFitView()
            }
          }
        }
      }
    }
    initData(data)
  })
  useBus('@/CarMonitor/clean', () => {
    init()
    setSpeed(1)
    setDisplay(true)
    setItem(null)
    flag.current = false
    checked.current = true
    setMode('')
  })
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          zIndex: 999,
          bottom: 0,
          left: 0,
          background: '#fff',
        }}
      >
        <Checkbox
          onChange={e => {
            lockView.current = e.target.checked
            setLock(e.target.checked)
          }}
          checked={lock}
        >
          是否锁定视角
        </Checkbox>
      </div>
      {mode === 'history' && item ? (
        <Card
          title="轨迹详情"
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            zIndex: 10,
            borderRadius: 2,
            padding: '8px 10px',
            background: '#fff',
            transform: 'translateX(100%)',
            width: 280,
          }}
          className={display ? 'slideIn' : 'slideOut'}
          extra={
            <div>
              <LegacyIcon type="close" onClick={() => setDisplay(false)} />
            </div>
          }
        >
          <div
            style={{ display: display ? 'none' : 'block' }}
            className="slideDisplay"
            onClick={() => setDisplay(true)}
          >
            <LegacyIcon type="double-left" />
          </div>

          {item ? (
            <>
              <div style={{ marginBottom: 8, whiteSpace: 'nowrap' }}>
                <div style={{ marginBottom: 6 }}>
                  VIN码：
                  {cardData.vin}
                </div>
                <div style={{ marginBottom: 6 }}>
                  行驶时长：
                  {cardData.time}h
                </div>
                <div style={{ marginBottom: 6 }}>
                  行驶里程：
                  {cardData.mile}km
                </div>
                <div style={{ marginBottom: 6 }}>
                  最大速度：
                  {cardData.max_speed}km/h
                </div>
                <div style={{ marginBottom: 6 }}>
                  行程开始时间：
                  {moment(cardData.start_time).format('YYYY-MM-DD HH:mm:ss')}
                </div>
                <div style={{ marginBottom: 6 }}>
                  行程结束时间：
                  {moment(cardData.stop_time).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </div>
              <div
                style={{
                  marginBottom: 12,
                  marginTop: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignContent: 'center',
                }}
              >
                <span style={{ lineHeight: '32px' }}>倍数选择：</span>
                <Slider
                  style={{ flex: 1 }}
                  defaultValue={1}
                  min={1}
                  max={10}
                  onChange={v => {
                    setSpeed(v)
                  }}
                />
              </div>
              <div
                style={{
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Button
                  style={{ marginRight: 8 }}
                  onClick={() => {
                    if (isStart) {
                      if (isPause) {
                        pauseAnimation()
                        // console.log('pauseAnimation动画暂停')
                      } else {
                        resumeAnimation()
                        // console.log('resumeAnimation动画恢复')
                      }
                    } else {
                      if (isPause) {
                        resumeAnimation()
                        // console.log('resumeAnimation动画恢复')
                      } else {
                        startAnimation()
                        // console.log('startAnimation动画开始')
                      }
                    }
                    setIsStart(true)
                    setIsPause(!isPause)
                  }}
                >
                  {isStart ? (!isPause ? '开始播放' : '暂停播放') : '开始播放'}
                </Button>
                <Button
                  onClick={() => {
                    stopAnimation()
                    console.log('stopAnimation动画停止')
                    setIsStart(false)
                    setIsPause(false)
                  }}
                >
                  停止播放
                </Button>
              </div>
              <div>
                <Button
                  type="primary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    bus.emit('@/CarMonitor/clean')
                    bus.emit('@/Map/alive')
                  }}
                >
                  关闭轨迹
                </Button>
              </div>
            </>
          ) : null}
        </Card>
      ) : null}
      {/* {mode === 'live' && item ? (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            zIndex: 10,
            borderRadius: 2,
            padding: '8px 10px',
            background: '#fff',
            width: 220,
            transform: 'translateX(100%)',
          }}
          className={display ? 'slideIn' : 'slideOut'}
        >
          <div
            style={{ display: display ? 'none' : 'block' }}
            className="slideDisplay"
            onClick={() => setDisplay(true)}
          >
            <LegacyIcon type="double-left" />
          </div>
          <div
            style={{
              display: 'flex',
              marginBottom: 8,
              flexDirection: 'row-reverse',
            }}
          >
            <LegacyIcon type="close" onClick={() => setDisplay(false)} />
          </div>
          {item ? (
            <div style={{ marginBottom: 8, whiteSpace: 'nowrap' }}>
              <p>车辆状态：{item.clientStatus}</p>
              <p>
                收集时间：
                {moment(item.collectTime).format('YYYY-MM-DD HH:mm:ss')}
              </p>
              <p>经度：{item.longitude}</p>
              <p>纬度：{item.latitude}</p>
              <p>车辆vin：{item.vin}</p>
              <p>归属公司：{item.vehicleCompany}</p>
              <p>车型：{item.vehicleType}</p>
            </div>
          ) : null}
        </div>
      ) : null} */}
      <Spin tip="轨迹加载中..." spinning={mapLoading}>
        <div id="container" style={{ height: 450 }} />
      </Spin>
    </div>
  )
}
