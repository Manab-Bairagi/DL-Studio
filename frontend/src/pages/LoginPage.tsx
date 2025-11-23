import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'

const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const tokenResponse = await authApi.login({
        username: email,
        password,
      })
      
      // Get user info using the token directly (don't rely on store yet)
      const user = await authApi.getCurrentUser(tokenResponse.access_token)
      
      // Store both token and user
      setAuth(user, tokenResponse.access_token)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      let errorMsg = 'Login failed'
      
      if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout - backend server may be down'
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail
      } else if (err.message) {
        errorMsg = err.message
      }
      
      setError(errorMsg)
      // Clear auth on error
      useAuthStore.getState().clearAuth()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            DL Model Builder
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Typography variant="body2" align="center">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'inherit' }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default LoginPage

