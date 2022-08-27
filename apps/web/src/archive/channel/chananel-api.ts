import { axiosInstance } from '../../api';

export type GetConverstionsResponse = {
  conversations: Conversation[];
};

export type Conversation = {
  id: string;
  name: string;
};

export const getConversations = async (): Promise<GetConverstionsResponse> => {
  const { data } = await axiosInstance.get<GetConverstionsResponse>(
    '/v1/conversations'
  );

  return data;
};
