import React, { useState } from "react";
import useSWRInfinite from "swr/infinite";
import { list } from "../api/api";
import Upload from '../components/Upload';
import ContactTable from '../components/ContactTable';
import { useDangerAlert } from "../hooks/useAlert";
import { presign } from "../api/api";

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TablePagination,
  IconButton,
  alpha,
  useTheme,
  Fade,
  Grow,
} from "@mui/material";

import {
  CloudUpload as CloudUploadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  CallMade as CallMadeIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const config = window.pcaSettings;

function Home({ setAlert }) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [uploadExpanded, setUploadExpanded] = useState(false);

  const fetcher = (url, startKey, timestampFrom) => {
    return list({ count: 100 }); 
  };

  const getKey = (pageIndex, previousPageData) => {
    return `/list`;
  };

  const { data, error, isValidating } = useSWRInfinite(getKey, fetcher);
  const isLoading = !data && !error;
  useDangerAlert(error, setAlert);
  
  const allRecords = (data || []).map((d) => d.Records).flat();
  const paginatedRecords = allRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate stats
  const totalCalls = allRecords.length;
  const completedCalls = allRecords.filter(record => record.status === 'Done').length;
  const recentCalls = allRecords.filter(record => {
    if (!record.timestamp) return false;
    const recordDate = new Date(record.timestamp);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return recordDate > dayAgo;
  }).length;

  const processingCalls = totalCalls - completedCalls;
  const completionRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  const StatsCard = ({ icon, title, value, subtitle, color = "primary", trend, onClick }) => (
    <Grow in timeout={800} style={{ transitionDelay: '200ms' }}>
      <Card 
        elevation={0}
        onClick={onClick}
        sx={{ 
          height: '100%',
          border: 1,
          borderColor: 'divider',
          borderRadius: 3,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: `${color}.main`,
            boxShadow: theme.shadows[8],
            transform: 'translateY(-4px)',
            '& .stats-icon': {
              transform: 'scale(1.1)',
            }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
          }
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
          <Box 
            className="stats-icon"
            sx={{ 
              mb: 2, 
              color: `${color}.main`,
              transition: 'transform 0.3s ease'
            }}
          >
            {icon}
          </Box>
          <Typography 
            variant="h3" 
            fontWeight="bold" 
            sx={{ 
              background: `linear-gradient(45deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            {value}
          </Typography>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
          {trend && (
            <Chip 
              size="small" 
              label={trend} 
              color={color}
              variant="outlined"
              sx={{ mt: 1, fontSize: '0.75rem' }}
            />
          )}
        </CardContent>
      </Card>
    </Grow>
  );

  const FeatureCard = ({ icon, title, description }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: theme.shadows[4],
        }
      }}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{ mb: 2, color: 'primary.main' }}>
          {icon}
        </Box>
        <Typography variant="h6" fontWeight="600" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={1000}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography 
                  variant="h2" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2
                  }}
                >
                  Call Analytics Dashboard
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    opacity: 0.95, 
                    mb: 4,
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    lineHeight: 1.4
                  }}
                >
                  Powerful call analytics with AI‑driven transcription, sentiment tracking, and actionable insights
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => {
                      setUploadExpanded(true);
                      // Scroll to upload section after a brief delay to allow accordion to expand
                      setTimeout(() => {
                        const uploadSection = document.getElementById('upload-section');
                        if (uploadSection) {
                          uploadSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                          });
                        }
                      }, 300);
                    }}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      py: 1.5,
                      px: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: theme.shadows[8],
                      '&:hover': { 
                        bgcolor: 'grey.100',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[12]
                      }
                    }}
                  >
                    Upload Recording
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<AssessmentIcon />}
                    onClick={() => window.open('https://www.contact-iq.com/index.html#faq', '_blank')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      py: 1.5,
                      px: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      '&:hover': { 
                        borderColor: 'white', 
                        bgcolor: alpha('#fff', 0.1),
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    View Demo
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center', opacity: 0.9 }}>
                  <AnalyticsIcon sx={{ fontSize: { xs: 80, md: 120 }, mb: 2 }} />
                  <Typography variant="h6" fontWeight="600">
                    AI-Powered Intelligence
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Stats Overview */}
        <Box sx={{ mb: 8 }}>
          <Fade in timeout={1000} style={{ transitionDelay: '300ms' }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Dashboard Overview
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Analyze conversations. Improve experiences. Drive better results
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                icon={<CallMadeIcon sx={{ fontSize: 48 }} />}
                title="Total Calls"
                value={totalCalls}
                subtitle="All recorded calls"
                color="primary"
                trend={`${recentCalls} today`}
                onClick={() => console.log('Navigate to all calls')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                icon={<TrendingUpIcon sx={{ fontSize: 48 }} />}
                title="Completed"
                value={completedCalls}
                subtitle="Successfully processed"
                color="success"
                trend={`${completionRate}% rate`}
                onClick={() => console.log('Navigate to completed calls')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                icon={<ScheduleIcon sx={{ fontSize: 48 }} />}
                title="Recent"
                value={recentCalls}
                subtitle="Last 24 hours"
                color="info"
                trend="Active today"
                onClick={() => console.log('Navigate to recent calls')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard
                icon={<SpeedIcon sx={{ fontSize: 48 }} />}
                title="Processing"
                value={processingCalls}
                subtitle="Currently analyzing"
                color="warning"
                trend={processingCalls > 0 ? "In progress" : "All done"}
                onClick={() => console.log('Navigate to processing calls')}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Fade in timeout={1000} style={{ transitionDelay: '600ms' }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Powerful Analytics Features
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                Leverage cutting-edge AI technology to extract meaningful insights from every conversation
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={<PsychologyIcon sx={{ fontSize: 48 }} />}
                title="AI Sentiment Analysis"
                description="Real-time emotion detection and sentiment trends throughout conversations"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={<AssessmentIcon sx={{ fontSize: 48 }} />}
                title="Smart Transcription"
                description="Accurate speech-to-text with speaker identification and keyword highlighting"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={<TrendingUpIcon sx={{ fontSize: 48 }} />}
                title="Performance Insights"
                description="Comprehensive analytics dashboard with actionable business intelligence using Generative AI"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Upload Section */}
        <Box sx={{ mb: 8 }}>
          <Fade in timeout={1000} style={{ transitionDelay: '900ms' }}>
            <Paper 
              elevation={0}
              sx={{ 
                border: 1, 
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              <Accordion 
                id="upload-section"
                expanded={uploadExpanded} 
                onChange={(e, expanded) => setUploadExpanded(expanded)}
                elevation={0}
                sx={{ 
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    px: 4,
                    py: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center'
                    }
                  }}
                >
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'white'
                      }}
                    >
                      <CloudUploadIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        Upload Call Recordings
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Drag and drop audio files or click to browse • Supports MP3, WAV, FLAC, and more
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 4, pb: 4 }}>
                  <Box sx={{ pt: 2 }}>
                    <Upload setAlert={setAlert} />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Fade>
        </Box>

        {/* Call Records Table */}
        <Fade in timeout={1000} style={{ transitionDelay: '1200ms' }}>
          <Paper 
            elevation={0}
            sx={{ 
              border: 1, 
              borderColor: 'divider',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            {/* Table Header */}
            <Box 
              sx={{ 
                px: 4, 
                py: 3, 
                bgcolor: alpha(theme.palette.grey[50], 0.8),
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Call Records
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Chip 
                      label={`${totalCalls} Total`} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={`${completedCalls} Processed`} 
                      size="small" 
                      color="success"
                      variant="outlined"
                    />
                    {isLoading && (
                      <Chip 
                        label="Loading..." 
                        size="small" 
                        color="info"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      border: 1, 
                      borderColor: 'divider',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                  >
                    <FilterListIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>

            {/* Table Content */}
            <Box sx={{ p: 4 }}>
              {isLoading ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Loading call records...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Please wait while we fetch your data
                  </Typography>
                </Box>
              ) : totalCalls === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CloudUploadIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
                  <Typography variant="h5" fontWeight="600" gutterBottom>
                    No call records yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                    Upload your first call recording to get started with AI-powered analysis and unlock powerful insights.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => setUploadExpanded(true)}
                    sx={{ py: 1.5, px: 4 }}
                  >
                    Upload Your First Recording
                  </Button>
                </Box>
              ) : (
                <Stack spacing={3}>
                  <ContactTable rows={paginatedRecords} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden'
                      }}
                    >
                      <TablePagination
                        component="div"
                        count={allRecords.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        labelRowsPerPage="Records per page:"
                        sx={{
                          '& .MuiTablePagination-toolbar': {
                            px: 3
                          }
                        }}
                      />
                    </Paper>
                  </Box>
                </Stack>
              )}
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default Home;