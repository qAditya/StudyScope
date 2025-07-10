import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import axios from 'axios';

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

const Upload = () => {
  const [file, setFile] = useState(null);
  const [college, setCollege] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');

  const onDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setError('Please upload only Excel files (.xlsx, .xls)');
      return;
    }
    
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file || !college.trim()) {
      setError('Please select a file and enter college name');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('excel', file);
    formData.append('college', college.trim());

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult({
        success: true,
        message: 'File uploaded and processed successfully!',
        fileName: file.name,
        college: college,
      });
      
      setFile(null);
      setCollege('');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data || 'Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCollege('');
    setError('');
    setUploadResult(null);
  };

  return (
    <Container maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Upload Excel File
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Upload student data to analyze and visualize analytics
          </Typography>
        </Box>

        {uploadResult && (
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon />
                <Box>
                  <Typography variant="h6">Upload Successful!</Typography>
                  <Typography variant="body2">
                    {uploadResult.fileName} has been processed for {uploadResult.college}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </MotionCard>
        )}

        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          elevation={3}
          sx={{ p: 4, borderRadius: 3 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="College Name"
                variant="outlined"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                disabled={uploading}
                sx={{ mb: 3 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                {...getRootProps()}
                sx={{
                  border: `2px dashed ${isDragActive ? '#1976d2' : '#ccc'}`,
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'action.hover' : 'background.default',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: isDragActive ? 'primary.main' : 'text.secondary',
                    mb: 2 
                  }} 
                />
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop the Excel file here' : 'Drag & drop an Excel file here'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  or click to select a file
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supported formats: .xlsx, .xls
                </Typography>
              </Box>
            </Grid>

            {file && (
              <Grid item xs={12}>
                <MotionCard
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  variant="outlined"
                  sx={{ bgcolor: 'grey.50' }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DescriptionIcon color="primary" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {file.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                      <Chip label="Excel File" color="primary" size="small" />
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            )}

            {error && (
              <Grid item xs={12}>
                <Alert 
                  severity="error" 
                  icon={<ErrorIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  {error}
                </Alert>
              </Grid>
            )}

            {uploading && (
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Processing file...
                  </Typography>
                  <LinearProgress sx={{ borderRadius: 1 }} />
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={uploading}
                  sx={{ borderRadius: 2 }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!file || !college.trim() || uploading}
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </MotionPaper>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} lg={8}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              elevation={2}
              sx={{ p: 3, borderRadius: 3, bgcolor: 'info.light', color: 'info.contrastText' }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                📋 Excel File Format Requirements
              </Typography>
              <Typography variant="body2" gutterBottom>
                Your Excel file must follow this exact column structure for proper processing:
              </Typography>
              
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, color: 'text.primary' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Required Columns:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" component="div">
                      <strong>Basic Information:</strong>
                      <ul style={{ marginTop: 4, marginBottom: 8 }}>
                        <li><code>Student Name</code> - Full name of student</li>
                        <li><code>Age</code> - Student's age (number)</li>
                        <li><code>Gender</code> - Male/Female</li>
                        <li><code>Specialization</code> - Field of study</li>
                      </ul>
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" component="div">
                      <strong>Semester Marks:</strong>
                      <ul style={{ marginTop: 4, marginBottom: 8 }}>
                        <li><code>Sem1_Course1_CT</code></li>
                        <li><code>Sem1_Course1_Mid</code></li>
                        <li><code>Sem1_Course1_Final</code></li>
                        <li>... continue for all courses</li>
                      </ul>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              elevation={2}
              sx={{ p: 3, borderRadius: 3, bgcolor: 'success.light', color: 'success.contrastText' }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                💡 Pro Tips
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  <li>Keep column names exactly as specified</li>
                  <li>Use numbers for marks (0-100)</li>
                  <li>Don't leave empty cells - use 0 if needed</li>
                  <li>Save as .xlsx or .xls format</li>
                  <li>First row should contain column headers</li>
                </ul>
              </Typography>
            </MotionPaper>
          </Grid>

          <Grid item xs={12}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              elevation={2}
              sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                📊 Sample Excel Structure
              </Typography>
              <Typography variant="body2" gutterBottom>
                Here's exactly how your Excel file should look:
              </Typography>
              
              <Box sx={{ mt: 2, overflow: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  color: '#333'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1976d2', color: 'white' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '120px' }}>Student Name</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '50px' }}>Age</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '70px' }}>Gender</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '120px' }}>Specialization</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '80px' }}>Sem1_Course1_CT</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '80px' }}>Sem1_Course1_Mid</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '90px' }}>Sem1_Course1_Final</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '80px' }}>Sem1_Course2_CT</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '20px' }}>...</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>John Doe</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>20</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>Male</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>Computer Science</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>85</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>90</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>92</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>78</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>...</td>
                    </tr>
                    <tr style={{ backgroundColor: 'white' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>Jane Smith</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>19</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>Female</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>Mechanical Eng</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>88</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>87</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>89</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>82</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>...</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>Mike Johnson</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>21</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>Male</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>Electrical Eng</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>75</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>80</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>85</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>79</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>...</td>
                    </tr>
                  </tbody>
                </table>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>Column Naming Pattern:</strong> <code>Sem{'{'}N{'}'}_Course{'{'}N{'}'}_{'{'}Type{'}'}</code><br/>
                  <strong>Example:</strong> <code>Sem1_Course1_CT</code>, <code>Sem1_Course1_Mid</code>, <code>Sem1_Course1_Final</code><br/>
                  <strong>Continue for all semesters and courses:</strong> <code>Sem2_Course1_CT</code>, <code>Sem2_Course2_Mid</code>, etc.
                </Typography>
              </Alert>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionPaper
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              elevation={2}
              sx={{ p: 3, borderRadius: 3, bgcolor: 'error.light', color: 'error.contrastText' }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                ❌ Common Mistakes to Avoid
              </Typography>
              <Typography variant="body2" component="div">
                <ul style={{ marginTop: 8, marginBottom: 0 }}>
                  <li>Spelling mistakes in column names</li>
                  <li>Missing or extra spaces in headers</li>
                  <li>Using text instead of numbers for marks</li>
                  <li>Empty cells (use 0 instead)</li>
                  <li>Inconsistent semester/course numbering</li>
                  <li>Wrong file format (not .xlsx or .xls)</li>
                </ul>
              </Typography>
            </MotionPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <MotionPaper
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              elevation={2}
              sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                ✅ What Happens After Upload?
              </Typography>
              <Typography variant="body2" component="div">
                <ol style={{ marginTop: 8, marginBottom: 0 }}>
                  <li>File validation and processing</li>
                  <li>Student data extraction</li>
                  <li>Marks calculation and analysis</li>
                  <li>Data storage in database</li>
                  <li>Interactive analytics generation</li>
                  <li>Ready for visualization!</li>
                </ol>
              </Typography>
            </MotionPaper>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default Upload;
