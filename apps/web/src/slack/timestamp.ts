export const getTimestampMillis = (ts: string) =>
  parseInt(ts.split('.')[0]) * 1000;

export const getTimestampTime = (ts: string) => {
  const date = new Date(getTimestampMillis(ts));
  const hour = date.getHours();
  const hour12 = hour > 12 || hour === 0 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'pm' : 'am';
  const minute =
    date.getMinutes() < 10
      ? '0' + date.getMinutes().toString()
      : date.getMinutes().toString();

  return `${hour12}:${minute} ${ampm}`;
};
