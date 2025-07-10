import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Avatar,
  IconButton,
  Breadcrumbs,
  Link,
  Alert,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Analytics as AnalyticsIcon,
  School as SchoolIcon,
  TrendingUp,
  People as PeopleIcon,
  ArrowBack,
  Visibility,
  Grade,
  Assessment,
  Person,
} from '@mui/icons-material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

const VIEW_STATES = {
  OVERVIEW: 'overview',
  SPECIALIZATION: 'specialization',
  COURSE: 'course',
  STUDENT: 'student'
};

const Analytics = () => {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState(VIEW_STATES.OVERVIEW);
  const [specializationData, setSpecializationData] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetailsOpen, setStudentDetailsOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  useEffect(() => {
    fetchSpecializationAnalytics();
  }, [selectedUpload, genderFilter]);

  const fetchUploads = async () => {
    try {
      const response = await axios.get('/api/uploads');
      setUploads(response.data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializationAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedUpload !== 'all') params.append('upload', selectedUpload);
      if (genderFilter !== 'all') params.append('gender', genderFilter);
      
      const response = await axios.get(`/api/analytics/specializations?${params}`);
      setSpecializationData(response.data);
    } catch (error) {
      console.error('Error fetching specialization analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(`/api/students/${studentId}/details`);
      setStudentDetails(response.data);
      setStudentDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const handleSpecializationClick = (specialization) => {
    setSelectedSpecialization(specialization);
    setCurrentView(VIEW_STATES.SPECIALIZATION);
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCurrentView(VIEW_STATES.COURSE);
  };

  const handleStudentClick = (student) => {
    fetchStudentDetails(student.id);
  };

  const handleBackClick = () => {
    if (currentView === VIEW_STATES.COURSE) {
      setCurrentView(VIEW_STATES.SPECIALIZATION);
      setSelectedCourse(null);
    } else if (currentView === VIEW_STATES.SPECIALIZATION) {
      setCurrentView(VIEW_STATES.OVERVIEW);
      setSelectedSpecialization(null);
    }
  };

  const getSpecializationChartData = () => {
    return {
      labels: specializationData.map(item => item.specialization),
      datasets: [{
        label: 'Average Percentage',
        data: specializationData.map(item => item.averagePercentage.toFixed(1)),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'
        ],
        borderColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'
        ],
        borderWidth: 2,
      }]
    };
  };

  const getCourseChartData = () => {
    if (!selectedSpecialization) return { labels: [], datasets: [] };
    
    return {
      labels: selectedSpecialization.courses.map(course => 
        `${course.courseName} (Sem ${course.semester})`
      ),
      datasets: [{
        label: 'Average Percentage',
        data: selectedSpecialization.courses.map(course => course.averagePercentage.toFixed(1)),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        }
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && currentView === VIEW_STATES.OVERVIEW) {
        const index = elements[0].index;
        handleSpecializationClick(specializationData[index]);
      } else if (elements.length > 0 && currentView === VIEW_STATES.SPECIALIZATION) {
        const index = elements[0].index;
        handleCourseClick(selectedSpecialization.courses[index]);
      }
    }
  };

  const renderBreadcrumbs = () => (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
      <Link
        color={currentView === VIEW_STATES.OVERVIEW ? "primary" : "inherit"}
        href="#"
        onClick={() => setCurrentView(VIEW_STATES.OVERVIEW)}
        underline="hover"
      >
        Overview
      </Link>
      {currentView !== VIEW_STATES.OVERVIEW && (
        <Link
          color={currentView === VIEW_STATES.SPECIALIZATION ? "primary" : "inherit"}
          href="#"
          onClick={() => setCurrentView(VIEW_STATES.SPECIALIZATION)}
          underline="hover"
        >
          {selectedSpecialization?.specialization}
        </Link>
      )}
      {currentView === VIEW_STATES.COURSE && (
        <Typography color="primary">
          {selectedCourse?.courseName} (Sem {selectedCourse?.semester})
        </Typography>
      )}
    </Breadcrumbs>
  );

  const renderOverviewStats = () => {
    const totalStudents = specializationData.reduce((sum, spec) => sum + spec.totalStudents, 0);
    const overallAverage = specializationData.length > 0 
      ? specializationData.reduce((sum, spec) => sum + spec.averagePercentage, 0) / specializationData.length
      : 0;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            sx={{ textAlign: 'center', borderLeft: '4px solid #1976d2' }}
          >
            <CardContent>
              <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {overallAverage.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Average
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            sx={{ textAlign: 'center', borderLeft: '4px solid #388e3c' }}
          >
            <CardContent>
              <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Students
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            sx={{ textAlign: 'center', borderLeft: '4px solid #f57c00' }}
          >
            <CardContent>
              <SchoolIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                {specializationData.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Specializations
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            sx={{ textAlign: 'center', borderLeft: '4px solid #7b1fa2' }}
          >
            <CardContent>
              <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {uploads.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data Files
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    );
  };

  const renderOverviewView = () => (
    <AnimatePresence>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <MotionPaper
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            elevation={3}
            sx={{ p: 3, borderRadius: 3 }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Average Performance by Specialization
              <Typography variant="body2" color="text.secondary">
                Click on bars to drill down into courses
              </Typography>
            </Typography>
            <Box sx={{ height: 400 }}>
              {specializationData.length > 0 ? (
                <Bar data={getSpecializationChartData()} options={chartOptions} />
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', mt: 10 }}>
                  No data available
                </Typography>
              )}
            </Box>
          </MotionPaper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <MotionPaper
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            elevation={3}
            sx={{ p: 3, borderRadius: 3 }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Detailed Rankings
            </Typography>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {specializationData.map((spec, index) => (
                <Card
                  key={spec.specialization}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => handleSpecializationClick(spec)}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: `hsl(${index * 60}, 70%, 50%)` }}>
                        {index + 1}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {spec.specialization}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {spec.totalStudents} students
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={spec.averagePercentage}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="primary">
                          {spec.averagePercentage.toFixed(1)}% average
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </MotionPaper>
        </Grid>
      </Grid>
    </AnimatePresence>
  );

  const renderSpecializationView = () => (
    <AnimatePresence>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            elevation={3}
            sx={{ p: 3, borderRadius: 3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <IconButton onClick={handleBackClick}>
                <ArrowBack />
              </IconButton>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {selectedSpecialization?.specialization}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSpecialization?.totalStudents} students • {selectedSpecialization?.averagePercentage.toFixed(1)}% average
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Course Performance
                  <Typography variant="body2" color="text.secondary">
                    Click on bars to see individual student scores
                  </Typography>
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Bar data={getCourseChartData()} options={chartOptions} />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Top Performing Students
                </Typography>
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {selectedSpecialization?.students.slice(0, 10).map((student, index) => (
                    <Card
                      key={student.id}
                      sx={{
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      onClick={() => handleStudentClick(student)}
                    >
                      <CardContent sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2">
                              {student.name}
                            </Typography>
                            <Typography variant="caption" color="primary">
                              {student.percentage.toFixed(1)}%
                            </Typography>
                          </Box>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </MotionPaper>
        </Grid>
      </Grid>
    </AnimatePresence>
  );

  const renderCourseView = () => (
    <AnimatePresence>
      <MotionPaper
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        elevation={3}
        sx={{ p: 3, borderRadius: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={handleBackClick}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {selectedCourse?.courseName} - Semester {selectedCourse?.semester}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedCourse?.studentCount} students • {selectedCourse?.averagePercentage.toFixed(1)}% average
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>CT</TableCell>
                <TableCell>Mid</TableCell>
                <TableCell>Final</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Percentage</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedCourse?.students.map((student, index) => (
                <TableRow 
                  key={student.name}
                  sx={{ 
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: index < 3 ? 'success.light' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Chip 
                      label={index + 1} 
                      size="small"
                      color={index === 0 ? 'warning' : index < 3 ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell fontWeight="bold">{student.name}</TableCell>
                  <TableCell>{student.ct}</TableCell>
                  <TableCell>{student.mid}</TableCell>
                  <TableCell>{student.final}</TableCell>
                  <TableCell fontWeight="bold">{student.marks}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${student.percentage.toFixed(1)}%`}
                      color={student.percentage >= 80 ? 'success' : student.percentage >= 60 ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleStudentClick(student)}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MotionPaper>
    </AnimatePresence>
  );

  const renderStudentDetailsDialog = () => (
    <Dialog
      open={studentDetailsOpen}
      onClose={() => setStudentDetailsOpen(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Person />
          {studentDetails?.student.name} - Detailed Statistics
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {studentDetails && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Person sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h6">{studentDetails.student.name}</Typography>
                  <Typography variant="body2">
                    Age: {studentDetails.student.age} | Gender: {studentDetails.student.gender}
                  </Typography>
                  <Typography variant="body2">
                    {studentDetails.student.specialization}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Overall Performance</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Grade color="primary" />
                    <Typography variant="h4" color="primary">
                      {studentDetails.statistics.overallPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total: {studentDetails.statistics.totalMarks} / {studentDetails.statistics.totalMaxMarks}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={studentDetails.statistics.overallPercentage}
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Semester-wise Performance</Typography>
              {studentDetails.statistics.semesters.map((semester) => (
                <Card key={semester.semester} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Semester {semester.semester} - {semester.percentage.toFixed(1)}%
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Course</TableCell>
                            <TableCell>CT</TableCell>
                            <TableCell>Mid</TableCell>
                            <TableCell>Final</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Percentage</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {semester.courses.map((course, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{course.name}</TableCell>
                              <TableCell>{course.ct}</TableCell>
                              <TableCell>{course.mid}</TableCell>
                              <TableCell>{course.final}</TableCell>
                              <TableCell fontWeight="bold">{course.total}</TableCell>
                              <TableCell>
                                <Chip
                                  label={`${course.percentage.toFixed(1)}%`}
                                  size="small"
                                  color={course.percentage >= 80 ? 'success' : course.percentage >= 60 ? 'warning' : 'error'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setStudentDetailsOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h4">Loading analytics...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            📊 Interactive Student Analytics
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Click on charts and elements to drill down into detailed analytics
          </Typography>
        </Box>

        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          elevation={2}
          sx={{ p: 3, mb: 3, borderRadius: 3 }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Filters & Navigation
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Upload File</InputLabel>
                <Select
                  value={selectedUpload}
                  label="Upload File"
                  onChange={(e) => setSelectedUpload(e.target.value)}
                >
                  <MenuItem value="all">All Files</MenuItem>
                  {uploads.map((upload) => (
                    <MenuItem key={upload._id} value={upload._id}>
                      {upload.originalName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={genderFilter}
                  label="Gender"
                  onChange={(e) => setGenderFilter(e.target.value)}
                >
                  <MenuItem value="all">All Genders</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              {renderBreadcrumbs()}
            </Grid>
          </Grid>
        </MotionPaper>

        {currentView === VIEW_STATES.OVERVIEW && renderOverviewStats()}

        {currentView === VIEW_STATES.OVERVIEW && renderOverviewView()}
        {currentView === VIEW_STATES.SPECIALIZATION && renderSpecializationView()}
        {currentView === VIEW_STATES.COURSE && renderCourseView()}

        {renderStudentDetailsDialog()}

        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            🎯 How to Navigate:
          </Typography>
          <Typography variant="body2">
            • Click on specialization bars to see course performance<br/>
            • Click on course bars to see individual student scores<br/>
            • Click on student names to view detailed statistics<br/>
            • Use breadcrumbs to navigate back to previous views
          </Typography>
        </Alert>
      </motion.div>
    </Container>
  );
};

export default Analytics;
