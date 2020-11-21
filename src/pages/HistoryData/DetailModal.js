import React from 'react'
import Modal from 'antd/lib/modal/Modal'
import { Card, Row, Col, Descriptions, Popover, Button } from 'antd'
const { Item } = Descriptions
export default function({ visible, modal, onCancel }) {
  return (
    <Modal
      visible={visible}
      title="历史数据详情"
      footer={false}
      onCancel={onCancel}
      width={960}
      centered
      bodyStyle={{
        maxHeight: 'calc(100vh - 200px)',
        overflow: 'auto',
      }}
    >
      <Card size="small" title="原始报文">
        {modal.originalMsg}
      </Card>
      <Card size="small" title="73项数据" style={{ marginTop: 16 }}>
        <Row>
          <Col span={12}>
            <Descriptions
              title={<div style={{ fontSize: 14 }}>1.整车数据(11项)</div>}
              column={1}
            >
              <Item label="车辆状态">{modal.vehicleStatus}</Item>
              <Item label="充电状态">{modal.chargingStatus}</Item>
              <Item label="运行模式">{modal.runMode}</Item>
              <Item label="车速">{modal.speed}km/h</Item>
              <Item label="累计里程">{modal.accumulativeMile}km</Item>
              <Item label="总电压">{modal.totalVoltage}</Item>
              <Item label="总电流">{modal.totalElectricity}A</Item>
              <Item label="SOC">{modal.soc}</Item>
              <Item label="DC-DC状态">{modal.dcStatus}</Item>
              <Item label="档位">{(modal.gears || []).join(', ')}</Item>
              <Item label="绝缘电阻">{modal.insulationResistance}kΩ</Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title={<div style={{ fontSize: 14 }}>2.驱动电机数据(10项)</div>}
            />
            {(modal.nEDriverMotorBeans || []).map((v, i) => (
              <Popover
                key={i}
                title={`驱动电机${i + 1}`}
                content={
                  <Descriptions column={1} style={{ width: 320 }}>
                    <Item label="驱动电机序号">{v.driverMotorSerial}</Item>
                    <Item label="驱动电机状态">{v.driverMotorState}</Item>
                    <Item label="驱动电机控制器温度">
                      {v.driverMotorTemperature}℃
                    </Item>
                    <Item label="驱动电机转速">{v.driverMotorRPM}rpm</Item>
                    <Item label="驱动电机转矩">{v.driverMotorTorque}N*m</Item>
                    <Item label="驱动电机温度">
                      {v.driverMotorTemperature}℃
                    </Item>
                    <Item label="电机控制器输入电压">
                      {v.motorControllerInputVoltage}V
                    </Item>
                    <Item label="电机控制器直流母线电流">
                      {v.motorControllerNegativeDCCurrent}A
                    </Item>
                  </Descriptions>
                }
                placement="bottomLeft"
              >
                <Button style={{ margin: 8 }}>{`驱动电机${i + 1}`}</Button>
              </Popover>
            ))}
          </Col>
          <Col span={12}>
            <Descriptions
              title={<div style={{ fontSize: 14 }}>3.极值数据</div>}
              column={1}
            >
              <Item label="最高电压电池子系统号">
                {modal.lowVBatterySubNum}
              </Item>
              <Item label="最高电压电池单体代号">
                {modal.lowVBatteryCellCode}
              </Item>
              <Item label="电池单体电压最高值">
                {modal.maximumBatteryVoltage}V
              </Item>
              <Item label="最低电压电池子系统号">
                {modal.lowVBatterySubNum}
              </Item>
              <Item label="最低电压电池单体代号">
                {modal.highVBatteryCellCode}
              </Item>
              <Item label="电池单体电压最低值">
                {modal.minimumBatteryVoltage}V
              </Item>
              <Item label="最高温度子系统号">
                {modal.highTemperatureSubNum}
              </Item>
              <Item label="最高温度探针单体代号">
                {modal.highTemperatureProbeSerial}
              </Item>
              <Item label="最高温度值">{modal.maxTemperatureValue}℃</Item>
              <Item label="最低温度子系统号">{modal.lowTemperatureSubNum}</Item>
              <Item label="最低温度探针子系统代号">
                {modal.lowTemperatureProbeSerial}
              </Item>
              <Item label="最低温度值">{modal.minTemperatureValue}℃</Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title={<div style={{ fontSize: 14 }}>4.报警数据(10项)</div>}
              column={1}
            >
              <Item label="最高报警等级">{modal.maxAlarmRating}</Item>
              <Item label="通用报警标志">{modal.alarmIdentification}</Item>
              <Item label="可充电储能装置故障总数N1">
                {modal.rechargeableStorageDeviceN1}
              </Item>
              <Item label="可充电储能装置故障代码列表">
                {modal.rechargeableStorageCodeList}
              </Item>
              <Item label="驱动电机故障总数N2">
                {modal.driverMotorFailureN2}
              </Item>
              <Item label="驱动电机故障代码列表">
                {modal.driverMotorFailureCodeList}
              </Item>
              <Item label="发动机故障总数N3">{modal.engineFailureN3}</Item>
              <Item label="发动机故障列表">0</Item>
              <Item label="其他故障总数N4">{modal.otherFailureN4}</Item>
              <Item label="其他故障代码列表">{modal.otherFailureCodeList}</Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title={<div style={{ fontSize: 14 }}>5.车辆位置数据(3项)</div>}
              column={1}
            >
              <Item label="定位状态">{(modal.locations || []).join(', ')}</Item>
              <Item label="经度">{modal.latitude}</Item>
              <Item label="纬度">{modal.longitude}</Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title={<div style={{ fontSize: 14 }}>6.发动机数据(3项)</div>}
              column={1}
            >
              <Item label="发动机状态">{modal.engineState}</Item>
              <Item label="曲轴转速">{modal.speedOfCrankshaft}</Item>
              <Item label="燃料消耗率">{modal.rateOfFuelConsumption}</Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title={<div style={{ fontSize: 14 }}>7.燃料电池数据(12项)</div>}
              column={1}
            >
              <Item label="燃料电池电压">{modal.fuelCellVoltage}</Item>
              <Item label="燃料电池电流">{modal.fuelCellCurrent}</Item>
              <Item label="燃料消耗率">{modal.rateOfFuelConsumption}</Item>
              <Item label="燃料电池温度探针总数">
                {modal.fuelCellProbeNumber}
              </Item>
              <Item label="探针温度值">{modal.probeTemperature}</Item>
              <Item label="氢系统中最高温度">
                {modal.maxTemperatureInHydrogenSystem}
              </Item>
              <Item label="氢系统中最高温度探针代号">
                {modal.maxTemperatureProbeSerial}
              </Item>
              <Item label="氢气最高浓度">{modal.maxHydrogenConcentration}</Item>
              <Item label="氢气最高浓度传感器代号">
                {modal.maxHydrogenConcentrationProbeSerial}
              </Item>
              <Item label="氢气最高压力">{modal.maxPressureHydrogen}</Item>
              <Item label="氢气最高压力传感器代号">
                {modal.maxPressureHydrogenProbeSerial}
              </Item>
              <Item label="高压DC/DC状态">{modal.highPressDCState}</Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions
              title={
                <div style={{ fontSize: 14 }}>
                  8.可充电储能装置温度数据(10项)
                </div>
              }
            />
            {(modal.neChargeTempBeanList || []).map((v, i) => (
              <Popover
                key={i}
                title={`储能装置${i + 1}`}
                content={
                  <Descriptions column={1} style={{ width: 420 }}>
                    <Item label="可充电储能子系统号">{v.storageSubSerial}</Item>
                    <Item label="可充电储能温度探针个数">
                      {v.storageTempProbeNum}
                    </Item>
                    <Item label="可充电储能子系统各温度探针检测到的温度值">
                      {(
                        v.storageTempAllProbeNums.reduce(
                          (acc, val) => acc + val,
                          0
                        ) / v.storageTempAllProbeNums.length
                      ).toFixed(2)}
                      ℃
                    </Item>
                  </Descriptions>
                }
                placement="bottomLeft"
              >
                <Button style={{ margin: 8 }}>{`储能装置${i + 1}`}</Button>
              </Popover>
            ))}
          </Col>
          <Col span={12}>
            <Descriptions
              title={
                <div style={{ fontSize: 14 }}>
                  9.可充电储能装置电压数据(10项)
                </div>
              }
              column={1}
            />
            {(modal.neChargeVoltageBeanList || []).map((v, i) => (
              <Popover
                key={i}
                title={`可充电储能子系统${i + 1}`}
                content={
                  <Descriptions column={1} style={{ width: 360 }}>
                    <Item label="可充电储能子系统号">{v.storageSubSysNo}</Item>
                    <Item label="可充电储能装置电压">{v.storageVoltage}</Item>
                    <Item label="可充电储能装置电流">{v.storageCurrent}</Item>
                    <Item label="本帧起始电池序号">{v.serailOfFrame}</Item>
                    <Item label="本帧单体电池总数">{v.cellNumOfFrame}</Item>
                    <Item label="单体电池电压">
                      {(
                        v.cellVoltage.reduce((acc, val) => acc + val, 0) /
                        v.cellVoltage.length
                      ).toFixed(2)}
                      V
                    </Item>
                    <Item label="单体电池总数">{v.cellTotal}</Item>
                  </Descriptions>
                }
                placement="bottomLeft"
              >
                <Button style={{ margin: 8 }}>{`储能装置${i + 1}`}</Button>
              </Popover>
            ))}
          </Col>
        </Row>
      </Card>
    </Modal>
  )
}
