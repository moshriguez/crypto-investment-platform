import React from 'react'
import { Grid, Typography } from '@mui/material'

import { checkToken, updateWatchList } from '../utils'
import WatchCard from './WatchCard'
// Types
import { User } from '../types'

interface WatchListProps {
    list: string[] | null
    logout: (path: '/' | '/auth') => void
    setUser: (arg: User | null) => void
}
const WatchList: React.FC<WatchListProps> = ({ list, logout, setUser }) => {

    const removeFromWatchList = async (pair: string) => {
        const token = localStorage.getItem("jwt");
        if (token) {
            let decodedToken = checkToken(token)

            if (decodedToken) {
                if(list) {
                    let updatedList = list.filter(el => el !== pair)
                    updateWatchList(decodedToken.id, token, updatedList, setUser)
                }
            } else {
                console.log("expired token");
                logout('/auth');
            }
        }
    }

    return (
        <Grid container spacing={2} sx={{p: 2.5, justifyContent: 'center'}}>
            {list?.length ? (
                list?.map((pair, i) => {
                    return <WatchCard key={i} pair={pair} removeFromWatchList={removeFromWatchList}/>
                })
            ) : (
                <Typography variant='h5' mt={2} >Click the heart on a Cryptocurrency to add it to your Watch List.</Typography>
            )}
        </Grid>
    )
}

export default WatchList
