import React, {useEffect, useLayoutEffect, useState, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import { Chip, Container, IconButton, Stack, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { red } from '@mui/material/colors';
import decode, { JwtPayload } from "jwt-decode";

import MainGraph from './MainGraph';
import { calcPercentChange, currencyFormatter, fetchCryptoName, fetchHistoricalData } from '../utils'
// Types
import { Digest, HistoricalData, Timeframe, User } from '../types'

interface CurrencyProps {
  logout: () => void
  user: User | null
  setUser: (arg: User | null) => void
  selectedTradingPair: string
  ws: React.MutableRefObject<WebSocket | null>
  wsUnsub: () => void
}

const Currency: React.FC<CurrencyProps> = ({ logout, selectedTradingPair, user, setUser, ws, wsUnsub }) => {
	const [graphWidth, setGraphWidth] = useState(0)
  const [cryptoName, setCryptoName] = useState('')
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [price, setPrice] = useState('')
  const [percentChange, setPercentChange] = useState('')

  const navigate = useNavigate();
	const ref = useRef<HTMLDivElement>(null)
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    // this runs everytime selectedTradingPair changes
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
        setPercentChange(calcPercentChange(res.open_24h, res.price))
      }
    }    
    return () => {wsUnsub()}
  }, [selectedTradingPair, ws, wsUnsub])

	useLayoutEffect(() => {
		if (ref.current) {
			setGraphWidth(ref.current.clientWidth)
		}
	}, [selectedTradingPair])
  
  useEffect(() => {
    if(selectedTradingPair === '') return
    fetchCryptoName(selectedTradingPair, setCryptoName)
    fetchHistoricalData(selectedTradingPair, timeframe, setHistoricalData)
  }, [timeframe, selectedTradingPair])

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

  const handleTimeframeSelect = (e: React.MouseEvent<HTMLElement, MouseEvent>, newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe)
  }

  return (
    <Container 
			maxWidth='md' 
			ref={ref} 
			sx={{ 
				display: 'flex', 
				flexDirection: 'column', 
				alignItems: 'flex-end',
				width: {xs: 7/8, md: 3/4},
				pt: 2
			}}>
			<Stack direction='row' spacing={1}>
				{user && (
					<IconButton
						aria-label="Remove from Watch List"
						onClick={toggleWatchList}
					>
						{user.watchList.includes(selectedTradingPair) ? (
							<FavoriteIcon sx={{ color: red[500] }} />
						) : (
							<FavoriteBorderOutlinedIcon />
						)}
					</IconButton>
				)}
				<Typography variant="h4">{cryptoName}</Typography>
			</Stack>

      <Typography variant="subtitle1">
        {currencyFormatter(parseFloat(price))}
      </Typography>
      <Chip
        label={percentChange}
        variant="outlined"
        color={percentChange[0] === "-" ? "error" : "success"}
        size="small"
      />

      <ToggleButtonGroup
        value={timeframe}
        exclusive
        onChange={handleTimeframeSelect}
        aria-label="timeframe"
      >
        <ToggleButton value="1D" aria-label="1 day">1D</ToggleButton>
        <ToggleButton value="7D" aria-label="7 days">7D</ToggleButton>
        <ToggleButton value="1M" aria-label="1 month">1M</ToggleButton>
        <ToggleButton value="3M" aria-label="3 months">3M</ToggleButton>
        {/* <ToggleButton value='1Y' aria-label='1 year'>1Y</ToggleButton> */}
      </ToggleButtonGroup>
      {selectedTradingPair && (
        <MainGraph
          data={historicalData}
          height={graphWidth * (1/2)}
          width={graphWidth}
          margin={{
            top: 16,
            right: 16,
            bottom: 40,
            left: 48,
          }}
          timeframe={timeframe}
        />
      )}
    </Container>
  );
}

export default Currency
