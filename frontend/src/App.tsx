import React, { useEffect, useState } from 'react';
import './App.css';

// Types
import { Pair } from './types'

const App = () => {
  const [allTradingPairs, setAllTradingPairs] = useState<Pair[]>([])
  const [selectedCrypto, setSelectedCrypto] = useState<Pair | string>('')

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
      console.log(filteredAndSorted)

    }
    fetchAllTradingPairs()
  }, [])

  return (
    <div className="App">
    </div>
  );
}

export default App;
