import { Box, Stack } from '@mui/system';
import { Channel, ChannelPicker } from '../channel';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageHistory } from '../message';

export const ArchivePage = () => {
  const navigate = useNavigate();
  const { channelId } = useParams();

  const onChannelChange = (channel: Channel) => {
    navigate(channel.id);
  };

  return (
    <Stack direction="row" display="flex" flexGrow="1" overflow="hidden">
      <Box width={275} overflow="auto">
        <ChannelPicker
          selectedChannelId={channelId}
          onChange={onChannelChange}
        />
      </Box>
      <Box
        sx={{ flexGrow: 1, backgroundColor: 'white' }}
        overflow="auto"
        display="flex"
        flexDirection="column"
      >
        {channelId && <MessageHistory channelId={channelId} />}
      </Box>
    </Stack>
  );
};
