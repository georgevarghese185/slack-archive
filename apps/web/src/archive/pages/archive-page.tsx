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
      <Grid item xs height="100%">
        {channelId && <MessageHistory channelId={channelId} />}
      </Grid>
    </Grid>
  );
};
