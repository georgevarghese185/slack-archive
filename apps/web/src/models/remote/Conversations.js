import { Conversations } from '@slack-archive/common'
import * as api from '../../api'

export default class ConversationsRemote extends Conversations {
  async listAll () {
    return api.getConversations()
  }
}
