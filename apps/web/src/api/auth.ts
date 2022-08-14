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

export type LoginRequest = {
  verificationCode: string;
};

export const login = async (request: LoginRequest) => {
  await axiosInstance.post('/v1/login', {
    verificationCode: request.verificationCode,
  });
};
