import moment from 'moment'
export default {
  vehicleCompany: {
    title: '企业名称',
    width: 200,
    required: true,
  },
  vehicleType: { title: '车型名称', required: true },
  vin: { title: 'VIN', width: 200, required: true },
  collectTime: {
    title: '采集时间',
    required: true,
    width: 200,
    render: t => moment(t).format('YYYY-MM-DD HH:mm:ss'),
  },
  receiveTime: {
    title: '接收时间',
    required: true,
    width: 200,
    render: t => moment(t).format('YYYY-MM-DD HH:mm:ss'),
  },
  // 整车数据
  vehicleStatus: '车辆状态',
  chargingStatus: '充电状态',
  locationStatus: '经纬度状态',
  runMode: '运行模式',
  speed: '车速',
  accumulativeMile: '累计里程',
  totalVoltage: '总电压',
  totalElectricity: '总电流',
  soc: 'SOC',
  dcStatus: 'DC-DC状态',
  gears: '档位状态位信息',
  insulationResistance: '绝缘电阻',

  // 驱动电机数据
  nEDriverMotorBeans: {
    title: '驱动电机个数',
    render: t => t?.length || 0,
  },
  // 极值数据
  highVBatterySubNum: '最高电压电池子系统号',
  highVBatteryCellCode: '最高电压电池单体代号',
  maximumBatteryVoltage: '电池单体电压最高值',
  lowVBatterySubNum: '最低电压电池子系统号',
  lowVBatteryCellCode: '最低电压电池单体代号',
  minimumBatteryVoltage: '电池单体电压最低值',
  highTemperatureSubNum: '最高温度子系统号',
  highTemperatureProbeSerial: '最高温度探针序号',
  maxTemperatureValue: '最高温度值',
  lowTemperatureSubNum: '最低温度子系统号',
  lowTemperatureProbeSerial: '最低温度探针序号',
  minTemperatureValue: '最低温度值',

  // 报警数据
  maxAlarmRatingName: '最高报警等级名称',
  alarmIdentification: '通用报警标志',
  rechargeableStorageDeviceN1: '可充电储能装置故障总数N1',
  driverMotorFailureN2: '驱动电机故障总数N2',
  driverMotorFailureCodeList: {
    title: '驱动电机故障代码列表',
    render: t => t?.join(','),
  },
  engineFailureN3: '发动机故障总数N3',
  otherFailureN4: '其他故障总数N4',
  otherFailureCodeList: {
    title: '其他故障代码列表',
    render: t => t?.join(','),
  },

  // 车辆位置数据
  locationCode: '定位状态Code',
  longitude: '经度',
  latitude: '纬度',

  // 发动机数据
  engineState: '发动机状态',
  speedOfCrankshaft: '曲轴转速',
  specificFuelConsumption: '燃料消耗率',

  // 燃料电池数据
  fuelCellVoltage: '燃料电池电压',
  fuelCellCurrent: '燃料电池电流',
  rateOfFuelConsumption: '燃料消耗率',
  fuelCellProbeNumber: '燃料电池温度探针总数',
  probeTemperatures: '探针温度值',
  maxTemperatureInHydrogenSystem: '氢系统中最高温度',
  maxTemperatureProbeSerial: '氢系统中最高温度探针代号',
  maxHydrogenConcentration: '氢气最高浓度',
  maxHydrogenConcentrationProbeSerial: '氢气最高浓度传感器代号',
  maxPressureHydrogen: '氢气最高压力',
  maxPressureHydrogenProbeSerial: '氢气最高压力传感器代号',
  highPressDCState: '高压DCDC状态',

  neChargeTempBeanList: {
    title: '可充电储能子系统个数',
    render: t => t?.length || 0,
  },
}
