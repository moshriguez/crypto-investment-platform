import React from 'react'
import { ToggleButtonGroup, ToggleButton } from '@mui/material'

import MainGraph from './MainGraph';
// Types
import { HistoricalData, Timeframe } from '../types'


interface HomeProps {
    price: string
    timeframe: Timeframe
    historicalData: HistoricalData[]
    handleTimeframeSelect: (e: React.MouseEvent<HTMLElement, MouseEvent>, newTimeframe: Timeframe) => void
}
const Home: React.FC<HomeProps> = ({ handleTimeframeSelect, historicalData, price, timeframe }) => {
    return (
        <>
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
  
        </>
    )
}

export default Home
