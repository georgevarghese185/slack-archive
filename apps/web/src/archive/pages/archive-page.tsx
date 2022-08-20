import { Box, Stack } from '@mui/system';
import { Channel, ChannelPicker } from '../../channel';
import { useNavigate } from 'react-router-dom';

export const ArchivePage = () => {
  const navigate = useNavigate();

  const onChannelChange = (channel: Channel) => {
    navigate(channel.id);
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
