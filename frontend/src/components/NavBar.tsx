import React, { useEffect, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import AutoDropdown from './AutoDropdown'
import { checkToken, deleteUser, fetchUser } from '../utils'
// Types
import { Pair, User } from "../types";

interface NavBarProps {
  selectedTradingPair: string;
  handleTradingPairSelect: (e: any, newValue: Pair | null) => void;
  user: User | null;
  setUser: (arg: User | null) => void;
  logout: (path: '/' | '/auth') => void
}
const NavBar: React.FC<NavBarProps> = ({
  handleTradingPairSelect,
  user,
  setUser,
  logout
}) => {
  const location = useLocation()
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const token = localStorage.getItem("jwt");
  
  useEffect(() => {
    if(token) {
      
      let decodedToken = checkToken(token)

      if (decodedToken) {
        fetchUser(decodedToken.id, token, setUser);
      } else {
        console.log("expired token");
        logout('/auth');
      }
    }
  }, [token]);

  const handleDeleteUser = async () => {
    if(token) {
      let decodedToken = checkToken(token)

      if(decodedToken) {
        if(user) deleteUser(user._id, token)
        logout('/')
      } else {
        console.log("expired token");
        logout('/auth');
      }
    }
  }

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
        <Typography
            variant="h6"
            noWrap
            component={Link} 
            to="/"
            sx={{ flexGrow: 1, display: { xs: "flex", md: "flex" } }}
          >
            CRYPTO
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "flex" } }}>
            {user ? (
              <Button
                component={Link}
                to="/watchlist"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Watch List
              </Button>
            ) : null}
          </Box>
          <Box sx={{display: { xs: 'none', sm: 'flex'}}}>
            {location.pathname !== '/' && (
              <AutoDropdown handleTradingPairSelect={handleTradingPairSelect}/>
            )}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <Tooltip title="Account Options">
                  <IconButton onClick={handleOpenUserMenu} sx={{ px: 2 }}>
                    <Avatar alt={user.name}>{user.name.charAt(0)}</Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={() => {
                    handleDeleteUser()
                    handleCloseUserMenu()
                  }}>
                    <Typography textAlign="center">Delete Account</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      logout('/auth');
                      handleCloseUserMenu();
                    }}
                  >
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                to="/auth"
                variant="contained"
                color="secondary"
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
