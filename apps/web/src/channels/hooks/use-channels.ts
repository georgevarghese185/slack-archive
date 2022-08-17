import { useState } from 'react';
import { Channel } from '../channel';

const mockChannels = [
  'general',
  'random',
  'jokes',
  'technology',
  'anime',
  'cooking',
  'road-trips',
  'movies',
  'games',
  'stamp-collection',
  'hideout',
  'camping',
  'shop-talk',
  'general2',
  'random2',
  'jokes2',
  'technology2',
  'anime2',
  'cooking2',
  'road-trips2',
  'movies2',
  'games2',
  'stamp-collection2',
  'hideout2',
  'camping2',
  'shop-talk2',
].map((ch, idx) => ({ name: ch, id: (idx + 1).toString() }));

export const useChannels = () => {
  const [channels] = useState<Channel[] | null>(mockChannels);

  return { channels };
};
