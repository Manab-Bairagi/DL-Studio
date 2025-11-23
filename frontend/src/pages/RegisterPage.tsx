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

const RegisterPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Register the user
      await authApi.register({
        email,
        password,
        full_name: fullName || undefined,
      })
      
      // Step 2: Auto-login after registration
      try {
        const tokenResponse = await authApi.login({
          username: email,
          password,
        })
        
        // Step 3: Get user info using the token directly
        const user = await authApi.getCurrentUser(tokenResponse.access_token)
        setAuth(user, tokenResponse.access_token)
        navigate('/dashboard')
      } catch (loginErr: any) {
        // Registration succeeded but login failed
        console.error('Auto-login error:', loginErr)
        const errorMsg = loginErr.response?.data?.detail || loginErr.message || 'Login failed'
        setError(
          `Account created successfully! However, auto-login failed: ${errorMsg}. Please try logging in manually.`
        )
        // Navigate to login page after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (err: any) {
      // Registration failed
      setError(err.response?.data?.detail || 'Registration failed')
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
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sign up for DL Model Builder
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              margin="normal"
              autoComplete="name"
            />
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
              autoComplete="new-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <Typography variant="body2" align="center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'inherit' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default RegisterPage

