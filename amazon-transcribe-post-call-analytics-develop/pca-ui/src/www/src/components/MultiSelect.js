import React from "react";
import {
  Checkbox,
  ListItemText,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Box
} from "@mui/material";

export const MultiSelect = ({ label, options = [], value = [], onChange, isLoading = false, ...props }) => {
  const handleChange = (event) => {
    const {
      target: { value: selected },
    } = event;
    onChange(typeof selected === "string" ? selected.split(",") : selected);
  };

  const cleanedProps = { ...props };
  delete cleanedProps.isLoading;

  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Box position="relative">
        <Select
          multiple
          value={value}
          onChange={handleChange}
          renderValue={(selected) => selected.join(", ")}
          disabled={isLoading}
          label={label}
          {...cleanedProps}
        >
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              <Checkbox checked={value.indexOf(opt.value) > -1} />
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
        </Select>
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
