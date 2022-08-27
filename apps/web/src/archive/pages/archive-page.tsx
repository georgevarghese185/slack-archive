import { Channel, ChannelPicker } from '../channel';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageHistory } from '../message';
import { Grid } from '@mui/material';

export const ArchivePage = () => {
  const navigate = useNavigate();
  const { channelId } = useParams();

  const onChannelChange = (channel: Channel) => {
    navigate(channel.id);
  };

  return (
    <Grid container flexGrow="1" overflow="hidden">
      <Grid item xs={2} overflow="auto" height="100%">
        <ChannelPicker
          selectedChannelId={channelId}
          onChange={onChannelChange}
        />
      </Grid>
      <Grid
        item
        xs
        sx={{ backgroundColor: 'white' }}
        overflow="auto"
        height="100%"
        display="flex"
        flexDirection="column"
      >
        {channelId && <MessageHistory channelId={channelId} />}
      </Grid>
    </Grid>
  );
};
