import { Message } from './message';
import { getMessageHistory as apiGetMessageHistory } from './message-api';

export const getMessageHistory = async (
  channelId: string
): Promise<Message[]> => {
  const response = await apiGetMessageHistory({ channelId });
  return response.messages;
};
