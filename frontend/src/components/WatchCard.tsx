import React, {useEffect, useRef, useState} from 'react'
import { Avatar, Card, CardContent, CardHeader, Grid, IconButton } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { red } from '@mui/material/colors'

import MainGraph from './MainGraph';
import { calcStartDate } from '../utils'
// Types
import { Candle, HistoricalData } from '../types'


interface WatchCardProps {
    pair: string
}
const WatchCard: React.FC<WatchCardProps> = ({ pair }) => {
    const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
    const [cardWidth, setCardWidth] = useState(0)
    console.log(cardWidth)
    const ref = useRef<HTMLDivElement>(null)

    const abbv = pair.split('-')[0]
    const url = 'https://api.pro.coinbase.com'

    useEffect(() => {
          // get historical data for chart
        const fetchHistoricalData = async () => {
            let now = new Date()
            let startDate = calcStartDate(now, '1D')
            const res = await fetch(`${url}/products/${pair}/candles?granularity=300&start=${startDate.toISOString()}&end=${now.toISOString()}`)
            // Candle schema: [timestamp, price_low, price_high, price_open, price_close]
            // Candle array arranged from end to start
            const data: Candle[] = await res.json()
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
        // get card Width to pass to graph
        if(ref.current) {
            setCardWidth(ref.current.clientWidth)
        }
    }, [])

    return (
        <Grid item xs={12} sm={6} md={4} ref={ref}>
            <Card>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: red[500]}}>{
                            abbv
                        }</Avatar>
                    }
                    action={
                        <IconButton aria-label='Remove from Watch List'>
                            <FavoriteIcon />
                        </IconButton>
                    }
                />
                <CardContent>
                    <MainGraph 
                        data={historicalData}
                        height={120}
                        width={Math.floor(cardWidth * 0.85)}
                        margin={{
                        top: 16,
                        right: 4,
                        bottom: 16,
                        left: 4
                        }}
                        hideBottomAxis
                        hideLeftAxis
                        border
                    />
                </CardContent>
            </Card>
        </Grid>
    )
}

export default WatchCard
