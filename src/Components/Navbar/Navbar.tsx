import React from "react";
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
import AdbIcon from "@mui/icons-material/ShoppingCartOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const pages = ["home", "cart", "wishlist", "categories", "brands"];
const settings = ["my orders", "Change Password", "Logout"];

export default function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [activePage, setActivePage] = React.useState<string>("home");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.user.isLogin);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (page: string) => {
    setActivePage(page);
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/change-password");
    handleCloseUserMenu();
  };

  const handleAllOrders = () => {
    navigate("/allorders");
    handleCloseUserMenu();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "black" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />

          <Typography
            variant="h6"
            noWrap
            component="h6"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "white",
              textDecoration: "none",
              "&:hover": {
                cursor: "pointer",
              },
            }}
          >
            FreshCart
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
              onClose={() => setAnchorElNav(null)}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={() => handleCloseNavMenu(page)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                >
                  <Link
                    to={page === "home" ? "/" : `/${page}`}
                    style={{
                      textDecoration: "none",
                      width: "100%",
                      color: "inherit",
                    }}
                  >
                    <Typography sx={{ textAlign: "center", width: "100%" }}>
                      {page}
                    </Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="h5"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "white",
              "&:hover": {
                cursor: "pointer",
              },
            }}
          >
            FreshCart
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "flex-end" }}>
            {isLogin ? (
              pages.map((page) => (
                <Link
                  key={page}
                  to={page === "home" ? "/" : `/${page}`}
                  style={{
                    textDecoration: "none",
                    width: "100%",
                    color: "inherit",
                  }}
                >
                  <Button
                    onClick={() => handleCloseNavMenu(page)}
                    sx={{
                      my: 2,
                      color: "white",
                      display: "block",
                      position: "relative",
                      "&:after": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: "2px",
                        backgroundColor: "#FF5722",
                        transform: activePage === page ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "bottom left",
                        transition: "transform 0.3s ease",
                      },
                    }}
                  >
                    {page}
                  </Button>
                </Link>
              ))
            ) : (
              <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
                <Button
                  onClick={() => handleCloseNavMenu("login")}
                  sx={{
                    my: 2,
                    color: "white",
                    display: "block",
                    position: "relative",
                  }}
                >
                  Login
                </Button>
              </Link>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isLogin && (
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
            )}
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
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    if (setting === "Logout") {
                      handleLogout();
                    } else if (setting === "Change Password") {
                      handleChangePassword();
                    } else {
                      handleAllOrders();
                    }
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
