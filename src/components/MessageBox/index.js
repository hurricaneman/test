import React, { useReducer, useState, useRef, useEffect } from 'react'
import { CarOutlined } from '@ant-design/icons'
import { Modal, Tag, Empty, Checkbox, Col, Row } from 'antd'
import styles from './MessageBox.module.scss'
import { SERVER_ML_MSG_WS } from 'configs/service'
import boxImg from './img/box.png'
import report from './img/report.png'
import boxImgClose from './img/box_active_close.png'
import 'animate.css'
import moment from 'moment'
import { rpc } from 'utils'
import { useBus } from 'utils/hooks'

export default function MessageBox(props) {
  const { history } = props
  const [visible, setVisble] = useState(false)
  const [list, setList] = useState([])
  const ws = useRef()
  const [flag, setFlag] = useReducer(x => !x, true)
  const [active, setActive] = useState(false)
  const [selectLevel, setLevel] = useState(['1', '2'])
  const [renderList, setRenderList] = useState([])
  const mouseDownX = useRef(0)
  const mouseDownY = useRef(0)
  const deltaX = useRef(0)
  const deltaY = useRef(0)
  const sumX = useRef(0)
  const sumY = useRef(0)
  const dom = useRef()

  useBus('update/messageBox', menu => {
    if (menu) {
      const arr = menu.filter(v => v.name === '消息盒子')
      if (arr.length > 0) {
        const remove = p => {
          const list = ['/login', '/iframe/%2Fvbcs-vmm%2F%23%2Fdashboard']
          const arr = list.filter(v => v === p)
          if (arr.length > 0) {
            return false
          }
          return true
        }
        setVisble(remove(history.location.pathname))
        history.listen(() => {
          setVisble(remove(history.location.pathname))
        })
      } else {
        setVisble(false)
      }
    }
  })

  const onChange = checkedValues => {
    setLevel(checkedValues)
  }
  const plainOptions = [
    { label: '高级预警', value: '2' },
    { label: '中级预警', value: '1' },
    { label: '低级预警', value: '0' },
  ]
  const levelColor = {
    high: '#f2596d',
    middle: '#ff8236',
    low: '#4990e2',
  }
  const swtichColor = (level, type = false) => {
    let result
    switch (level) {
      case 0:
        result = type ? 'low' : levelColor.low
        break
      case 1:
        result = type ? 'middle' : levelColor.middle
        break
      default:
        return type ? 'high' : levelColor.high
    }
    return result
  }
  const swtichBtnImg = () => {
    if (!flag) {
      return boxImg
    } else if (active) {
      return boxImgClose
    } else {
      return boxImg
    }
  }
  useEffect(() => {
    setActive(false)
  }, [flag])

  useEffect(() => {
    if (!ws.current) {
      ws.current = new WebSocket(SERVER_ML_MSG_WS + '/websocket/warnWebSocket')
      ws.current.onmessage = e => {
        if (e.data !== '连接成功') {
          const data = JSON.parse(e.data)
          if (flag) {
            setActive(true)
          }
          setList(v => {
            const out = [data.data, ...v]
            if (out.length > 50) {
              out.pop()
            }
            return out
          })
        }
      }
    }
    return () => {
      ws.current?.close()
    }
  }, [])

  useEffect(() => {
    let arr = []
    list.map(v =>
      selectLevel.map(i => {
        if (v.alarmLevel === parseInt(i)) {
          arr.push(v)
        }
      })
    )
    setRenderList(arr)
  }, [selectLevel, list])
  const handlerMove = e => {
    deltaX.current = e.pageX - mouseDownX.current
    deltaY.current = e.pageY - mouseDownY.current

    dom.current.style.transform = `translate(${deltaX.current +
      sumX.current}px, ${deltaY.current + sumY.current}px)`
  }
  const removeMove = () => {
    sumX.current = sumX.current + deltaX.current
    sumY.current = sumY.current + deltaY.current
    deltaX.current = 0
    deltaY.current = 0
    document.onselectstart = () => true
    document.oncontextmenu = () => true
    window.removeEventListener('mousemove', handlerMove, false)
    window.removeEventListener('mouseup', removeMove, false)
  }
  const btnHandler = e => {
    mouseDownX.current = e.pageX
    mouseDownY.current = e.pageY
    document.onselectstart = () => false
    document.oncontextmenu = () => false
    window.addEventListener('mousemove', handlerMove, false)
    window.addEventListener('mouseup', removeMove, false)
  }
  useEffect(() => {
    if (!flag) {
      setTimeout(() => {
        const container = document.getElementsByClassName('msgBox')[0]
        if (container) {
          const header = container.getElementsByClassName('ant-modal-header')[0]
          const body = container.getElementsByClassName('ant-modal-content')[0]
          dom.current = body
          header.style.cursor = 'pointer'
          header.onmousedown = btnHandler
        }
      }, 0)
    }
    return () => {
      window.removeEventListener('mouseup', handlerMove, false)
      window.removeEventListener('mousemove', handlerMove, false)
    }
  }, [flag])
  const gotoLink = vin => {
    if (
      history.location.pathname === '/iframe/%2Fvbcs-vmm%2F%23%2Fcar-monitor'
    ) {
      rpc.remote.setVin(vin)
    }
    setFlag()
    history.push(`/iframe/%2Fvbcs-vmm%2F%23%2Fcar-monitor?vin=${vin}`)
  }

  return (
    <>
      {visible ? (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            zIndex: 999,
            fontSize: 40,
          }}
        >
          <Modal
            width={950}
            title="实时预警消息"
            visible={!flag}
            cancelText=""
            okText=""
            footer={null}
            mask={false}
            onOk={() => setFlag()}
            onCancel={() => setFlag()}
            maskClosable={false}
            wrapClassName={'msgBox'}
          >
            <div style={{ marginBottom: 24 }}>
              <Checkbox.Group
                options={plainOptions}
                defaultValue={['1', '2']}
                onChange={onChange}
              />
            </div>
            <div
              style={{
                height: 400,
                overflow: 'auto',
              }}
            >
              {renderList.length > 0 ? (
                <>
                  {renderList.map(v => (
                    <div
                      key={v.id}
                      style={{
                        padding: 6,
                        border: '1px solid #D8D8D8',
                        background: '#F7F7F7 ',
                        borderRadius: 4,
                        marginBottom: 8,
                        fontSize: 14,
                      }}
                    >
                      <Row justify="space-between">
                        <Col>
                          <Row>
                            <Col style={{ width: 90 }}>
                              <span
                                onClick={() => {
                                  gotoLink(v.vin)
                                }}
                                style={{
                                  color: swtichColor(v.alarmLevel),
                                  marginRight: 6,
                                  cursor: 'pointer',
                                }}
                              >
                                <CarOutlined style={{ marginRight: 6 }} />
                                {v.plateno}
                              </span>
                            </Col>
                            <Col>
                              <span style={{ color: '#00002E' }}>
                                {moment(v.stopTime)
                                  .format('YYYY-MM-DD HH:mm:ss')
                                  .replace(' ', ' / ')}
                              </span>
                            </Col>
                          </Row>
                        </Col>
                        <Col>
                          <Tag color={swtichColor(v.alarmLevel)}>
                            {v.alarmType}
                          </Tag>
                        </Col>
                      </Row>
                      <Row>
                        <Col style={{ marginRight: 6 }}>
                          <img src={report} />
                        </Col>
                        <Col style={{ flex: 1, color: '#00002E' }}>
                          <span style={{ wordBreak: 'break-word' }}>
                            {v.alarmDesc}
                          </span>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </>
              ) : (
                <Empty style={{ padding: '100px 0' }} />
              )}
            </div>
          </Modal>

          <div
            className={`${styles.box} ${
              active && flag ? 'animated bounceIn' : ''
            }`}
            onClick={() => setFlag()}
          >
            <img src={`${swtichBtnImg()}`} />
          </div>
        </div>
      ) : null}
    </>
  )
}
