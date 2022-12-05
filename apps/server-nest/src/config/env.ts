export const envFilePaths = [
  '.env',
  ...(process.env['ENV'] === 'dev' ? ['.env.local'] : []),
];
