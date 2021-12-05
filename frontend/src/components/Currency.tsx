import React, {useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Chip, Container, IconButton, Stack, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { red } from '@mui/material/colors';

import ConfirmDialog from './ConfirmDialog';
import MainGraph from './MainGraph';
import { checkToken, currencyFormatter, fetchCryptoName, fetchHistoricalData, updateWatchList } from '../utils'
// Types
import { HistoricalData, Timeframe, User } from '../types'

interface CurrencyProps {
  price: string
  percentChange: string
  logout: (path: '/' | '/auth') => void
  user: User | null
  setUser: (arg: User | null) => void
  selectedTradingPair: string
  ws: WebSocket | null
  wsUnsub: () => void
}


const Currency: React.FC<CurrencyProps> = ({ price, percentChange, logout, selectedTradingPair, user, setUser, ws, wsUnsub }) => {
	const [graphWidth, setGraphWidth] = useState(0)
  const [cryptoName, setCryptoName] = useState('')
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [confirmOpen, setConfirmOpen] = useState(false)

	const ref = useRef<HTMLDivElement>(null)
  const token = localStorage.getItem("jwt");
  let { pair } = useParams()
  const abbv = pair ? pair.split('-')[0] : ''
  const pairInWatchList: boolean = useMemo(() => {
    if(user && pair) {
      return user.watchList.includes(pair)
    } else {
      return false
    }}, [user, pair])

  const handleOpenConfirm = () => {
    setConfirmOpen(true)
  }

  const handleCloseConfirm = () => {
    setConfirmOpen(false)
  }

  const confirmRemove = () => {
    if (user && pair !== undefined && token) {
      let updatedList = user.watchList.filter(el => el !== pair)
      updateWatchList(user._id, token, updatedList, setUser)
    }
    handleCloseConfirm()
  }

  useEffect(() => {
    // this runs everytime selectedTradingPair changes
    if(pair === undefined) return
    // subscribe to Coinbase via web socket
    const subscribe = {
      type: 'subscribe',
      product_ids: [pair],
      channels: ['ticker']
    }
    if (ws) {
      ws.send(JSON.stringify(subscribe))
    }

    return () => wsUnsub()
  }, [pair, ws])

	useLayoutEffect(() => {
		if (ref.current) {
			setGraphWidth(ref.current.clientWidth)
		}
	}, [pair])
  
  useEffect(() => {
    if(pair === undefined) return
    fetchCryptoName(pair, setCryptoName)
    fetchHistoricalData(pair, setHistoricalData, timeframe)
  }, [timeframe, pair])

  const toggleWatchList = async () => {
    if (token && pair) {
      let decodedToken = checkToken(token)

      if (decodedToken) {
        if (user) {
          // check if crypto is in watch list and add it or remove it
          if (pairInWatchList) {
            handleOpenConfirm()
          } else {
            let updatedList = [...user.watchList, pair]
            updateWatchList(user._id, token, updatedList, setUser)
          }
        }
      } else {
        console.log("expired token");
        logout('/auth');
      }
    }
  }

  const handleTimeframeSelect = (e: React.MouseEvent<HTMLElement, MouseEvent>, newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe)
  }

  return (
    <>
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
				{user && pair && (
					<IconButton
						aria-label="Remove from Watch List"
						onClick={toggleWatchList}
					>
						{pairInWatchList ? (
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
    </Container>
    <ConfirmDialog 
      open={confirmOpen}
      handleCloseConfirm={handleCloseConfirm}
      dialogText={`Are you sure you want to quit following ${cryptoName}?`}
      confirmCallback={confirmRemove}
    />
    </>
  );
}

export default Currency
