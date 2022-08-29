import { Skeleton } from '@mui/material';

export const TextSkeleton: React.FC<{ width: number }> = ({ width }) => {
  return (
    <Skeleton
      variant="text"
      animation="wave"
      sx={{ fontSize: '1rem', lineHeight: '1.25', maxWidth: '100%' }}
      width={width}
    />
  );
};
