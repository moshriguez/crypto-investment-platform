import React, { useEffect, useRef, useState } from 'react';
import './App.css';

// Types
import { Digest, Pair } from './types'

const App = () => {
  const [allTradingPairs, setAllTradingPairs] = useState<Pair[]>([])
  const [selectedTradingPair, setSelectedTradingPair] = useState('')
  const [price, setPrice] = useState('')

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
        console.log(res)
      }
    }
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
    </div>
  );
}

export default App;
