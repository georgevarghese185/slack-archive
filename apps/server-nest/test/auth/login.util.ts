import * as request from 'supertest';
import axios from 'axios';
import { parse, stringify } from 'querystring';
import { INestApplication } from '@nestjs/common';

export const getVerificationCode = async (app: INestApplication) => {
  const {
    body: { url, parameters },
  } = await request(app.getHttpServer()).get('/v1/login/auth-url');

  const authUrl = `${url}?${stringify(parameters)}`;

  const authResponse = await axios.get(authUrl, {
    maxRedirects: 0,
    validateStatus: (status) => status === 302,
  });

  const redirectUrl = authResponse.headers.location;

  const verificationCode = parse(redirectUrl.split('?')[1]).code;

  return verificationCode;
};
