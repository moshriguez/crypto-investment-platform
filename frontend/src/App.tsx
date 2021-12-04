import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.css';

import Currency from './components/Currency'
import WatchList from './components/WatchList'
import NavBar from './components/NavBar'
import Auth from './components/Auth'
import Home from './components/Home'
import { calcPercentChange, calcStartDate } from './utils'

// Types
import { Candle, Digest, HistoricalData, Pair, Timeframe, User } from './types'

const App = () => {
  const navigate = useNavigate()
  const [selectedTradingPair, setSelectedTradingPair] = useState('')
  const [price, setPrice] = useState('')
  const [cryptoName, setCryptoName] = useState('')
  const [percentChange, setPercentChange] = useState('')
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [user, setUser] = useState<User | null>(null)


  const ws = useRef<WebSocket | null>(null)
  const url = 'https://api.pro.coinbase.com'

  useEffect(() => {
    ws.current = new WebSocket('wss://ws-feed.exchange.coinbase.com')
  }, [])

  // get historical data for chart
  const fetchHistoricalData = async () => {
    let granularity = {
      '1D': 300,
      '7D': 3600,
      '1M': 21600,
      '3M': 86400,
      '1Y': 86400
    }
    let now = new Date()
    let startDate = calcStartDate(now, timeframe)
    const res = await fetch(`${url}/products/${selectedTradingPair}/candles?granularity=${granularity[timeframe]}&start=${startDate.toISOString()}&end=${now.toISOString()}`)
    // Candle schema: [timestamp, price_low, price_high, price_open, price_close]
    // Candle array arranged from end to start
    const data: Candle[] = await res.json()
    // console.log(data)
    const formattedData: HistoricalData[] = data.map(c => {
      return {
        date: new Date(c[0] * 1000),
        price: c[4]
      }
    })
    setHistoricalData(formattedData)
  }

  const fetchCryptoName = async () => {
    const currCode = selectedTradingPair.split('-')[0]
    const res = await fetch(`${url}/currencies/${currCode}`)
    const data = await res.json()
    setCryptoName(data.name)
  }
  
  useEffect(() => {
    // this runs everytime selectedTradingPair changes
    if(selectedTradingPair === '') return
    // subscribe to Coinbase via web socket
    const subscribe = {
      type: 'subscribe',
      product_ids: [selectedTradingPair],
      channels: ['ticker']
    }
    if (ws.current) {
      ws.current.send(JSON.stringify(subscribe))
      ws.current.onmessage = (e) => {
        const res: Digest = JSON.parse(e.data)
        setPrice(res.price)
        setPercentChange(calcPercentChange(res.open_24h, res.price))
      }
    }

    fetchHistoricalData()
    fetchCryptoName()
    
  }, [selectedTradingPair])

  useEffect(() => {
    if(selectedTradingPair === '') return
    fetchHistoricalData()
  }, [timeframe])


  const handleTimeframeSelect = (e: React.MouseEvent<HTMLElement, MouseEvent>, newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe)
  }

  const handleTradingPairSelect = (e: any, newValue: Pair | null) => {
    const unsubscribe = {
      type: 'unsubscribe',
      product_ids: [selectedTradingPair],
      channels: ['ticker']
    }
    if(ws.current) ws.current.send(JSON.stringify(unsubscribe))
    if(newValue) setSelectedTradingPair(newValue.id)
    navigate('currency')
  }

  const logout = () => {
    localStorage.clear();
    setUser(null);
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
              price={price} 
              cryptoName={cryptoName}
              percentChange={percentChange}
              timeframe={timeframe} 
              historicalData={historicalData} 
              handleTimeframeSelect={handleTimeframeSelect} 
              logout={logout}
              user={user}
              setUser={setUser}
              selectedTradingPair={selectedTradingPair}
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
