import React, { useState } from "react";
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
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../libs/store";
import toast from "react-hot-toast";

const pages = ["home", "cart", "wishlist", "categories", "brands"];
const settings = ["My Orders", "Change Password", "Logout"];

export default function Navbar() {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [activePage, setActivePage] = React.useState<string>("home");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = useSelector((state: RootState) => state.user.isLogin);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (page: string) => {
    setActivePage(page);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    dispatch({ type: "LOGOUT" });
    toast.success("تم تسجيل الخروج بنجاح!");
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1E1E1E" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "#FF5722",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <ShoppingCartOutlinedIcon sx={{ mt: 0.5 }} />
            FreshCart
          </Typography>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            {isLogin ? (
              pages.map((page) => (
                <Link key={page} to={page === "home" ? "/" : `/${page}`}
                  style={{ textDecoration: "none", margin: "0 15px" }}>
                  <Button
                    onClick={() => handleCloseNavMenu(page)}
                    sx={{
                      color: activePage === page ? "#FF5722" : "white",
                      fontWeight: "bold",
                      fontSize: "16px",
                      textTransform: "capitalize",
                      '&:hover': { color: "#FF5722" }
                    }}
                  >
                    {page}
                  </Button>
                </Link>
              ))
            ) : (
              <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
                <Button sx={{ my: 2, color: "white" }}>Login</Button>
              </Link>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isLogin && (
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
            )}
            <Menu
              sx={{ mt: "45px" }}
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    if (setting === "Logout") {
                      handleLogout();
                    } else if (setting === "Change Password") {
                      navigate("/change-password");
                    } else {
                      navigate("/allorders");
                    }
                    handleCloseUserMenu();
                  }}
                >
                  <Typography>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}