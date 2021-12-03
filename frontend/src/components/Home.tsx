import React from 'react'
import { useNavigate } from "react-router-dom";
import { IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { red } from '@mui/material/colors';
import decode, { JwtPayload } from "jwt-decode";



import MainGraph from './MainGraph';
// Types
import { HistoricalData, Timeframe, User } from '../types'


interface HomeProps {
  price: string
  timeframe: Timeframe
  historicalData: HistoricalData[]
  handleTimeframeSelect: (e: React.MouseEvent<HTMLElement, MouseEvent>, newTimeframe: Timeframe) => void
  logout: () => void
  user: User | null
  setUser: (arg: User | null) => void
  selectedTradingPair: string
}

const Home: React.FC<HomeProps> = ({ handleTimeframeSelect, historicalData, logout, price, selectedTradingPair, timeframe, user, setUser }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwt");

  const toggleWatchList = async () => {
    if (token) {
      const decodedToken: JwtPayload = decode(token);

      if (decodedToken.exp !== undefined) {
        if (decodedToken.exp * 1000 < new Date().getTime()) {
          console.log("expired token");
          logout();
          navigate('/auth')
        } else {
          if (user) {
            let updatedList
            // check if crypto is in watch list and add it or remove it
            if (user.watchList.includes(selectedTradingPair)) {
              updatedList = user.watchList.filter(el => el !== selectedTradingPair)
            } else {
              updatedList = [...user.watchList, selectedTradingPair]
            }
            const body = {
              watchList: updatedList
            }
            const configObj = {
              method: 'PATCH',
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(body)
            }
            const res = await fetch("http://localhost:5000/users/" + user._id, configObj)
            const data = await res.json()
            setUser(data.user)
          }
        }
      }
    }
  }

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
      {user && (
        <IconButton aria-label='Remove from Watch List' onClick={toggleWatchList}>
          {user.watchList.includes(selectedTradingPair) ? 
          <FavoriteIcon sx={{ color: red[500]}}/> : <FavoriteBorderOutlinedIcon />}
        </IconButton>
      )}

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
