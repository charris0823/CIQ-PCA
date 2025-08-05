import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

export const ChatInput = ({ submitQuery }) => {
  const [inputQuery, setInputQuery] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      submitQuery(inputQuery);
      setInputQuery("");
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', gap: 2, mt: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        label="Ask a question"
        value={inputQuery}
        onChange={(e) => setInputQuery(e.target.value)}
      />
      <Button type="submit" variant="contained">Submit</Button>
    </Box>
  );
};
