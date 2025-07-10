import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
import { Favorite, GitHub, LinkedIn } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        py: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Made with <Favorite sx={{ color: 'red', fontSize: 16 }} /> by{' '}
            <Typography component="span" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              Aditya Garg
            </Typography>
          </Typography>
          
          <Typography variant="body2" color="inherit">
            StudyScope Analytics © {new Date().getFullYear()}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href="https://github.com/qAditya"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'inherit',
                '&:hover': { color: 'warning.main' },
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <GitHub fontSize="small" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/aditya-garg-979764210/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'inherit',
                '&:hover': { color: 'warning.main' },
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LinkedIn fontSize="small" />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
