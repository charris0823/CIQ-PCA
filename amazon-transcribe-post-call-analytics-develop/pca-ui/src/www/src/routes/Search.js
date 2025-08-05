import { useState } from "react";
import useSWR from "swr";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  entities as getEntities,
  languages as getLanguages,
  search,
} from "../api/api";
import { useDangerAlert } from "../hooks/useAlert";
import {
  Button,
  Container,
  Typography,
  Box,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Breadcrumbs,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const SENTIMENT_WHAT = [
  { value: "average", label: "Average" },
  { value: "trend", label: "Trending" },
];

const SENTIMENT_WHO = [
  { value: "caller", label: "Customer" },
  { value: "agent", label: "Agent" },
];

const SENTIMENT_DIRECTION = [
  { value: "positive", label: "Positive" },
  { value: "negative", label: "Negative" },
];

function Search({ setAlert }) {
  const [query, setQuery] = useState({});
  const [jobName, setJobName] = useState("");
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const { data: entities, error: errorEntities } = useSWR(
    `/entities`,
    getEntities
  );
  const { data: languageCodes, error: errorLanguageCodes } = useSWR(
    `/languages`,
    getLanguages
  );

  const fullQuery = {
    ...query,
    ...(selectedEntities.length > 0 && {
      entity: selectedEntities.map((e) => e.value).join(","),
    }),
    ...(jobName && { jobName }),
  };

  const shouldSearch =
    (query.timestampFrom && query.timestampTo) ||
    (!query.timestampFrom && !query.timestampTo) ||
    jobName;

  const {
    data: results,
    error: errorResults,
    isLoading,
  } = useSWR(shouldSearch && showResults ? [`/search`, fullQuery] : null, () =>
    search(fullQuery)
  );

  const filterEmptyKeys = (obj) => {
    const shouldKeep = (v) => (Array.isArray(v) ? v.length > 0 : v !== null);
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => shouldKeep(v))
    );
  };

  const handleQueryInput = (input, field) => {
    setQuery((q) => {
      const updated = { ...q, [field]: input };
      return filterEmptyKeys(updated);
    });
  };

  const onClick = () => {
    setShowResults(true);
  };

  useDangerAlert(errorEntities || errorLanguageCodes || errorResults, setAlert);

  const languageOptions = (languageCodes || []).map((code) => ({
    label: code,
    value: code,
  }));

  const entityOptions = (entities || []).map((entity) => ({
    label: entity,
    value: entity,
  }));

  const handleClearForm = () => {
    setQuery({});
    setJobName("");
    setSelectedEntities([]);
    setShowResults(false);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Typography color="text.primary">Search</Typography>
        </Breadcrumbs>
        <Typography variant="h4" component="h1" sx={{ mt: 1 }}>
          Search
        </Typography>
      </Box>

      <Box sx={{ py: 2 }}>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <Box display="flex" alignItems="center" gap={2}>
              <InputLabel id="language-code-label">Language Code</InputLabel>
              <Select
                labelId="language-code-label"
                id="language-code"
                label="Language Code"
                value={query.language || ""}
                onChange={(e) => handleQueryInput(e.target.value, "language")}
                sx={{ minWidth: 200 }}
              >
                {languageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="outlined"
                onClick={() => handleQueryInput(null, "language")}
              >
                Clear
              </Button>
            </Box>
          </FormControl>

          <Box display="flex" alignItems="center" gap={2}>
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={query.timestampFrom ? new Date(query.timestampFrom) : null}
                  onChange={(newValue) => {
                    handleQueryInput(newValue ? new Date(newValue).getTime() : null, "timestampFrom");
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </FormControl>
            <FormControl fullWidth>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={query.timestampTo ? new Date(query.timestampTo) : null}
                  onChange={(newValue) => {
                    handleQueryInput(newValue ? new Date(newValue).setUTCHours(23, 59, 59, 999) : null, "timestampTo");
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => {
                handleQueryInput(null, "timestampFrom");
                handleQueryInput(null, "timestampTo");
              }}
            >
              Clear
            </Button>
          </Box>
          
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Sentiment
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography>The</Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={query.sentimentWhat || ""}
                  onChange={(e) =>
                    handleQueryInput(e.target.value, "sentimentWhat")
                  }
                >
                  {SENTIMENT_WHAT.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography>sentiment of the</Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={query.sentimentWho || ""}
                  onChange={(e) =>
                    handleQueryInput(e.target.value, "sentimentWho")
                  }
                >
                  {SENTIMENT_WHO.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography>is</Typography>
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={query.sentimentDirection || ""}
                  onChange={(e) =>
                    handleQueryInput(e.target.value, "sentimentDirection")
                  }
                >
                  {SENTIMENT_DIRECTION.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => {
                  handleQueryInput(null, "sentimentWhat");
                  handleQueryInput(null, "sentimentWho");
                  handleQueryInput(null, "sentimentDirection");
                }}
              >
                Clear
              </Button>
            </Stack>
          </Box>

          <FormControl fullWidth>
            <Autocomplete
              multiple
              options={entityOptions}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                option.value === value.value
              }
              value={selectedEntities}
              onChange={(e, newValue) => setSelectedEntities(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Entities" />
              )}
            />
          </FormControl>

          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              label="Job Name"
              variant="outlined"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={() => {
                setJobName("");
              }}
            >
              Clear
            </Button>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={onClick}>
              Search
            </Button>
            <Button variant="outlined" onClick={handleClearForm}>
              Clear All
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Search Results
        </Typography>
        {showResults && (
          <ContactTable data={results} loading={isLoading} error={errorResults} />
        )}
      </Box>
    </Container>
  );
}

const ContactTable = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data || data.length === 0) {
    return <NoMatches />;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Contact ID</TableCell>
            <TableCell>Language</TableCell>
            <TableCell>Timestamp</TableCell>
            <TableCell>Job Name</TableCell>
            <TableCell>Sentiment</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.key}>
              <TableCell>{row.guid}</TableCell>
              <TableCell>{row.lang}</TableCell>
              <TableCell>
                <Link
                  to={`/dashboard/${row.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {format(new Date(row.timestamp), "P p")}
                </Link>
              </TableCell>
              <TableCell>{row.jobName}</TableCell>
              <TableCell>{row.callerSentimentScore}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const NoMatches = () => (
  <Box sx={{ textAlign: "center", py: 4 }}>
    <Typography variant="h6">No Matches</Typography>
    <Typography variant="body2">Please try a different query</Typography>
  </Box>
);

export default Search;