// src/App.js

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouterLink,
} from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Alert,
  Menu,
  MenuItem,
  IconButton,
  Breadcrumbs,
  Link,
  Button
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';

import Home from "./routes/Home";
import HeaderBar from "./components/HeaderBar";
import Search from "./routes/Search";
import Dashboard from "./routes/Dashboard/index";
import { payloadFromToken, logOut } from "./api/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    Component: Home,
    breadcrumb: [{ label: "Home", link: "/" }, { label: "Call List" }]
  },
  {
    path: "/search",
    name: "Search",
    Component: Search,
    breadcrumb: [{ label: "Home", link: "/" }, { label: "Search" }]
  },
  {
    path: "/dashboard/:key*",
    name: "Call Details",
    Component: Dashboard,
    breadcrumb: [{ label: "Home", link: "/" }, { label: "Call List", link: "/"}, { label: "Call Details" }]
  },
];

function NavigationBar({ userName, email }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
        >
          Contact-IQ Post-Call Analytics
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
          <Link
            href="https://www.contact-iq.com/"
            target="_blank"
            rel="noopener"
            underline="hover"
            color="inherit"
          >
            Contact-IQ home
          </Link>
          <Link
            href="https://www.contact-iq.com/#faq"
            target="_blank"
            rel="noopener"
            underline="hover"
            color="inherit"
          >
            FAQs
          </Link>
        </Box>

        <Button color="inherit" component={RouterLink} to="/search">
          Search
        </Button>

        <IconButton color="inherit" onClick={handleMenu}>
          <AccountCircle />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem disabled>{email}</MenuItem>
          <MenuItem onClick={logOut}>Sign out</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}


function App() {
  const [alert, setAlert] = useState();
  const userToken = localStorage.getItem("id_token");
  const parsedToken = payloadFromToken(userToken);
  const cognitoUserName = parsedToken["cognito:username"] || "Unknown";
  const cognitoEmail = parsedToken["email"] || "Unknown";

  return (
    <Router>
      <NavigationBar userName={cognitoUserName} email={cognitoEmail} />
      <Switch>
        {routes.map(({ path, Component, breadcrumb }) => (
          <Route key={path} path={path} exact>
            <Container sx={{ mt: 3 }}>
              <Breadcrumbs aria-label="breadcrumb">
                {breadcrumb.map((item, idx) => (
                  idx === breadcrumb.length - 1 ? (
                    <Typography key={idx} color="text.primary">
                      {item.label}
                    </Typography>
                  ) : (
                    <Link
                      key={idx}
                      component={RouterLink}
                      underline="hover"
                      color="inherit"
                      to={item.link}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </Breadcrumbs>
              {alert && (
                <Box mt={2}>
                  <Alert severity={alert.variant || "info"} onClose={() => setAlert(null)}>
                    <strong>{alert.heading}</strong><br />{alert.text}
                  </Alert>
                </Box>
              )}
              <Box mt={3}>
                <Component setAlert={setAlert} />
              </Box>
            </Container>
          </Route>
        ))}
      </Switch>
    </Router>
  );
}

export default App;