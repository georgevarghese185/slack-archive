import axios from 'axios'
import qs from 'query-string'
import { v4 as uuid } from 'uuid'

export const isLoggedIn = () => {
  return localStorage.getItem('loggedIn') === 'true'
}

export const startLogin = async () => {
  const { data: { url, parameters } } = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/v1/login/auth-url`)

  const loginId = uuid()
  localStorage.setItem('loginId', loginId)
  parameters.state = qs.stringify({ loginId })

  const redirect = qs.stringifyUrl({ url, query: parameters })
  window.location.href = redirect
}

export const completeLogin = async (code, state) => {
  const { loginId } = qs.parse(state)

  if (localStorage.getItem('loginId') !== loginId) {
    localStorage.clear('loginId')
    return false
  }

  localStorage.clear('loginId')

  const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/v1/login`, { verificationCode: code })

  if (response.status === 200) {
    localStorage.setItem('loggedIn', 'true')
    return true
  } else {
    return false
  }
}
