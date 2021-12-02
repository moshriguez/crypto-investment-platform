import React from 'react'
import { Grid } from '@mui/material'

import WatchCard from './WatchCard'
interface WatchListProps {
    list: string[] | null
}
const WatchList: React.FC<WatchListProps> = ({ list }) => {
    return (
        <Grid container spacing={2}>
            
        </Grid>
    )
}

export default WatchList
