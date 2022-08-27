import { Channel } from './channel';
import { getConversations } from './chananel-api';

export const getChannels = async (): Promise<Channel[]> => {
  const { conversations } = await getConversations();
  return conversations;
};
