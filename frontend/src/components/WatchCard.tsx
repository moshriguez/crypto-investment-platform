import React, {useEffect, useRef, useState} from 'react'
import { Avatar, Box, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogContentText, Grid, IconButton, Typography } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { red } from '@mui/material/colors'

import MainGraph from './MainGraph';
import { calcPercentChange, calcStartDate, currencyFormatter, fetchCryptoName } from '../utils'
// Types
import { Candle, HistoricalData } from '../types'


interface WatchCardProps {
    pair: string
    removeFromWatchList: (arg: string) => void
}
const WatchCard: React.FC<WatchCardProps> = ({ pair, removeFromWatchList }) => {
    const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
    const [cryptoName, setCryptoName] = useState('')
    const [percentChange, setPercentChange] = useState('')
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [cardWidth, setCardWidth] = useState(0)
    const ref = useRef<HTMLDivElement>(null)

    const abbv = pair.split('-')[0]
    const url = 'https://api.pro.coinbase.com'

    const handleOpenConfirm = () => {
        setConfirmOpen(true)
    }

    const handleCloseConfirm = () => {
        setConfirmOpen(false)
    }

    const confirmRemove = () => {
        removeFromWatchList(pair)
        handleCloseConfirm()
    }

    useEffect(() => {
          // get historical data for chart
        const fetchHistoricalData = async () => {
            let now = new Date()
            let startDate = calcStartDate(now, '1D')
            const res = await fetch(`${url}/products/${pair}/candles?granularity=300&start=${startDate.toISOString()}&end=${now.toISOString()}`)
            // Candle schema: [timestamp, price_low, price_high, price_open, price_close]
            // Candle array arranged from end to start
            const data: Candle[] = await res.json()
            setPercentChange(calcPercentChange(data[data.length - 1][3] , data[0][4]))
            // console.log(data)
            const formattedData: HistoricalData[] = data.map(c => {
                return {
                    date: new Date(c[0] * 1000),
                    price: c[4]
                }
            })
            setHistoricalData(formattedData)
        }
        
        fetchHistoricalData()
        fetchCryptoName(pair, setCryptoName)
        // get card Width to pass to graph
        if(ref.current) {
            setCardWidth(ref.current.clientWidth)
        }
    }, [pair])

    const avatarFontSize = (length: number) => {
        switch (length) {
            case 3:
                return 18
            case 4:
                return 14
            case 5:
                return 12
            default:
                return 18;
        }
    }

    return (
        <>
        <Grid item xs={12} sm={6} md={4} ref={ref}>
            <Card>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: red[500], fontSize: avatarFontSize(abbv.length)}}>{
                            abbv
                        }</Avatar>
                    }
                    action={
                        <IconButton aria-label='Remove from Watch List' onClick={handleOpenConfirm}>
                            <FavoriteIcon sx={{ color: red[500]}} />
                        </IconButton>
                    }
                    title={cryptoName}
                    titleTypographyProps={{variant: 'h6'}}
                    subheader={
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                            <Typography>{currencyFormatter(historicalData[0]?.price)}</Typography>
                            <Chip 
                                label={percentChange} 
                                variant='outlined' 
                                color={percentChange[0] === '-' ? 'error' : 'success'} 
                                size='small'
                            />
                        </Box>
                    }
                />
                <CardContent>
                    <MainGraph 
                        data={historicalData}
                        height={Math.floor(cardWidth * 0.85 * (2/3))}
                        width={Math.floor(cardWidth * 0.85)}
                        margin={{
                        top: 16,
                        right: 4,
                        bottom: 16,
                        left: 4
                        }}
                        hideAxis
                        border
                        withoutTooltip
                    />
                </CardContent>
            </Card>
        </Grid>
        <Dialog open={confirmOpen} onClose={handleCloseConfirm} aria-describedby="alert-dialog-description">
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{`Are you sure you want to quit following ${abbv}?`}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={confirmRemove} >Yes</Button>
                <Button onClick={handleCloseConfirm} >Cancel</Button>
            </DialogActions>
        </Dialog>
        </>
    )
}

export default WatchCard
