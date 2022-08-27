import { format } from 'date-fns';

export const getTimestampMillis = (ts: string) =>
  parseInt(ts.split('.')[0]) * 1000;

export const getTimestampTime = (ts: string) => {
  return format(getTimestampMillis(ts), 'h:mm a');
};
