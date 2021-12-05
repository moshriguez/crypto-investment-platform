import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.css';

import Currency from './components/Currency'
import WatchList from './components/WatchList'
import NavBar from './components/NavBar'
import Auth from './components/Auth'
import Home from './components/Home'

// Types
import { Pair, User } from './types'

const App = () => {
  const navigate = useNavigate()
  const [selectedTradingPair, setSelectedTradingPair] = useState('')
  const [user, setUser] = useState<User | null>(null)

  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new WebSocket('wss://ws-feed.exchange.coinbase.com')
    return () => {if(ws.current) ws.current.close()}
  }, [])

  const wsUnsub = () => {
    const unsubscribe = {
      type: 'unsubscribe',
      product_ids: [selectedTradingPair],
      channels: ['ticker']
    }
    if(ws.current) ws.current.send(JSON.stringify(unsubscribe))
  }
  
  const handleTradingPairSelect = (e: any, newValue: Pair | null) => {
    wsUnsub()
    if(newValue) setSelectedTradingPair(newValue.id)
    navigate('currency')
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
          <Route path='/currency' element={
            <Currency 
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
