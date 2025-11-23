import React from 'react'
import { Box, Typography, Button, Container, Grid, Paper, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AutoAwesome, Speed, Security, Architecture } from '@mui/icons-material'

const LandingPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()

  const features = [
    {
      icon: <Architecture sx={{ fontSize: 40, color: '#ff5d00' }} />,
      title: 'Visual Builder',
      description: 'Drag-and-drop interface to design complex neural network architectures intuitively.'
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#ff5d00' }} />,
      title: 'AI Optimization',
      description: 'Leverage Gemini AI to analyze your models and get actionable hyperparameter suggestions.'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#ff5d00' }} />,
      title: 'Instant Inference',
      description: 'Run inference directly in the browser with real-time visualization of feature maps.'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#ff5d00' }} />,
      title: 'Secure & Private',
      description: 'Your models and data are processed securely with enterprise-grade protection.'
    }
  ]

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at 50% 0%, #1a0a00 0%, #050505 60%)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Navbar */}
      <Container maxWidth="xl" sx={{ py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '1px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          DL <span style={{ color: '#ff5d00' }}>STUDIO</span>
        </Typography>
        <Box>
          <Button color="inherit" sx={{ mr: 2 }} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Features
          </Button>
          <Button color="inherit" sx={{ mr: 2 }} onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
            About
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/login')}
            sx={{ borderRadius: 50, px: 3 }}
          >
            Login
          </Button>
        </Box>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 12, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography variant="caption" sx={{ 
                color: '#ff5d00', 
                fontWeight: 700, 
                letterSpacing: '2px', 
                textTransform: 'uppercase',
                mb: 2,
                display: 'block'
              }}>
                Deep Learning Model Builder
              </Typography>
              <Typography variant="h1" sx={{ 
                fontSize: { xs: '3rem', md: '5rem' },
                lineHeight: 0.9,
                mb: 3,
                background: 'linear-gradient(180deg, #ffffff 0%, #666666 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                DL<br />STUDIO
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: '500px', fontSize: '1.1rem', color: '#a0a0a0' }}>
                Build, visualize, and optimize deep learning models with our intuitive drag-and-drop interface. From architecture design to inference testing – all in one platform.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    fontSize: '1rem',
                    py: 1.5,
                    px: 4,
                    boxShadow: '0 0 30px rgba(255, 93, 0, 0.3)'
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ 
                    fontSize: '1rem',
                    py: 1.5,
                    px: 4
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Box sx={{ 
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '120%',
                  height: '120%',
                  background: 'radial-gradient(circle, rgba(255, 93, 0, 0.2) 0%, rgba(0,0,0,0) 70%)',
                  zIndex: -1
                }
              }}>
                {/* Abstract UI Representation */}
                <Paper sx={{ 
                  p: 0, 
                  overflow: 'hidden', 
                  borderRadius: 4,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(10, 10, 10, 0.8)',
                  backdropFilter: 'blur(20px)',
                  transform: 'perspective(1000px) rotateY(-10deg) rotateX(5deg)',
                  boxShadow: '20px 20px 60px rgba(0,0,0,0.5)'
                }}>
                  <Box sx={{ height: '400px', background: 'linear-gradient(135deg, #1a1a1a 0%, #050505 100%)', position: 'relative' }}>
                    {/* Mock UI Elements */}
                    <Box sx={{ p: 2, borderBottom: '1px solid #333', display: 'flex', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5d00' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#333' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#333' }} />
                    </Box>
                    <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Box sx={{ 
                        width: 150, 
                        height: 150, 
                        borderRadius: '50%', 
                        border: '2px solid #ff5d00',
                        boxShadow: '0 0 50px rgba(255, 93, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography variant="h3" sx={{ color: '#ff5d00' }}>AI</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* About Section */}
      <Box id="about" sx={{ py: 10, background: '#0a0a0a' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ mb: 2, textAlign: 'center' }}>
            About <span style={{ color: '#ff5d00' }}>DL Studio</span>
          </Typography>
          <Typography variant="body1" sx={{ mb: 8, textAlign: 'center', maxWidth: '800px', mx: 'auto', color: '#a0a0a0' }}>
            A comprehensive platform for building, visualizing, and optimizing deep learning models. 
            Design neural networks visually, test them instantly, and get AI-powered suggestions for improvements.
          </Typography>

      {/* Features Section */}
      <Box id="features">
          <Typography variant="h3" sx={{ mb: 6, textAlign: 'center' }}>
            Key <span style={{ color: '#ff5d00' }}>Features</span>
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper sx={{ 
                  p: 4, 
                  height: '100%', 
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    borderColor: '#ff5d00',
                    background: 'rgba(255, 93, 0, 0.05)'
                  }
                }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>{feature.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, borderTop: '1px solid #1f1f1f', textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          © 2025 DL Studio. Build, Visualize, Optimize.
        </Typography>
      </Box>
    </Box>
  )
}

export default LandingPage
