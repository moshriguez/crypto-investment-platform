import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import MainGraph from './components/MainGraph';
import { calcStartDate } from './utils'

// Types
import { Candle, Digest, HistoricalData, Pair } from './types'

const App = () => {
  const [allTradingPairs, setAllTradingPairs] = useState<Pair[]>([])
  const [selectedTradingPair, setSelectedTradingPair] = useState('')
  const [price, setPrice] = useState('')
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeframe, setTimeframe] = useState('1D')

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
    // get historical data for chart
    const fetchHistoricalData = async () => {
      let gran = 3600
      let now = new Date()
      let startDate = calcStartDate(now, '7D')
      const res = await fetch(`${url}/products/${selectedTradingPair}/candles?granularity=${gran}&start=${startDate.toISOString()}&end=${now.toISOString()}`)
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
    fetchHistoricalData()
  }, [selectedTradingPair])

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTradingPair(e.target.value)
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
