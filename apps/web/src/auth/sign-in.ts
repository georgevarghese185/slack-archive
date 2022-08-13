import { v4 as uuid } from 'uuid';
import qs from 'query-string';
import { getAuthUrl as apiGetAuthUrl } from '../api';

export const getAuthUrl = async (): Promise<string> => {
  const { url, parameters } = await apiGetAuthUrl();

  const loginId = generateLoginId();
  const state = qs.stringify({ loginId });
  const loginUrl = qs.stringifyUrl({ url, query: { ...parameters, state } });

  return loginUrl;
};

const generateLoginId = () => {
  const loginId = uuid();
  localStorage.setItem('loginId', loginId);
  return loginId;
};
