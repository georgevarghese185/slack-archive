import Conversations from '.././../../../backend/src/models/Conversations'
import * as api from '../../api'

export default class ConversationsRemote extends Conversations {
  async listAll () {
    return api.getConversations()
  }
}
