import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { ToggleButtonGroup, ToggleButton } from '@mui/material'

import MainGraph from './components/MainGraph';
import { calcStartDate } from './utils'

// Types
import { Candle, Digest, HistoricalData, Pair, Timeframe } from './types'

const App = () => {
  const [allTradingPairs, setAllTradingPairs] = useState<Pair[]>([])
  const [selectedTradingPair, setSelectedTradingPair] = useState('')
  const [price, setPrice] = useState('')
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')

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
  }, [fetchHistoricalData, selectedTradingPair])

  useEffect(() => {
    if(selectedTradingPair === '') return
    fetchHistoricalData()
  }, [fetchHistoricalData, timeframe])


  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTradingPair(e.target.value)
  }

  const handleTimeframeSelect = (e: React.MouseEvent<HTMLElement, MouseEvent>, newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe)
  }

  const renderOptions = () => {
    return allTradingPairs.map((pair, i) => {
      return (
        <option key={i} value={pair.id}>{pair.display_name}</option>
      )
    })
  }

  return (
    <div className="App">
      <select name="trading-pair" value={selectedTradingPair} onChange={handleSelect}>
        {renderOptions()}
      </select>
      <ToggleButtonGroup
        value={timeframe}
        exclusive
        onChange={handleTimeframeSelect}
        aria-label='timeframe'
      >
        <ToggleButton value='1D' aria-label='1 day'>1D</ToggleButton>
        <ToggleButton value='7D' aria-label='7 days'>7D</ToggleButton>
        <ToggleButton value='1M' aria-label='1 month'>1M</ToggleButton>
        <ToggleButton value='3M' aria-label='3 months'>3M</ToggleButton>
        {/* <ToggleButton value='1Y' aria-label='1 year'>1Y</ToggleButton> */}
      </ToggleButtonGroup>
      <p>{price}</p>
      <MainGraph 
        data={historicalData}
        height={500}
        width={750}
        margin={{
          top: 16,
          right: 16,
          bottom: 40,
          left: 48
        }}
      />
    </div>
  );
}

export default App;
