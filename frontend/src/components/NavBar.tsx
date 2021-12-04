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
import decode, { JwtPayload } from "jwt-decode";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AutoDropdown from './AutoDropdown'
// Types
import { Pair, User } from "../types";

interface NavBarProps {
  selectedTradingPair: string;
  handleTradingPairSelect: (e: any, newValue: Pair | null) => void;
  user: User | null;
  setUser: (arg: User | null) => void;
  logout: () => void
}
const NavBar: React.FC<NavBarProps> = ({
  handleTradingPairSelect,
  user,
  setUser,
  logout
}) => {
  const navigate = useNavigate();
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
    if (token) {
      type myJwtPayload = JwtPayload & { id: string };
      const decodedToken: myJwtPayload = decode(token);

      if (decodedToken.exp !== undefined) {
        if (decodedToken.exp * 1000 < new Date().getTime()) {
          console.log("expired token");
          logout();
          navigate('/auth')
        } else {
          const fetchUser = async () => {
            const configObj = {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            };
            let res = await fetch("http://localhost:5000/users/" + decodedToken.id, configObj);
            const data = await res.json();
            setUser(data.user);
          };
          fetchUser();
        }
      }
    }
  }, [token]);

  const deleteUser = async () => {
    const configObj = {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    }
    console.log('here')
    if (user) {
      let res = await fetch("http://localhost:5000/users/" + user._id, configObj);
      const data = await res.json();
      console.log(data, token)
    }
    logout()
    navigate('/')
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
                    deleteUser()
                    handleCloseUserMenu()
                  }}>
                    <Typography textAlign="center">Delete Account</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      logout();
                      navigate('/auth')
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
