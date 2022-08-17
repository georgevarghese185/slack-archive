import { Box, Stack } from '@mui/system';

export const ArchivePage = () => {
  return (
    <Stack direction="row" display="flex" height="100%">
      <Box width={275}>Channels</Box>
      <Box sx={{ flexGrow: 1, backgroundColor: 'white' }}>Messages</Box>
    </Stack>
  );
};
