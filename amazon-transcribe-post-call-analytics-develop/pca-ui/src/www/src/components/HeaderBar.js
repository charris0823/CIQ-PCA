import React from "react";
import { AppBar, Toolbar, Typography, Box, Link } from "@mui/material";

const HeaderBar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#0ea2bd", mb: 4 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold", color: "#fff" }}>
            Contact IQ Post Call Analytics
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Link href="https://www.contact-iq.com/" target="_blank" rel="noopener" underline="hover" color="#fff">
            Contact-IQ home
          </Link>
          <Link href="https://www.contact-iq.com/#faq" target="_blank" rel="noopener" underline="hover" color="#fff">
            FAQs
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderBar;
