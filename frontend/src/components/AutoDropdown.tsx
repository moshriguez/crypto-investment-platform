import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import { Autocomplete, TextField } from '@mui/material'
// Types
import { Pair } from "../types";

const url = 'https://api.pro.coinbase.com'

interface AutoDropdownProps {
    handleTradingPairSelect: (e: any, newValue: Pair | null) => void;
}

const AutoDropdown: React.FC<AutoDropdownProps> = ({ handleTradingPairSelect }) => {
    const [allTradingPairs, setAllTradingPairs] = useState<Pair[]>([])

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
    
    
    return (
        <Autocomplete
            disablePortal
            options={allTradingPairs}
            getOptionLabel={(option) => option.display_name}
            onChange={(e: any, newValue: Pair | null) => {
            handleTradingPairSelect(e, newValue);
            }}
            id="cryptocurrency-options"
            autoHighlight
            disableClearable
            sx={{ width: 300 }}
            renderInput={(params) => (
            <TextField {...params} label="Cryptocurrency" />
            )}
        />
    )
}

export default AutoDropdown
