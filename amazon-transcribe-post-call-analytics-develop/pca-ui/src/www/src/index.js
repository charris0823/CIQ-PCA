import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; 

import {
  parseAuthQueryString,
  getToken,
  redirectToLogin,
  handleCode,
} from "./api/auth";

const renderApp = () => {
  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById("root")
  );
};

(async () => {
  try {
    const tokenData = parseAuthQueryString();
    if (tokenData) await handleCode(tokenData);
    const token = await getToken();
    if (!token) throw new Error("No token, auth required");
    renderApp();
  } catch (e) {
    console.error(e);
    redirectToLogin();
  }
})();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
