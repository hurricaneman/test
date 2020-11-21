import React, { useEffect, useRef, useState } from 'react'
import CarMarker from './CarMarker'
import { useBus } from 'utils/hooks'
export default function Map(props) {
  const { cleanMultilplyMap } = props
  const amap = useRef()
  const [carList, setCarList] = React.useState([])
  const [activeIndex, setIndex] = useState()
  useBus('@/Map/CarList', ({ carList }) => {
    setCarList(carList)
  })
  useEffect(() => {
    if (!amap.current) {
      // eslint-disable-next-line no-undef
      amap.current = new AMap.Map('container', {
        center: [106.29395945767213, 29.51857103435052],
        zoom: 12,
      })
    }
  }, [])
  useBus('@/Map/setChecked', i => {
    console.log(i)
    setIndex(i)
  })
  useEffect(() => {
    return () => {
      setIndex()
    }
  }, [cleanMultilplyMap])
  return (
    <>
      {carList.map((v, i) => {
        return (
          <CarMarker
            activeIndex={activeIndex}
            index={i}
            data={v}
            key={v.vin}
            amap={amap.current}
            clean={cleanMultilplyMap}
          />
        )
      })}
      <div id="container" style={{ height: '100%', width: '100%' }} />
    </>
  )
}
