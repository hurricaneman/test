import React from 'react'
import axios from 'axios'
import { Drawer, Card, Descriptions, Tag, Image, Col, Row } from 'antd'
import CarTable from './CarTable'
import { SERVERDFWL } from 'configs/service'
import { checkres } from 'utils'
//import moment from 'moment'

export default function DrawerInfo(props) {
  const { visible, onCancel, record = {} } = props
  const [updataCarlist, setUpdataCarlist] = React.useState([])
  const [moveProportion, setmoveProportion] = React.useState({
    moveRatio: '',
    moveRule: '',
  })
  const [moveProportionResidue, setmoveProportionResidue] = React.useState('')
  console.log(props)
  React.useEffect(() => {
    if (record?.id) {
      axios
        .get('/mobileapplication/queryapplyinfo', {
          params: { mobileApplicationId: record.id },
          baseURL: SERVERDFWL,
        })
        .then(res => {
          if (!checkres(res)) return []
          setUpdataCarlist([])
          setUpdataCarlist(res.data.data)
          initGetMoveValue(record.dealerId, res.data.data)
        })
    }
  }, [record])

  //获取移动比的接口
  function initGetMoveValue(value, data) {
    return axios
      .post(
        '/regulatory/ratio/page',
        { dealerId: value },
        { baseURL: SERVERDFWL }
      )
      .then(res => {
        if (!checkres(res)) return []
        console.log(res)
        setmoveProportion({
          moveRatio: res.data.data?.records[0]?.moveRatio,
          moveRule: res.data.data?.records[0]?.moveRule,
        })
        getmoved(data, res.data.data?.records[0]?.moveRule)
      })
  }

  //  移动后监管比计算
  function getmoved(data, moveRule) {
    if (record.status != 1) {
      return
    }
    axios
      .get('/regulatory/ratio/moved', {
        params: {
          warehouseId: record.warehouseId,
          vehicleIds: data.map(t => t.id).join(),
          moveRule: moveRule,
          dealerId: record.dealerId,
        },
        baseURL: SERVERDFWL,
      })
      .then(res => {
        if (!checkres(res)) return []
        console.log(res)
        setmoveProportionResidue(res.data.data)
      })
  }
  return (
    <Drawer
      width={1400}
      placement="right"
      closable={true}
      onClose={onCancel}
      visible={visible}
    >
      <Card>
        <Descriptions title="基本信息">
          <Descriptions.Item label="申请单号">
            <a>{record.applyOddNumber}</a>
          </Descriptions.Item>
          <Descriptions.Item label="经销商">
            <a> {record.dealerName}</a>
          </Descriptions.Item>
          <Descriptions.Item label="移动网点">
            <a>{record.warehouseName}</a>
          </Descriptions.Item>
          <Descriptions.Item label="业务类型">
            <Tag color={['', 'blue', 'green', 'blue'][record.status]}>
              {['', '移库', '借车', '借钥匙'][record.status]}
            </Tag>
          </Descriptions.Item>
          {record.status == 2 ? (
            <Descriptions.Item label="还回时间">
              {record.returnEndDate}
            </Descriptions.Item>
          ) : (
            ''
          )}
          <Descriptions.Item label="申请人">
            {record.applyName}
          </Descriptions.Item>
          <Descriptions.Item label="申请数量">
            {record.applyNum}
          </Descriptions.Item>
          <Descriptions.Item label="申请起始日期">
            {record.applyDate}
            {/* {record?.applyDate ? moment(record.applyDate, 'YYYY-MM-DD') : null} */}
          </Descriptions.Item>
          <Descriptions.Item label="批准数量">
            {record.ratifyNum}
          </Descriptions.Item>
          <Descriptions.Item label="金融机构审批人">
            {record.financeId}
          </Descriptions.Item>
          <Descriptions.Item label="金融机构审批日期">
            {record.financeApplyDate}
          </Descriptions.Item>
          <Descriptions.Item label="移动比">
            {moveProportion.moveRatio}
          </Descriptions.Item>
          <Descriptions.Item label="移动后的剩余比例">
            {moveProportionResidue}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={['yellow', 'green', 'red'][record.applyStatus]}>
              {
                ['未提交', '待审核', '同意', '不同意', '已撤回'][
                  record.applyStatus
                ]
              }
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card style={{ marginTop: 10 }} title="车辆列表">
        <CarTable
          updataCarlist={updataCarlist}
          record={record}
          carSelectTable={{ rows: [] }}
          showDelete={true}
        ></CarTable>
      </Card>
      <Card title="图片附件">
        {record?.imgs?.split(',').map((t, i) => (
          <Image width={100} src={t} key={i} />
        ))}
      </Card>
      <Card title="文件附件">
        <Row>
          {record?.files?.split(',').map((t, i) => (
            <Col span={4} key={i}>
              <a href={t}>{`附件文件${i + 1}`}</a>
            </Col>
          ))}
        </Row>
      </Card>
    </Drawer>
  )
}
