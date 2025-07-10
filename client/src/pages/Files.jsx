import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  FilePresent as FilePresentIcon,
  School as SchoolIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

const Files = () => {
  const [uploads, setUploads] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await axios.get('/api/api/uploads');
      setUploads(response.data);
    } catch (error) {
      console.error('Error fetching uploads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByUpload = async (uploadId) => {
    try {
      const response = await axios.get(`/api/api/students?upload=${uploadId}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleViewDetails = async (upload) => {
    setSelectedUpload(upload);
    await fetchStudentsByUpload(upload._id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUpload(null);
    setStudents([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const studentColumns = [
    { field: 'name', headerName: 'Student Name', width: 200 },
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'gender', headerName: 'Gender', width: 120 },
    { field: 'specialization', headerName: 'Specialization', width: 200 },
    {
      field: 'semesters',
      headerName: 'Semesters',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value?.length || 0} 
          size="small" 
          color="primary"
        />
      ),
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ textAlign: 'center', mt: 4 }}>
          Loading files...
        </Typography>
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
            📁 File Management
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage and view details of uploaded Excel files
          </Typography>
        </Box>

        {uploads.length === 0 ? (
          <MotionPaper
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            elevation={2}
            sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}
          >
            <FilePresentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No files uploaded yet
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Start by uploading an Excel file to see it here
            </Typography>
            <Button 
              variant="contained" 
              href="/upload"
              sx={{ mt: 2, borderRadius: 2 }}
            >
              Upload First File
            </Button>
          </MotionPaper>
        ) : (
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            elevation={3}
            sx={{ borderRadius: 3, overflow: 'hidden' }}
          >
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>File Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>College</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Students</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Specializations</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Upload Date</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploads.map((upload, index) => (
                    <motion.tr
                      key={upload._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      component={TableRow}
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FilePresentIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {upload.originalName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {upload.fileName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<SchoolIcon />}
                          label={upload.college}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<PeopleIcon />}
                          label={upload.recordCount}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {upload.specializations?.slice(0, 2).map((spec, idx) => (
                            <Chip
                              key={idx}
                              label={spec}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {upload.specializations?.length > 2 && (
                            <Chip
                              label={`+${upload.specializations.length - 2}`}
                              size="small"
                              color="secondary"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(upload.uploadDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(upload)}
                            title="View Details"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            href={`/analytics`}
                            title="View Analytics"
                          >
                            <AnalyticsIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MotionPaper>
        )}

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FilePresentIcon />
              {selectedUpload?.originalName}
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedUpload && (
              <>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <MotionCard
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}
                    >
                      <CardContent>
                        <PeopleIcon sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          {selectedUpload.recordCount}
                        </Typography>
                        <Typography variant="body2">
                          Total Students
                        </Typography>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MotionCard
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white' }}
                    >
                      <CardContent>
                        <SchoolIcon sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          1
                        </Typography>
                        <Typography variant="body2">
                          College
                        </Typography>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <MotionCard
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      sx={{ textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}
                    >
                      <CardContent>
                        <AnalyticsIcon sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          {selectedUpload.specializations?.length || 0}
                        </Typography>
                        <Typography variant="body2">
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
                      sx={{ textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}
                    >
                      <CardContent>
                        <FilePresentIcon sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold">
                          Active
                        </Typography>
                        <Typography variant="body2">
                          Status
                        </Typography>
                      </CardContent>
                    </MotionCard>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    File Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>College:</strong> {selectedUpload.college}<br />
                    <strong>Upload Date:</strong> {formatDate(selectedUpload.uploadDate)}<br />
                    <strong>File Name:</strong> {selectedUpload.fileName}
                  </Typography>
                </Alert>

                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={students}
                    columns={studentColumns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    getRowId={(row) => row._id}
                    disableSelectionOnClick
                    sx={{
                      '& .MuiDataGrid-cell:hover': {
                        color: 'primary.main',
                      },
                    }}
                  />
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
              Close
            </Button>
            <Button 
              variant="contained" 
              href="/analytics"
              sx={{ borderRadius: 2 }}
            >
              View Analytics
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default Files;
