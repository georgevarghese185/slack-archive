const axios = require('axios')

const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  withCredentials: true
})

export const getAuthUrl = async () => {
  const { data } = await axiosInstance.get('/v1/login/auth-url')
  return data
}

export const login = async ({ verificationCode }) => {
  const { data } = await axiosInstance.post('/v1/login', { verificationCode })
  return data
}

export const logout = async () => {
  await axiosInstance.delete('/v1/login')
}

export const getMember = async ({ memberId }) => {
  const { data } = await axiosInstance.get(`/v1/member/${memberId}`)
  return data
}

export const getMessages = async (params) => {
  const { data } = await axiosInstance.get('/v1/messages', { params })
  return data
}
