import React from 'react'
import { useNavigate } from "react-router-dom";
import { Grid } from '@mui/material'
import decode, { JwtPayload } from "jwt-decode";


import WatchCard from './WatchCard'
// Types
import { User } from '../types'


interface WatchListProps {
    list: string[] | null
    logout: () => void
    setUser: (arg: User | null) => void
}
const WatchList: React.FC<WatchListProps> = ({ list, logout, setUser }) => {
    const navigate = useNavigate();

    const removeFromWatchList = async (pair: string) => {
        const token = localStorage.getItem("jwt");
        if (token) {
            type myJwtPayload = JwtPayload & { id: string };
            const decodedToken: myJwtPayload = decode(token);
            if (decodedToken.exp !== undefined) {
                if (decodedToken.exp * 1000 < new Date().getTime()) {
                    console.log("expired token");
                    logout();
                    navigate('/auth')
                  } else {
                    if(list) {
                        let updatedList = list.filter(el => el !== pair)
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
                          const res = await fetch("http://localhost:5000/users/" + decodedToken.id, configObj)
                          const data = await res.json()
                          setUser(data.user)
              
                    }
                  }
          
            }
        }
    }

    return (
        <Grid container spacing={2}>
            {list?.map((pair, i) => {
                return <WatchCard key={i} pair={pair} removeFromWatchList={removeFromWatchList}/>
            })}
        </Grid>
    )
}

export default WatchList
