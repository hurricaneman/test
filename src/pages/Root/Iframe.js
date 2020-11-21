import React from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { mem, session, rpc, history } from 'utils'

export default function Iframe() {
  const { url } = useParams()
  const ref = React.useRef()
  const location = useLocation()

  React.useEffect(() => {
    const unListen = rpc.listen({
      target: ref.current.contentWindow,
    })
    rpc.local.init = () => ({
      menu: mem['@/System/Menu/List'],
      url: decodeURIComponent(location.pathname.split('/').pop()),
      auth: session.Authorization,
      css: session['@/System/CssUrl'],
      userData: session.userData,
      origin: window.location.origin,
    })
    rpc.local.toLogin = () => history.push('/login')
    rpc.local.getUrl = () =>
      decodeURIComponent(window.location.hash.split('/').pop())
    return unListen
  }, [])

  return (
    <iframe
      ref={ref}
      style={{
        display: 'block',
        border: 0,
        width: '100%',
        height: 'calc(100vh - 64px)',
        backgroundColor: '#f0f2f5',
      }}
      allowFullScreen
      allowtransparency="true"
      src={decodeURIComponent(url) + location.search}
    ></iframe>
  )
}
