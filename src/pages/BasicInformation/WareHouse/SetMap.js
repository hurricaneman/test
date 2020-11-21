/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useEffect } from 'react'
import { AutoComplete, Input, Button, Icon, message } from 'antd'

export default function SearchMap(props) {
  console.log(props)
  const [searchValue, setSearchValue] = React.useState()
  const [searchTips, setsearchTips] = React.useState([])
  const amap = React.useRef()
  useEffect(() => {
    if (!amap.current) {
      amap.current = new AMap.Map('container', {
        center: [106.29395945767213, 29.51857103435052],
        zoom: 12,
      })
    }
  }, [])

  // 根据输入内容查询地点并定位
  function onClickSearhBtn() {
    if (!searchValue) {
      message.warning('请输入查询地址！')
      return
    }
    const geocoder = new AMap.Geocoder({})
    geocoder.getLocation(searchValue, (status, result) => {
      if (status === 'complete' && result.geocodes.length) {
        console.log(result.geocodes[0])
        const {
          location: { lng, lat },
          formattedAddress,
        } = result.geocodes[0]
        this.setState({ searchTips: [] })
        onSearchLocation({ longitude: lng, latitude: lat }, formattedAddress)
      }
    })
  }

  function onSearchLocation(center, address) {
    console.log(address)
    amap.current.setZoomAndCenter(15, [center.longitude, center.latitude])
  }

  // 根据提示项定位
  function onSearchChange(keyword) {
    AMap.plugin('AMap.Autocomplete', () => {
      const autoOptions = {
        city: '全国',
        // citylimit: true,
      }
      const autoComplete = new AMap.Autocomplete(autoOptions)
      autoComplete.search(keyword, (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          setsearchTips(result.tips.filter(v => v.location))
        }
      })
    })
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div id="container" style={{ height: 450 }} />
      <AutoComplete
        style={{
          position: 'absolute',
          top: 12,
          right: 24,
          width: 300,
          zIndex: 999,
        }}
        size="large"
        placeholder="搜索位置"
        onSearch={onSearchChange}
        onChange={v => setSearchValue(v)}
        dataSource={searchTips.map(item => (
          <AutoComplete.Option key={item.id || item.name} data={item}>
            {item.name}
          </AutoComplete.Option>
        ))}
        onSelect={(_v, option) => {
          const {
            location: { lng, lat },
            district,
            address,
            name,
          } = option.props.data
          onSearchLocation(
            { longitude: lng, latitude: lat },
            `${district} ${address} ${name}`
          )
        }}
      >
        <Input
          suffix={
            <Button
              className="search-btn"
              style={{ marginRight: -12 }}
              size="large"
              type="primary"
              onClick={onClickSearhBtn}
            >
              <Icon type="search" />
            </Button>
          }
        />
      </AutoComplete>
    </div>
  )
}
