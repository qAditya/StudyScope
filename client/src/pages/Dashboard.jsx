import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  TrendingUp,
  FilePresent,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

const MotionCard = motion(Card);
const MotionPaper = motion(Paper);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalStudents: 0,
    totalColleges: 0,
    totalSpecializations: 0,
  });
  const [recentUploads, setRecentUploads] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [uploadsResponse, studentsResponse] = await Promise.all([
        axios.get('/api/api/uploads'),
        axios.get('/api/api/students'),
      ]);

      const uploads = uploadsResponse.data;
      const students = studentsResponse.data;

      const colleges = [...new Set(uploads.map(upload => upload.college))];
      const specializations = [...new Set(students.map(student => student.specialization).filter(Boolean))];

      setStats({
        totalUploads: uploads.length,
        totalStudents: students.length,
        totalColleges: colleges.length,
        totalSpecializations: specializations.length,
      });

      setRecentUploads(uploads.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Uploads',
      value: stats.totalUploads,
      icon: <FilePresent />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: <PeopleIcon />,
      color: '#388e3c',
      bgColor: '#e8f5e8',
    },
    {
      title: 'Colleges',
      value: stats.totalColleges,
      icon: <SchoolIcon />,
      color: '#f57c00',
      bgColor: '#fff3e0',
    },
    {
      title: 'Specializations',
      value: stats.totalSpecializations,
      icon: <TrendingUp />,
      color: '#7b1fa2',
      bgColor: '#f3e5f5',
    },
  ];

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Welcome to StudyScope Analytics
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Transform your educational data into actionable insights with our comprehensive analytics platform
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <MotionCard
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  height: '100%',
                  background: `linear-gradient(45deg, ${card.bgColor} 30%, ${card.color}15 90%)`,
                  borderLeft: `4px solid ${card.color}`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: card.color }}>
                        {card.value}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {card.title}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: card.color, width: 56, height: 56 }}>
                      {card.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <MotionPaper
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              elevation={3}
              sx={{ p: 3, borderRadius: 3 }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<UploadIcon />}
                    href="/upload"
                    sx={{ py: 2, borderRadius: 2 }}
                  >
                    Upload Excel
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AnalyticsIcon />}
                    href="/analytics"
                    sx={{ py: 2, borderRadius: 2 }}
                  >
                    View Analytics
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<FilePresent />}
                    href="/files"
                    sx={{ py: 2, borderRadius: 2 }}
                  >
                    Manage Files
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PeopleIcon />}
                    href="/analytics"
                    sx={{ py: 2, borderRadius: 2 }}
                  >
                    Student Data
                  </Button>
                </Grid>
              </Grid>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <MotionPaper
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              elevation={3}
              sx={{ p: 3, borderRadius: 3 }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Uploads
              </Typography>
              <List>
                {recentUploads.length > 0 ? (
                  recentUploads.map((upload, index) => (
                    <ListItem key={upload._id} divider={index < recentUploads.length - 1}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <FilePresent />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={upload.originalName}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {upload.college}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={`${upload.recordCount} students`}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No uploads yet. Start by uploading an Excel file!
                  </Typography>
                )}
              </List>
            </MotionPaper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Dashboard;
