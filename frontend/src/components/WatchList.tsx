import React from 'react'
import { Grid } from '@mui/material'

import WatchCard from './WatchCard'

interface WatchListProps {
    list: string[] | null
}
const WatchList: React.FC<WatchListProps> = ({ list }) => {


    return (
        <Grid container spacing={2}>
            {list?.map((pair, i) => {
                return <WatchCard key={i} pair={pair} />
            })}
        </Grid>
    )
}

export default WatchList
