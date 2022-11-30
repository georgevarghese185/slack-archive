import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import axios from 'axios';
import { parse, stringify } from 'querystring';

export const getVerificationCode = async (app: INestApplication) => {
  const {
    body: { url, parameters },
  } = await request(app.getHttpServer()).get('/v1/login/auth-url');

  const authUrl = `${url}?${stringify(parameters)}`;

  const authResponse = await axios.get(authUrl, {
    maxRedirects: 0,
    validateStatus: (status) => status === 302,
  });

  const redirectUrl = authResponse.headers['location'] || '';

  const verificationCode = parse(redirectUrl.split('?')[1] || '')['code'];

  return verificationCode;
};

export const login = async (app: INestApplication) => {
  const verificationCode = await getVerificationCode(app);
  const response = await request(app.getHttpServer())
    .post('/v1/login')
    .send({ verificationCode })
    .expect(200);

  const cookie = response.headers['set-cookie'][0];
  const token = decodeURIComponent(
    cookie.match(/loginToken=([^\s]+);/)?.[1] || '',
  );

  return { cookie, token };
};

export const isSlackTokenValid = async (
  baseUrl: string,
  token: string,
): Promise<boolean> => {
  const response = await axios.post(
    '/api/auth.test',
    {},
    {
      baseURL: baseUrl,
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.ok;
};
