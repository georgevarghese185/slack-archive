import * as api from '../../api'
import { Members } from '@slack-archive/common'

export default class extends Members {
  async get (id) {
    return api.getMember({ memberId: id })
  }
}
