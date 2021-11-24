import React, { useEffect, useState } from 'react';
import './App.css';

// Types
import { Pair } from './types'

const App = () => {
  const [allTradingPairs, setAllTradingPairs] = useState<Pair[]>([])
  const [selectedTradingPair, setSelectedTradingPair] = useState('')

  const url = 'https://api.pro.coinbase.com'

  useEffect(() => {
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
  }, [])

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
    </div>
  );
}

export default App;
