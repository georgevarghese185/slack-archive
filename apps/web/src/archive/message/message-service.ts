import { Message } from './message';
import { getMessageHistory as apiGetMessageHistory } from './message-api';

export type MessageHistoryOptions = { before?: string };

export const getMessageHistory = async (
  channelId: string,
  options: MessageHistoryOptions = {}
): Promise<Message[]> => {
  const response = await apiGetMessageHistory({ channelId, ...options });
  return response.messages;
};
