import { ReactNode, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  BuildCircle,
  Lightbulb,
  Tune,
  Logout,
  Settings,
} from '@mui/icons-material'
import { useAuthStore } from '../store/authStore'
import { keyframes } from '@mui/material/styles'

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, clearAuth } = useAuthStore()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
    handleMenuClose()
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Dashboard },
    { label: 'Builder', path: '/builder', icon: BuildCircle },
    { label: 'Inference', path: '/inference', icon: Lightbulb },
    { label: 'Optimize', path: '/optimize', icon: Tune },
  ]

  const isActive = (path: string) => location.pathname === path

  const DrawerContent = () => (
    <Box sx={{ width: 280, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        🤖 DL Studio
      </Typography>
      <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  setDrawerOpen(false)
                }}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  background: isActive(item.path)
                    ? 'linear-gradient(135deg, #ff5d00 0%, #ff8e33 100%)'
                    : 'transparent',
                  '&:hover': {
                    background: isActive(item.path)
                      ? 'linear-gradient(135deg, #ff5d00 0%, #ff8e33 100%)'
                      : 'rgba(255, 93, 0, 0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--primary-dark)' }}>
      {/* Enhanced AppBar */}
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2d2d2d 100%)',
          borderBottom: '1px solid #3f3f3f',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          animation: `${slideDown} 0.4s ease`,
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ py: 1.5 }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(!drawerOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            onClick={() => navigate('/')}
            sx={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ff5d00 0%, #ff8e33 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              🤖 DL Studio
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, ml: 4, flex: 1 }}>
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Tooltip key={item.path} title={item.label}>
                    <Button
                      onClick={() => navigate(item.path)}
                      startIcon={<Icon />}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        borderRadius: 1,
                        color: isActive(item.path) ? '#ff5d00' : '#e0e0e0',
                        background: isActive(item.path)
                          ? 'rgba(255, 93, 0, 0.1)'
                          : 'transparent',
                        border: isActive(item.path) ? '1px solid #ff5d00' : '1px solid transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 93, 0, 0.15)',
                          borderColor: '#ff5d00',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(255, 93, 0, 0.2)',
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  </Tooltip>
                )
              })}
            </Box>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!isMobile && (
                <Typography variant="body2" sx={{ color: '#bdbdbd' }}>
                  {user?.email}
                </Typography>
              )}

              {/* User Avatar Menu */}
              <Tooltip title="Account menu">
                <Avatar
                  onClick={handleMenuOpen}
                  sx={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(135deg, #ff5d00 0%, #ff8e33 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 0 12px rgba(255, 93, 0, 0.4)',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {user?.email?.charAt(0).toUpperCase()}
                </Avatar>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        anchor="left"
        sx={{
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            borderRight: '1px solid #3f3f3f',
          },
        }}
      >
        <DrawerContent />
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            border: '1px solid #3f3f3f',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            borderRadius: 1.5,
          },
        }}
      >
        <MenuItem disabled sx={{ opacity: 0.7 }}>
          <Typography variant="caption" sx={{ color: '#bdbdbd' }}>
            {user?.email}
          </Typography>
        </MenuItem>
        <Divider sx={{ borderColor: '#3f3f3f' }} />
        <MenuItem onClick={() => navigate('/settings')} sx={{ gap: 1.5 }}>
          <Settings fontSize="small" />
          <span>Settings</span>
        </MenuItem>
        <Divider sx={{ borderColor: '#3f3f3f' }} />
        <MenuItem onClick={handleLogout} sx={{ gap: 1.5, color: '#ef4444' }}>
          <Logout fontSize="small" />
          <span>Logout</span>
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ my: 3, flex: 1, pb: 4 }}>
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: '1px solid #3f3f3f',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
          py: 2,
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="caption" sx={{ color: '#757575', textAlign: 'center', display: 'block' }}>
            © 2025 DL Studio | Built with modern deep learning tools
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Layout

