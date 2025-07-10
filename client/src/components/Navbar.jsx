import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Upload', path: '/upload', icon: <UploadIcon /> },
    { label: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
    { label: 'Files', path: '/files', icon: <FolderIcon /> },
  ];

  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
      <Container maxWidth="xl">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold' }}
          >
            📊 StudyScope Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
