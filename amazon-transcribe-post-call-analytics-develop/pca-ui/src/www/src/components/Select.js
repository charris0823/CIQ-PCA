import React from "react";
import {
  MenuItem,
  Select as MUISelect,
  FormControl,
  InputLabel,
  CircularProgress,
  Box
} from "@mui/material";

export const Select = ({ label, options = [], value, onChange, isLoading = false, ...props }) => {
  const cleanedProps = { ...props };
  delete cleanedProps.isLoading; // prevent warning

  return (
    <FormControl fullWidth>
      {label && <InputLabel>{label}</InputLabel>}
      <Box position="relative">
        <MUISelect
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          label={label}
          disabled={isLoading}
          {...cleanedProps}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </MUISelect>
        {isLoading && (
          <Box
            position="absolute"
            top="50%"
            right={10}
            sx={{ transform: "translateY(-50%)" }}
          >
            <CircularProgress size={20} />
          </Box>
        )}
      </Box>
    </FormControl>
  );
};
