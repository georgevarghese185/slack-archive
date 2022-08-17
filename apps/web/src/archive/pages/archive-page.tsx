import { Box, Stack } from '@mui/system';
import { Channel, ChannelPicker } from '../../channels';

export const ArchivePage = () => {
  const onChannelChange = (channel: Channel) => {
    console.log(channel);
  };

  return (
    <Stack direction="row" display="flex" flexGrow="1" overflow="hidden">
      <Box width={275} overflow="auto">
        <ChannelPicker onChange={onChannelChange} />
      </Box>
      <Box sx={{ flexGrow: 1, backgroundColor: 'white' }}>Messages</Box>
    </Stack>
  );
};
