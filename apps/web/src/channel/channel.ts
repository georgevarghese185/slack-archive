import { getConversations } from './chananel-api';

export type Channel = {
  id: string;
  name: string;
};

export const getChannels = async (): Promise<Channel[]> => {
  const { conversations } = await getConversations();
  return conversations;
};
