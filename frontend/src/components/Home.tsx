import React from 'react'
import { Box } from '@mui/material'

import AutoDropdown from './AutoDropdown'
// Types
import { Pair } from "../types";



interface HomeProps {
  handleTradingPairSelect: (e: any, newValue: Pair | null) => void;

}

const Home: React.FC<HomeProps> = ({ handleTradingPairSelect }) => {


  return (
      <Box sx={{display: 'flex', justifyContent: 'center'}}>
        <AutoDropdown handleTradingPairSelect={handleTradingPairSelect}/>
      </Box>
  )
}

export default Home
