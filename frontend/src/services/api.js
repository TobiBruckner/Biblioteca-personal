import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) throw new Error('No refresh token')
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        })
        localStorage.setItem('access_token', res.data.access_token)
        originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`
        return api(originalRequest)
      } catch (e) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('usuario')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const usuariosAPI = {
  listar: (search = '') => api.get('/usuarios', { params: search ? { search } : {} }).then(r => r.data),
  detalle: (id) => api.get(`/usuarios/${id}`).then(r => r.data),
  biblioteca: (id, params = {}) => api.get(`/usuarios/${id}/libros`, { params }).then(r => r.data)
}

export default api
