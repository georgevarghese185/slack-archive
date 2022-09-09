import { axiosInstance } from '../../api';

export type Message = {
  type: string;
  text: string;
  user: string;
  ts: string;
};

export type GetMessageHistoryRequest = {
  channelId: string;
  before?: string;
};

export type GetMessageHistoryResponse = {
  messages: Message[];
};

export const getMessageHistory = async ({
  channelId,
  before,
}: GetMessageHistoryRequest): Promise<GetMessageHistoryResponse> => {
  const response = await axiosInstance.get<GetMessageHistoryResponse>(
    '/v1/messages',
    {
      params: {
        conversationId: channelId,
        before,
        limit: 100,
      },
    }
  );

  return response.data;
};
