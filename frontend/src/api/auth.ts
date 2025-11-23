import apiClient from './client'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name?: string
}

export interface User {
  id: string  // MongoDB ObjectId as string
  email: string
  full_name: string | null
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const formData = new FormData()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    const response = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  getCurrentUser: async (token?: string): Promise<User> => {
    // If token is provided, use it directly; otherwise rely on interceptor
    const config = token ? {
      headers: {
        Authorization: `Bearer ${token}`
      }
    } : {}
    const response = await apiClient.get('/auth/me', config)
    return response.data
  },
}

