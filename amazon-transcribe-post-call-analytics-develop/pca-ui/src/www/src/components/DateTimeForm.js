import React, { useEffect, useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';

export function DateTimeForm({ filter, operator, value, onChange }) {
  const defaultTime = operator === '<' || operator === '>=' ? undefined : '23:59:59';
  const [{ dateValue, timeValue }, setState] = useState(parseValue(value ?? '', defaultTime));

  const handleDateChange = (e) => {
    setState((s) => ({ ...s, dateValue: e.target.value }));
  };

  const handleTimeChange = (e) => {
    setState((s) => ({ ...s, timeValue: e.target.value }));
  };

  useEffect(() => {
    filter && setState(parseDateTimeFilter(filter.trim()));
  }, [filter]);

  useEffect(() => {
    const dateAndTimeValue = dateValue + 'T' + (timeValue || '00:00:00');
    if (!dateValue.trim()) {
      onChange(null);
    } else if (isValidIsoDate(dateAndTimeValue)) {
      onChange(dateAndTimeValue);
    }
  }, [dateValue, timeValue, onChange]);

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      <TextField
        type="date"
        label="Date"
        value={dateValue}
        onChange={handleDateChange}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        type="time"
        label="Time"
        value={timeValue}
        onChange={handleTimeChange}
        InputLabelProps={{ shrink: true }}
      />
    </Box>
  );
}

function parseDateTimeFilter(value) {
  const isoValue = value.trim();
  const [dateValue, timeValue = ''] = isoValue.split('T');
  return { dateValue, timeValue };
}

function parseValue(value, defaultTime) {
  if (!value) return { dateValue: '', timeValue: '' };
  const [dateValue, timeValue = defaultTime || ''] = value.split('T');
  return { dateValue, timeValue };
}

function isValidIsoDate(str) {
  return dayjs(str).isValid();
}
