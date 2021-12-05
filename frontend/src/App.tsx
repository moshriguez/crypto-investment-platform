import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.css';

import Currency from './components/Currency'
import WatchList from './components/WatchList'
import NavBar from './components/NavBar'
import Auth from './components/Auth'
import Home from './components/Home'
import { calcPercentChange } from './utils'
// Types
import { Digest, Pair, User } from './types'

const App = () => {
  const navigate = useNavigate()
  const [selectedTradingPair, setSelectedTradingPair] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [price, setPrice] = useState('')
  const [percentChange, setPercentChange] = useState('')

  useEffect(() => {
    connect()
    return () => {if(ws) ws.close()}
  }, [])

  const connect = () => {
    const webSock = new WebSocket('wss://ws-feed.exchange.coinbase.com')
    let connectInterval: NodeJS.Timeout
    let timeout = 250


    webSock.onopen = () => {
      console.log('connected')
      setWs(webSock)
      clearTimeout(connectInterval)
    }

    webSock.onmessage = (e) => {
      const message: Digest = JSON.parse(e.data)
      setPrice(message.price)
      setPercentChange(calcPercentChange(message.open_24h, message.price))
      console.log(message)
    }

    webSock.onclose = e => {
      console.log(`Web Socket is closed. Reconnect will be attempted in ${Math.min(10000 / 1000, timeout / 1000)} seconds.`, e.reason)
      timeout = timeout + timeout
      connectInterval = setTimeout(check, Math.min(10000, timeout))
    }

    webSock.onerror = err => {
      console.log('Web Socket encountered error: ', err, 'Closing socket')
      webSock.close()
    }
  }

  const check = () => {
    if (!ws || ws.readyState === WebSocket.CLOSED) connect()
  }

  const wsUnsub = () => {
    const unsubscribe = {
      type: 'unsubscribe',
      product_ids: [selectedTradingPair],
      channels: ['ticker']
    }
    if(ws) ws.send(JSON.stringify(unsubscribe))
  }
  
  const handleTradingPairSelect = (e: any, newValue: Pair | null) => {
    // wsUnsub()
    if(newValue) {
      setSelectedTradingPair(newValue.id)
      navigate(`/currency/${newValue.id}`)
    }
  }

  const logout = (path: '/' | '/auth') => {
    localStorage.clear();
    setUser(null);
    navigate(path)
  };

  return (
      <div className="App">
        <NavBar 
        selectedTradingPair={selectedTradingPair} 
        handleTradingPairSelect={handleTradingPairSelect}
        logout={logout}
        user={user}
        setUser={setUser}
        />
        <Routes>
          <Route path='/' element={<Home handleTradingPairSelect={handleTradingPairSelect} />} />
          <Route path='/currency/:pair' element={
            <Currency 
              price={price}
              percentChange={percentChange}
              logout={logout}
              user={user}
              setUser={setUser}
              selectedTradingPair={selectedTradingPair}
              ws={ws}
              wsUnsub={wsUnsub}
              />}/>
          <Route path='/auth' element={<Auth setUser={setUser}/>}/>
          <Route path='/watchlist' element={
            <WatchList 
              list={user ? user.watchList : null} 
              logout={logout}
              setUser={setUser}
            />}/>
        </Routes>
      </div>
  );
}

export default App;
