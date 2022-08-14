import { v4 as uuid } from 'uuid';
import qs from 'query-string';
import { getAuthUrl as apiGetAuthUrl, login as apiLogin } from '../api';
import { parse } from 'query-string';

export class InvalidLoginIdError extends Error {
  constructor() {
    super(
      'This login was attempted from a different session. Try logging in again'
    );
  }
}

/**
 * Is the user logged in
 *
 * This flag is purposely evaluated once on first load for simplicity. If login state changes,
 * the web app MUST be fully reloaded
 */
export const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

export const getAuthUrl = async (): Promise<string> => {
  const { url, parameters } = await apiGetAuthUrl();

  const loginId = generateLoginId();
  const state = qs.stringify({ loginId });
  const loginUrl = qs.stringifyUrl({ url, query: { ...parameters, state } });

  return loginUrl;
};

export const login = async (code: string, state: string) => {
  const { loginId } = parse(state);
  verifyLoginId(loginId);

  await apiLogin({ verificationCode: code });

  setLoggedIn();
};

const generateLoginId = () => {
  const loginId = uuid();
  localStorage.setItem('loginId', loginId);
  return loginId;
};

const verifyLoginId = (loginId: unknown) => {
  const savedLoginId = localStorage.getItem('loginId');

  if (loginId !== savedLoginId) {
    throw new InvalidLoginIdError();
  }
};

const setLoggedIn = () => {
  localStorage.setItem('loggedIn', 'true');
};
