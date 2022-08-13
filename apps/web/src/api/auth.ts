import { axiosInstance } from './axios-instance';

export type GetAuthUrlResponse = {
  url: string;
  parameters: Record<string, string>;
};

export const getAuthUrl = async (): Promise<GetAuthUrlResponse> => {
  const { data } = await axiosInstance.get<GetAuthUrlResponse>(
    '/v1/login/auth-url'
  );

  return data;
};
