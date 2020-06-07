import * as api from '../api'
import qs from 'query-string'
import { v4 as uuid } from 'uuid'

export const isLoggedIn = () => {
  return localStorage.getItem('loggedIn') === 'true'
}

export const startLogin = async () => {
  const { url, parameters } = await api.getAuthUrl()

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

  await api.login({ verificationCode: code })

  localStorage.setItem('loggedIn', 'true')
  return true
}

export const logout = async () => {
  try {
    await api.logout()
  } catch (e) {
    console.error(e)
  }

  localStorage.clear('loggedIn')
}
