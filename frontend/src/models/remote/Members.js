import * as api from '../../api'
import Members from '../../../../backend/src/models/Members'

export default class extends Members {
  async get (id) {
    return api.getMember({ memberId: id })
  }
}
