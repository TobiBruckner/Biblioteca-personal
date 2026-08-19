import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('usuario')
    if (token && storedUser) {
      try {
        setUsuario(JSON.parse(storedUser))
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (login, password) => {
    const res = await api.post('/auth/login', { login, password })
    const { access_token, refresh_token, usuario: user } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('usuario', JSON.stringify(user))
    setUsuario(user)
    return user
  }

  const register = async (username, email, password, nombre_completo) => {
    const res = await api.post('/auth/register', { username, email, password, nombre_completo })
    const { access_token, refresh_token, usuario: user } = res.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    localStorage.setItem('usuario', JSON.stringify(user))
    setUsuario(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const isAuthenticated = !!usuario

  return (
    <AuthContext.Provider value={{ usuario, login, register, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
