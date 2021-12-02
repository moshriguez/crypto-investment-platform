import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css';

import WatchList from './components/WatchList'
import NavBar from './components/NavBar'
import Auth from './components/Auth'
import Home from './components/Home'
import { calcStartDate } from './utils'

// Types
import { Candle, Digest, HistoricalData, Pair, Timeframe, User } from './types'

const App = () => {
  const [allTradingPairs, setAllTradingPairs] = useState<Pair[]>([])
  const [selectedTradingPair, setSelectedTradingPair] = useState('')
  const [price, setPrice] = useState('')
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [user, setUser] = useState<User | null>(null)


  const ws = useRef<WebSocket | null>(null)
  const url = 'https://api.pro.coinbase.com'

  useEffect(() => {
    ws.current = new WebSocket('wss://ws-feed.exchange.coinbase.com')
    const fetchAllTradingPairs = async () => {
      const res = await fetch(url + '/products')
      const data: Pair[] = await res.json()
      const filteredAndSorted = data.filter(item => item.quote_currency === 'USD' && !item.trading_disabled)
        .sort((a, b) => {
          if (a.base_currency > b.base_currency) return 1
          if (a.base_currency < b.base_currency) return -1
          else return 0
        })
      setAllTradingPairs(filteredAndSorted)
    }
    fetchAllTradingPairs()

    return () => {if(ws.current) ws.current.close()}
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
  
  useEffect(() => {
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
      }
    }

    fetchHistoricalData()
  }, [selectedTradingPair])

  useEffect(() => {
    if(selectedTradingPair === '') return
    fetchHistoricalData()
  }, [timeframe])


  const handleTimeframeSelect = (e: React.MouseEvent<HTMLElement, MouseEvent>, newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <NavBar 
        selectedTradingPair={selectedTradingPair} 
        allTradingPairs={allTradingPairs} 
        setSelectedTradingPair={setSelectedTradingPair}
        user={user}
        setUser={setUser}
        />
        <Routes>
          <Route path='/' element={<Home price={price} timeframe={timeframe} historicalData={historicalData} handleTimeframeSelect={handleTimeframeSelect} />}/>
          <Route path='/auth' element={<Auth setUser={setUser}/>}/>
          <Route path='/watchlist' element={<WatchList list={user ? user.watchList : null} />}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
