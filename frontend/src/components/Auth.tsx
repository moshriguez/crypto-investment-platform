import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, Container, Grid, Paper, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import Input from './Input'
// Types
import { User } from '../types'

const initialState = { firstName: '', lastName: '', email: '', password: '', confirm: '' }

interface AuthProps {
    setUser: (arg: User | null) => void
}

const Auth: React.FC<AuthProps> = ({ setUser }) => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState(initialState);
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const handleShowPassword = () => setShowPassword(!showPassword);

    const switchForm = () => {
        setFormData(initialState)
        setIsSignUp(!isSignUp)
        setShowPassword(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const url = 'http://localhost:5000/users/'
        const configObj = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        }
        
        let res
        if(isSignUp) {
            res = await fetch(url + 'signup', configObj)
        } else {
            res = await fetch(url + 'signin', configObj)
        }
        const data = await res.json()
        console.log(data)
        if(data.message) {
            //todo: need to handle errors and display them to the user
            console.log('theres and error')
        } else {
            localStorage.setItem("jwt", data.token)
            setUser(data.result)
            navigate('/watchlist')          
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    }
  
    return (
        <Container component='main' maxWidth='xs'>
            <Paper elevation={3} sx={{display: 'flex', alignItems: 'center', flexDirection: 'column', p: 2, m: 2}}>
                <Avatar>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component='h5' variant='h5' mb={2}>{isSignUp ? 'Sign Up' : 'Sign In'}</Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        {isSignUp && (
                            <>
                                <Input 
                                    name='firstName'
                                    label='First Name'
                                    value={formData.firstName}
                                    handleChange={handleChange}
                                    half
                                />
                                <Input 
                                    name='lastName'
                                    label='Last Name'
                                    value={formData.lastName}
                                    handleChange={handleChange}
                                    half
                                />
                            </>
                        )}
                        <Input 
                            name='email'
                            label='Email'
                            value={formData.email}
                            handleChange={handleChange}
                            type='email'
                        />
                        <Input 
                            name='password'
                            label='Password'
                            value={formData.password}
                            handleChange={handleChange}
                            type={showPassword ? 'text' : 'password'}
                            handleShowPassword={handleShowPassword}
                        />
                        {isSignUp && (
                            <Input 
                                name='confirm'
                                label='Confirm Password'
                                value={formData.confirm}
                                handleChange={handleChange}
                                type='password'

                            />
                        )}
                    </Grid>
                    <Button 
                        type='submit'
                        fullWidth
                        variant='contained'
                        color='primary'
                    >
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <Grid container justifyContent='flex-end'>
                        <Grid item>
                            <Button onClick={switchForm}>
                                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    )
}

export default Auth
