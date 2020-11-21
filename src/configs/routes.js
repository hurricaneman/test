/* eslint-disable react/display-name */
import React from 'react'
import Login from 'pages/Login'
import Root from 'pages/Root'
import Menu from 'pages/System/Menu'
import { Redirect } from 'react-router-dom'
import Role from 'pages/System/Role'
import Organization from 'pages/System/Organization'
import User from 'pages/System/User'
import Region from 'pages/System/Region'
import LoginSetting from 'pages/System/LoginSetting'
import Setting from 'pages/System/Setting'
import Dictionary from 'pages/System/Dictionary'
import Info from 'pages/Profile/Info'
import Password from 'pages/Profile/Password'
import Iframe from 'pages/Root/Iframe'
import Theme from 'pages/Profile/Theme'
import Loginlog from 'pages/Log/LoginLog'
import OperationLog from 'pages/Log/OperationLog'
import ErrorLog from 'pages/Log/ErrorLog'
import ForgetPassword from 'pages/ForgetPassword'
import Message from 'pages/Message'
import AppVersion from 'pages/AppVersion'
import CarMonitor from 'pages/CarMonitor'
import HistoryData from 'pages/HistoryData'
import Investor from 'pages/BasicInformation/Investor'
import Supervision from 'pages/BasicInformation/Supervision'
import Dealer from 'pages/BasicInformation/Dealer'
import DealerPersonnel from 'pages/BasicInformation/DealerPersonnel'
import Supervisor from 'pages/BasicInformation/Supervisor'
import InvestorPersonnel from 'pages/BasicInformation/InvestorPersonnel'
import SupervisionRatio from 'pages/BasicInformation/SupervisionRatio'
import MoveApplication from 'pages/Application/MoveApplication'
import MoveApproval from 'pages/Approval/MoveApproval'
import CarNventory from 'pages/CarLicenseNventory/CarNventory'
import Departure from 'pages/Departure'
import DepartureLog from 'pages/DepartureLog'
import SIM from 'pages/BasicInformation/SIM'
import Terminal from 'pages/BasicInformation/Terminal'
import DailyCheckAbnormal from 'pages/RiskManagement/DailyCheckAbnormal'
import Inventory from 'pages/RiskManagement/Inventory'
import RegulatoryLog from 'pages/RiskManagement/RegulatoryLog'
import VehicleHistory from 'pages/RiskManagement/VehicleHistory'

export default [
  {
    path: '/',
    exact: true,
    component: () => <Redirect to="/login"></Redirect>,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/forgetPassword',
    component: ForgetPassword,
  },
  {
    component: Root,
    routes: [
      {
        path: '/iframe/:url',
        component: Iframe,
      },
      {
        path: '/log/loginLog',
        component: Loginlog,
      },
      {
        path: '/log/OperationLog',
        component: OperationLog,
      },
      {
        path: '/log/ErrorLog',
        component: ErrorLog,
      },
      {
        path: '/system/menu',
        component: Menu,
      },
      {
        path: '/system/organization',
        component: Organization,
      },
      {
        path: '/system/role',
        component: Role,
      },
      {
        path: '/system/user',
        component: User,
      },
      {
        path: '/system/region',
        component: Region,
      },
      {
        path: '/system/loginSetting',
        component: LoginSetting,
      },
      {
        path: '/system/dictionary',
        component: Dictionary,
      },
      {
        path: '/profile/info',
        component: Info,
      },
      {
        path: '/profile/password',
        component: Password,
      },
      {
        path: '/profile/theme',
        component: Theme,
      },
      {
        path: '/message',
        component: Message,
      },
      {
        path: '/basicInformation/investor',
        component: Investor,
      },
      {
        path: '/basicInformation/supervision',
        component: Supervision,
      },
      {
        path: '/basicInformation/dealer',
        component: Dealer,
      },
      {
        path: '/basicInformation/dealerPersonnel',
        component: DealerPersonnel,
      },
      {
        path: '/basicInformation/supervisor',
        component: Supervisor,
      },
      {
        path: '/basicInformation/investorPersonnel',
        component: InvestorPersonnel,
      },
      {
        path: '/basicInformation/supervisionRatio',
        component: SupervisionRatio,
      },

      {
        path: '/basicInformation/sim',
        component: SIM,
      },
      {
        path: '/basicInformation/terminal',
        component: Terminal,
      },
      {
        path: '/application/moveapplication',
        component: MoveApplication,
      },
      {
        path: '/approval/moveapproval',
        component: MoveApproval,
      },
      {
        path: '/carlicensenventory/carnventory',
        component: CarNventory,
      },
      {
        path: '/appVersion',
        component: AppVersion,
      },
      {
        path: '/carMonitor',
        component: CarMonitor,
      },
      {
        path: '/historyData',
        component: HistoryData,
      },
      {
        path: '/departure',
        component: Departure,
      },
      {
        path: '/departureLog',
        component: DepartureLog,
      },
      {
        path: '/system/Setting',
        component: Setting,
      },
      {
        path: '/riskmanagement/dailyCheckAbnormal',
        component: DailyCheckAbnormal,
      },
      {
        path: '/riskmanagement/inventory',
        component: Inventory,
      },
      {
        path: '/riskmanagement/regulatoryLog',
        component: RegulatoryLog,
      },
      {
        path: '/riskmanagement/vehicleHistory',
        component: VehicleHistory,
      },
    ],
  },
]
