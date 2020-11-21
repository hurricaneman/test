import uuid from 'uuid'
import React from 'react'

export default class jsonrpc {
  target
  pool = {}
  local = {}
  remote = new Proxy({}, { get: (o, k) => (...a) => this.call(k, a) })

  listen(options) {
    const { target } = options
    this.target = target
    const onReceive = e => this.onReceive(e)
    addEventListener('message', onReceive, false)
    return () => removeEventListener('message', onReceive)
  }

  send(options) {
    const message = {
      source: 'jsonrpc',
      payload: { jsonrpc: '2.0', ...options },
    }
    this.target.postMessage(message, '*')
  }

  call(method, params = []) {
    const id = uuid.v4()
    this.send({ id, method, params })
    return new Promise(r => (this.pool[id] = r))
  }

  notify(method, params = []) {
    this.send({ method, params })
  }

  useRemote(name, fn, deps = []) {
    React.useEffect(() => {
      this.local[name] = fn
      return () => delete this.local[name]
    }, deps)
  }

  onReceive(e) {
    if (!e || e.data.source !== 'jsonrpc') return
    const { id, method, result, params } = e.data.payload
    if (result) {
      this.pool[id](result)
      delete this.pool[id]
    }
    if (method) {
      const fn = this.local[method]
      if (!fn) return
      const res = fn(...params)
      if (id) Promise.resolve(res).then(result => this.send({ id, result }))
    }
  }
}
