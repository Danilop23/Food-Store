
import axios from 'axios'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.info('La sesión no está autenticada o ha expirado.')
    }

    return Promise.reject(error)
  },
)
