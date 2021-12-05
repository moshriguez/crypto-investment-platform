import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, Container, Grid, Paper, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import ConfirmDialog from './ConfirmDialog'
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
    const [errors, setErrors] = useState(initialState)
    const [showPassword, setShowPassword] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false)
    const handleShowPassword = () => setShowPassword(!showPassword);

    const switchForm = () => {
        setFormData(initialState)
        setIsSignUp(!isSignUp)
        setShowPassword(false)
    }

    const handleOpenConfirm = () => {
        setConfirmOpen(true)
    }

    const handleCloseConfirm = () => {
        setConfirmOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const url = 'https://crypto-investment-backend.herokuapp.com/users/'
        const configObj = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        }
        
        let res
        if(isSignUp) {
            frontendErrorCheck()
            if(errors.email === '' && errors.password === '' && errors.confirm === '') {
                res = await fetch(url + 'signup', configObj)
            } else {
                return
            }
        } else {
            res = await fetch(url + 'signin', configObj)
        }
        const data = await res.json()
        // console.log(data)
        if(data.message) {
            setBackendErrors(data.message)
        } else {
            localStorage.setItem("jwt", data.token)
            setUser(data.result)
            navigate('/watchlist')          
        }
    }

    // checks for errors on the front end
    const frontendErrorCheck = () => {
        const newErrors = {...initialState};
        if (formData.password !== formData.confirm) {
            newErrors.confirm = 'The password you have entered does not match the password confirmation.'
        }
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).+$/
        if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Passwords must include a capital letter, a lowercase letter and a number.'
        }
        const emailRegex = /^([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3}$/
        if(!emailRegex.test(formData.email)){
            newErrors.email = 'Please enter a valid email address.'
        }
        setErrors({...newErrors})
    }

    const setBackendErrors = (errorMessage: string) => {
        const newErrors = {...initialState}
        if(/email/.test(errorMessage)) {
            newErrors.email = errorMessage
        }
        if(/password/.test(errorMessage)) {
            newErrors.password = errorMessage
        }
        if(/wrong/.test(errorMessage)) {
            handleOpenConfirm()
        }
        setErrors({...newErrors})
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    }
  
    return (
        <>
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
                                    error={!!errors.firstName}
                                    helperText={errors.firstName}
                                />
                                <Input 
                                    name='lastName'
                                    label='Last Name'
                                    value={formData.lastName}
                                    handleChange={handleChange}
                                    half
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                />
                            </>
                        )}
                        <Input 
                            name='email'
                            label='Email'
                            value={formData.email}
                            handleChange={handleChange}
                            type='email'
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <Input 
                            name='password'
                            label='Password'
                            value={formData.password}
                            handleChange={handleChange}
                            type={showPassword ? 'text' : 'password'}
                            handleShowPassword={handleShowPassword}
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                        {isSignUp && (
                            <Input 
                                name='confirm'
                                label='Confirm Password'
                                value={formData.confirm}
                                handleChange={handleChange}
                                type='password'
                                error={!!errors.confirm}
                                helperText={errors.confirm}
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
        <ConfirmDialog 
            open={confirmOpen}
            handleCloseConfirm={handleCloseConfirm}
            dialogText={'Something went wrong. Please try again.'}
        />
        </>
    )
}

export default Auth
