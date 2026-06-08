import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'
const SERVER_BASE_URL = API_BASE.replace('/api', '')

export const uploadMediaFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await axios.post(`${API_BASE}/uploads/media`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  const url = res.data.url?.startsWith('http')
    ? res.data.url
    : `${SERVER_BASE_URL}${res.data.url}`

  return {
    ...res.data,
    url
  }
}