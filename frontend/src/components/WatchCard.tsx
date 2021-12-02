import React from 'react'
import { Avatar, Card, CardContent, CardHeader, Grid, IconButton } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { red } from '@mui/material/colors'

const WatchCard = () => {
    return (
        <Grid item >
            <Card>
                <CardHeader
                    avatar={
                        <Avatar sx={{ bgcolor: red[500]}}>{
                            // put Crypto abbv here
                        }</Avatar>
                    }
                    action={
                        <IconButton aria-label='Remove from Watch List'>
                            <FavoriteIcon />
                        </IconButton>
                    }
                />
            </Card>
        </Grid>
    )
}

export default WatchCard
