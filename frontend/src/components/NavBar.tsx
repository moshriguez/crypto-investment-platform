import React, {useEffect, useState} from 'react'
import { AppBar, Autocomplete, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, TextField, Toolbar, Tooltip, Typography } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import decode, { JwtPayload } from 'jwt-decode';
import {Link, useNavigate} from 'react-router-dom'

// Types
import { Pair } from '../types'


interface User {
    result: {
        name: string
        email: string
        password: string
        watchList: string[]
        _id: string
    }
    token: string
}

interface NavBarProps {
    allTradingPairs: Pair[]
    selectedTradingPair: string
    setSelectedTradingPair: (arg0: string) => void
}
const NavBar: React.FC<NavBarProps> = ({ allTradingPairs, selectedTradingPair, setSelectedTradingPair }) => {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [user, setUser] = useState<User | null>(null)

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    useEffect(() => {
        setUser({result: {name:'Jon Snow', email: 'jonsnow@gmail.com', password: "123", watchList: [], _id: 'abc'}, token: 'abcde'})
        // const storage = localStorage.getItem('profile')
        // if(storage) {
        //     const userObj: User = JSON.parse(storage)
        //     const token = userObj.token
        //     if(!token) return
        //     const decodedToken = decode(token)
        //     console.log(token)
        //     if (decodedToken && decodedToken?.exp* 1000 < new Date().getTime()) logout();
        // }
    }, [])

    const logout = () => {
        // dispatch({ type: actionType.LOGOUT });
    
        // navigate('/auth');
    
        setUser(null);
      };
    

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                >
                    CRYPTO
                </Typography>

                <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                    <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenNavMenu}
                    color="inherit"
                    >
                    <MenuIcon />
                    </IconButton>
                    <Menu
                    id="menu-appbar"
                    anchorEl={anchorElNav}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    open={Boolean(anchorElNav)}
                    onClose={handleCloseNavMenu}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                    }}
                    >
                        {user ? (
                            <MenuItem onClick={handleCloseNavMenu}>
                                <Typography textAlign="center">Watch List</Typography>
                            </MenuItem>
                        ) : null}
                    </Menu>
                </Box>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
                >
                    CRYPTO
                </Typography>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                    {user ? (
                    <Button
                        onClick={handleCloseNavMenu}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                        Watch List
                    </Button>
                    ) : null}
                    <Autocomplete
                    disablePortal
                    options={allTradingPairs}
                    getOptionLabel={(option) => option.display_name}
                    onChange={(e: any, newValue: Pair | null) => {
                        if(newValue) {
                            setSelectedTradingPair(newValue?.id)
                        }
                        }}
                    id="cryptocurrency-options"
                    autoHighlight
                    disableClearable
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Cryptocurrency" />}
                    />
                </Box>

                <Box sx={{ flexGrow: 0 }}>
                    {user ? (
                        <>
                        <Tooltip title="Account Options">
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Avatar alt={user.result.name}>{user.result.name.charAt(0)}</Avatar>
                        </IconButton>
                        </Tooltip>
                        <Menu
                        sx={{ mt: '45px' }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                        >
                        
                            <MenuItem onClick={handleCloseUserMenu}>
                                <Typography textAlign="center">Delete Account</Typography>
                            </MenuItem>
                            <MenuItem onClick={() => {logout(); handleCloseUserMenu()}}>
                                <Typography textAlign="center">Logout</Typography>
                            </MenuItem>
                        </Menu>
                        </>
                    ) : (
                        <Button component={Link} to="/auth" variant="contained" color="secondary">Sign In</Button>
                    )}
                </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default NavBar
