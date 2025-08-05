import React from "react";
import {
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  InputLabel,
  Box,
  Typography,
  Checkbox,
  ListItemText
} from "@mui/material";

const PAGE_SIZE_OPTIONS = [10, 50, 100];
const COLUMN_OPTIONS = [
  "status",
  "guid",
  "agent",
  "customer",
  "queue",
  "summary_resolved",
  "summary_topic",
  "summary_product",
  "summary_summary",
  "callerSentimentScore",
  "langCode",
  "duration"
];

export const DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: ["timestamp", "jobName", "status", "summary_summary"]
};

export const ContactTablePreferences = ({ preferences, setPreferences }) => {
  const handlePageSizeChange = (e) => {
    setPreferences({ ...preferences, pageSize: parseInt(e.target.value) });
  };

  const handleColumnChange = (e) => {
    setPreferences({ ...preferences, visibleContent: e.target.value });
  };

  return (
    <Box display="flex" gap={4} flexWrap="wrap" sx={{ mb: 3 }}>
      <FormControl>
        <InputLabel id="page-size-label">Page Size</InputLabel>
        <Select
          labelId="page-size-label"
          value={preferences.pageSize}
          onChange={handlePageSizeChange}
          label="Page Size"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>{option} Calls</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 300 }}>
        <InputLabel id="visible-columns-label">Visible Columns</InputLabel>
        <Select
          labelId="visible-columns-label"
          multiple
          value={preferences.visibleContent}
          onChange={handleColumnChange}
          renderValue={(selected) => selected.join(", ")}
        >
          {COLUMN_OPTIONS.map((col) => (
            <MenuItem key={col} value={col}>
              <Checkbox checked={preferences.visibleContent.indexOf(col) > -1} />
              <ListItemText primary={col} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
