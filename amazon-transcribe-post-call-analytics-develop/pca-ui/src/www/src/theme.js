import { createTheme } from "@mui/material/styles";

// This theme is designed to emulate the clean, modern aesthetic of contact-iq.com.
const theme = createTheme({
  // --- COLOR PALETTE ---
  // The palette uses a vibrant blue for primary actions and a clean,
  // minimalist background and text scheme.
  palette: {
    mode: "light",
    background: {
      default: "#F2F5F8", // A very light, subtle gray background for a clean feel
      paper: "#ffffff"    // Pure white for card and paper components
    },
    primary: {
      // This blue is a close match to the main brand color on the website
      main: "#1266F1",
      light: "#4285F4",
      dark: "#0a45b8",
    },
    // The website primarily uses shades of blue, so we'll use a secondary
    // palette that complements the primary color instead of a contrasting one.
    secondary: {
      main: "#42A5F5", // A lighter blue for secondary actions or accents
      light: "#64B5F6",
      dark: "#1976D2",
    },
    text: {
      // A dark, but not black, text color for better readability on light backgrounds
      primary: "#212121", 
      // A medium gray for secondary text, like descriptions and labels
      secondary: "#757575"
    }
  },

  // --- TYPOGRAPHY ---
  // The Inter font family is a great choice and aligns well with the website's modern look.
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: {
      fontSize: "2.25rem",
      fontWeight: 700,
    },
    h5: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
    },
    body2: { 
      fontSize: "0.875rem", 
      lineHeight: 1.5,
    },
  },

  // --- GLOBAL SHAPE & COMPONENTS ---
  shape: {
    // A slightly smaller border radius for a modern, clean look
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          // Add a subtle transition for a smoother hover effect
          transition: "background-color 0.3s, box-shadow 0.3s",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }
        },
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          // Adjust the border radius to match the global shape setting
          borderRadius: 12, 
          // Use a softer, more diffused box-shadow for a modern floating effect
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Apply a subtle blue gradient to the app bar for a modern look
          background: 'linear-gradient(90deg, rgba(18,102,241,1) 0%, rgba(66,165,245,1) 100%)',
          color: '#ffffff', // White text for better contrast on the colored background
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          // Style the accordion to look like a clean card
          borderRadius: 12,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
          '&:before': {
            display: 'none', // Remove the default line separator
          },
          '&.Mui-expanded': {
            margin: '12px 0',
          }
        },
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          // Use the global border radius for all Paper components
          borderRadius: 8,
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          // Make links a little more subtle
          color: '#1266F1',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          }
        }
      }
    }
  }
});

export default theme;
