import React from 'react'
import { Box, Typography, Button, Container, Grid, Paper, Chip, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { AutoAwesome, Speed, Architecture, Code, Storage, Cloud, ArrowForward } from '@mui/icons-material'

// Import assets
import heroBg from '../assets/hero_bg.png'
import featureBuilder from '../assets/feature_builder.png'
import featureOpt from '../assets/feature_opt.png'
import featureInf from '../assets/feature_inf.png'

const LandingPage = () => {
  const navigate = useNavigate()
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  const features = [
    {
      icon: <Architecture sx={{ fontSize: 40, color: '#ff5d00' }} />,
      title: 'Visual Builder',
      description: 'Drag-and-drop interface to design complex neural network architectures intuitively.',
      image: featureBuilder
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#ff5d00' }} />,
      title: 'AI Optimization',
      description: 'Leverage Gemini AI to analyze your models and get actionable hyperparameter suggestions.',
      image: featureOpt
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#ff5d00' }} />,
      title: 'Instant Inference',
      description: 'Run inference directly in the browser with real-time visualization of feature maps.',
      image: featureInf
    }
  ]

  const techStack = [
    { name: 'PyTorch', icon: <Code /> },
    { name: 'React', icon: <Code /> },
    { name: 'FastAPI', icon: <Speed /> },
    { name: 'MongoDB', icon: <Storage /> },
    { name: 'Docker', icon: <Cloud /> },
  ]

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#050505',
      color: '#fff',
      overflowX: 'hidden'
    }}>
      {/* Navbar */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 100, 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(5,5,5,0.8)'
      }}>
        <Container maxWidth="xl" sx={{ py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1 }} onClick={() => navigate('/')}>
            <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5d00' }} />
            DL <span style={{ color: '#ff5d00' }}>STUDIO</span>
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Button color="inherit" sx={{ mr: 2, '&:hover': { color: '#ff5d00' } }} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Features
            </Button>
            <Button color="inherit" sx={{ mr: 2, '&:hover': { color: '#ff5d00' } }} onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              How it Works
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/login')}
              sx={{ 
                borderRadius: 50, 
                px: 3, 
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                '&:hover': { borderColor: '#ff5d00', color: '#ff5d00' }
              }}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ 
        position: 'relative', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        pt: 10,
        overflow: 'hidden'
      }}>
        {/* Background Image with Overlay */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 0,
          opacity: 0.4
        }}>
          <img src={heroBg} alt="Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'radial-gradient(circle at center, transparent 0%, #050505 100%)' 
          }} />
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'linear-gradient(to bottom, transparent 0%, #050505 100%)' 
          }} />
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Chip 
                  label="v2.0 Now Available" 
                  sx={{ 
                    mb: 3, 
                    bgcolor: 'rgba(255, 93, 0, 0.1)', 
                    color: '#ff5d00', 
                    border: '1px solid rgba(255, 93, 0, 0.2)',
                    fontWeight: 600
                  }} 
                />
                <Typography variant="h1" sx={{ 
                  fontSize: { xs: '3.5rem', md: '6rem' },
                  lineHeight: 0.9,
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(180deg, #ffffff 0%, #888888 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-2px'
                }}>
                  BUILD AI<br />
                  <span style={{ color: 'transparent', WebkitTextStroke: '1px #ff5d00' }}>VISUALLY</span>
                </Typography>
                <Typography variant="body1" sx={{ mb: 5, maxWidth: '550px', fontSize: '1.2rem', color: '#a0a0a0', lineHeight: 1.6 }}>
                  The most advanced platform for designing, optimizing, and deploying deep learning models. No complex code required.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => navigate('/register')}
                    endIcon={<ArrowForward />}
                    sx={{ 
                      fontSize: '1rem',
                      py: 1.5,
                      px: 4,
                      bgcolor: '#ff5d00',
                      '&:hover': { bgcolor: '#e65100', boxShadow: '0 0 30px rgba(255, 93, 0, 0.4)' }
                    }}
                  >
                    Start Building
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    sx={{ 
                      fontSize: '1rem',
                      py: 1.5,
                      px: 4,
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                  >
                    Explore Features
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
               {/* Parallax Floating Elements */}
               <motion.div style={{ y: y1 }}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(20,20,20,0.8)', 
                    backdropFilter: 'blur(20px)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    mb: 2,
                    transform: 'rotate(-5deg)',
                    maxWidth: 300,
                    ml: 'auto'
                  }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.2)' }}>
                        <Architecture sx={{ color: '#3b82f6' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Conv2D Layer</Typography>
                        <Typography variant="caption" color="textSecondary">Kernel: 3x3 • Filters: 64</Typography>
                      </Box>
                    </Stack>
                  </Paper>
               </motion.div>
               <motion.div style={{ y: y2 }}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(20,20,20,0.8)', 
                    backdropFilter: 'blur(20px)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    mt: 4,
                    transform: 'rotate(5deg)',
                    maxWidth: 300
                  }}>
                    <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.2)' }}>
                        <AutoAwesome sx={{ color: '#10b981' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Optimization Complete</Typography>
                        <Typography variant="caption" color="textSecondary">Accuracy improved by 12%</Typography>
                      </Box>
                    </Stack>
                  </Paper>
               </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Tech Stack Marquee */}
      <Box sx={{ py: 4, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: '#0a0a0a' }}>
        <Container maxWidth="lg">
          <Typography variant="caption" align="center" display="block" sx={{ mb: 3, color: '#666', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Powered by Modern Tech Stack
          </Typography>
          <Grid container justifyContent="center" spacing={4}>
            {techStack.map((tech, i) => (
              <Grid item key={i}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#888' }}>
                  {tech.icon}
                  <Typography variant="body2" fontWeight={600}>{tech.name}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 15, position: 'relative' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
              Everything you need to <span style={{ color: '#ff5d00' }}>master AI</span>
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              From prototyping to production, DL Studio provides a comprehensive suite of tools for deep learning engineers.
            </Typography>
          </Box>

          {features.map((feature, index) => (
            <Grid container spacing={8} alignItems="center" sx={{ mb: 15, flexDirection: index % 2 === 1 ? 'row-reverse' : 'row' }} key={index}>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>{feature.title}</Typography>
                  <Typography variant="body1" sx={{ color: '#a0a0a0', fontSize: '1.1rem', lineHeight: 1.7, mb: 4 }}>
                    {feature.description}
                  </Typography>
                  <Button variant="text" sx={{ color: '#ff5d00', p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }} endIcon={<ArrowForward />}>
                    Learn more
                  </Button>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Box sx={{ 
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -20,
                      background: 'radial-gradient(circle, rgba(255,93,0,0.2) 0%, transparent 70%)',
                      zIndex: -1
                    }
                  }}>
                    <img 
                      src={feature.image} 
                      alt={feature.title} 
                      style={{ 
                        width: '100%', 
                        borderRadius: '16px', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                      }} 
                    />
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          ))}
        </Container>
      </Box>

      {/* How It Works */}
      <Box id="how-it-works" sx={{ py: 15, bgcolor: '#0a0a0a' }}>
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" sx={{ fontWeight: 800, mb: 8 }}>
            How it <span style={{ color: '#ff5d00' }}>Works</span>
          </Typography>
          <Grid container spacing={4}>
            {[
              { step: '01', title: 'Design', desc: 'Drag and drop layers to build your architecture.' },
              { step: '02', title: 'Optimize', desc: 'Let AI analyze and suggest improvements.' },
              { step: '03', title: 'Deploy', desc: 'Export your model or run inference instantly.' }
            ].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper sx={{ 
                  p: 4, 
                  height: '100%', 
                  bgcolor: '#111', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-10px)', borderColor: '#ff5d00' }
                }}>
                  <Typography variant="h1" sx={{ color: 'rgba(255,255,255,0.05)', fontWeight: 900, mb: 2 }}>{item.step}</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{item.title}</Typography>
                  <Typography variant="body2" color="textSecondary">{item.desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 20, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: '100%', 
          height: '100%', 
          background: 'radial-gradient(circle, rgba(255,93,0,0.15) 0%, transparent 70%)', 
          zIndex: -1 
        }} />
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
            Ready to build the future?
          </Typography>
          <Typography variant="h5" sx={{ color: '#a0a0a0', mb: 6, fontWeight: 400 }}>
            Join thousands of developers using DL Studio to create state-of-the-art models.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/register')}
            sx={{ 
              fontSize: '1.2rem',
              py: 2,
              px: 6,
              bgcolor: '#ff5d00',
              borderRadius: 50,
              '&:hover': { bgcolor: '#e65100', boxShadow: '0 0 40px rgba(255, 93, 0, 0.5)' }
            }}
          >
            Get Started for Free
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, borderTop: '1px solid rgba(255,255,255,0.05)', bgcolor: '#050505' }}>
        <Container maxWidth="lg">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="caption" color="textSecondary">
                © 2025 DL Studio. All rights reserved.
              </Typography>
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={3}>
                <Typography variant="caption" color="textSecondary" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>Privacy</Typography>
                <Typography variant="caption" color="textSecondary" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>Terms</Typography>
                <Typography variant="caption" color="textSecondary" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' } }}>Contact</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage
