export const toSlackTs = (time: number) =>
  Math.floor(time / 1000).toString() + '.000000';

export const toMillis = (ts: string) => parseInt(ts) * 1000;
