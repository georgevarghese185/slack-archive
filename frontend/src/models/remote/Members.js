import axios from 'axios'
import Members from '../../../../backend/src/models/Members'

export default class extends Members {
  async get (id) {
    const axiosInstance = axios.create({ baseURL: process.env.VUE_APP_API_BASE_URL })

    const response = await axiosInstance.get(`/v1/members/${id}`)

    return response.data
  }
}
