import { Box, Stack } from '@mui/system';
import { Channel, ChannelPicker } from '../../channel';
import { useNavigate } from 'react-router-dom';
import { List, ListItemButton } from '@mui/material';

const messages = [
  {
    client_msg_id: '96f5ad82-f802-44c5-a63f-75453f78ab3e',
    type: 'message',
    text: 'Integer tempor eget nibh eu vulputate. Phasellus non volutpat urna. In venenatis ex sed sapien molestie, et dapibus diam ullamcorper. Curabitur at velit faucibus, placerat nulla quis, accumsan diam.',
    user: 'U293U0XSA',
    ts: '1660963172.000000',
    team: 'TNEKRYY0B',
    thread_ts: '1659111502.000000',
    parent_user_id: 'U611CYC32',
  },
  {
    client_msg_id: '96f5ad82-f802-44c5-a63f-75453f78ab3e',
    type: 'message',
    text: 'Suspendisse laoreet magna in rutrum ornare. Ut placerat nulla et mauris sollicitudin.',
    user: 'U293U0XSA',
    ts: '1660978252.000000',
    team: 'TNEKRYY0B',
    thread_ts: '1658384358.000000',
    parent_user_id: 'UVKYTWGEW',
  },
  {
    client_msg_id: '96f5ad82-f802-44c5-a63f-75453f78ab3e',
    type: 'message',
    text: 'Ut dignissim urna risus, at pulvinar sapien sodales sodales. Integer in dui tellus. Mauris odio mi, pellentesque ac sodales a, venenatis id.',
    user: 'UJ64DP98V',
    ts: '1661092499.000000',
    team: 'TNEKRYY0B',
    thread_ts: '1659639706.000000',
    parent_user_id: 'UO2WZ5BDX',
  },
];

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
      <Box
        sx={{ flexGrow: 1, backgroundColor: 'white' }}
        overflow="auto"
        display="flex"
        flexDirection="column"
      >
        <List sx={{ marginTop: 'auto' }}>
          {messages.map(message => (
            <ListItemButton
              disableRipple
              sx={{ cursor: 'default' }}
              key={message.ts}
            >
              {message.text}
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Stack>
  );
};
