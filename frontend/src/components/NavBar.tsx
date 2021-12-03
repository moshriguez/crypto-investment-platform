import React, { useEffect, useState } from "react";
import {
  AppBar,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import decode, { JwtPayload } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";

// Types
import { Pair, User } from "../types";

interface NavBarProps {
  allTradingPairs: Pair[];
  selectedTradingPair: string;
  handleTradingPairSelect: (e: any, newValue: Pair | null) => void;
  user: User | null;
  setUser: (arg: User | null) => void;
  logout: () => void
}
const NavBar: React.FC<NavBarProps> = ({
  allTradingPairs,
  selectedTradingPair,
  handleTradingPairSelect,
  user,
  setUser,
  logout
}) => {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

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
            sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
          >
            CRYPTO
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
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
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {user ? (
                <MenuItem onClick={handleCloseNavMenu}>
                  <Typography component={Link} to="/watchlist" textAlign="center">Watch List</Typography>
                </MenuItem>
              ) : null}
            </Menu>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component={Link} 
            to="/"
            sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
          >
            CRYPTO
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {user ? (
              <Button
                component={Link}
                to="/watchlist"
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Watch List
              </Button>
            ) : null}
          </Box>
            <Autocomplete
              disablePortal
              options={allTradingPairs}
              getOptionLabel={(option) => option.display_name}
              onChange={(e: any, newValue: Pair | null) => {
                handleTradingPairSelect(e, newValue);
              }}
              id="cryptocurrency-options"
              autoHighlight
              disableClearable
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Cryptocurrency" />
              )}
            />

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
