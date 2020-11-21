let SERVER = 'http://172.16.11.15:8087/dfwl_admin'
let SERVERDFWL = 'http://172.16.11.15:5081/dfwl'
let SERVER_ML_MSG_WS = `ws://172.16.11.15:8087/dfwl_admin`
let SERVER_ML_WS = `ws://192.168.180.26:5081/dfwl/websocket`

if (process.env.NODE_ENV === 'production') {
  SERVER = '/dfwl_admin'
  SERVERDFWL = '/dfwl'
  SERVER_ML_MSG_WS = `ws://${location.host}/dfwl_admin`
  SERVER_ML_WS = `ws://${location.host}/dfwl/websocket`
}

export { SERVER, SERVER_ML_MSG_WS, SERVERDFWL, SERVER_ML_WS }
