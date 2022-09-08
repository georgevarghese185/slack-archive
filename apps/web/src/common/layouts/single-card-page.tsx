import { Card, CardContent } from '@mui/material';
import { Container } from '@mui/system';
import { PropsWithChildren } from 'react';

export const SingleCardPage: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container sx={{ marginTop: 8 }}>
      <Card sx={{ padding: 4, maxWidth: 800, margin: 'auto' }}>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {children}
        </CardContent>
      </Card>
    </Container>
  );
};
