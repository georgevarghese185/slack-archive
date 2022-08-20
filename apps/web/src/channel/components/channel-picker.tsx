import {
  List,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { Channel } from '../channel';
import { useChannels } from '../hooks';

export type ChannelPickerProps = {
  onChange?: (channel: Channel) => void;
};

export const ChannelPicker: React.FC<ChannelPickerProps> = ({
  onChange = () => {},
}) => {
  const { channels } = useChannels();

  const onChannelClick = (channel: Channel) => {
    onChange(channel);
  };

  return (
    <List>
      {(channels || []).map(channel => (
        <ChannelListItem
          channel={channel}
          key={channel.id}
          onClick={() => onChannelClick(channel)}
        />
      ))}
    </List>
  );
};

const ChannelListItem: React.FC<{
  channel: Channel;
  onClick?: ListItemButtonProps['onClick'];
}> = ({ channel, onClick }) => {
  return (
    <ListItem disablePadding sx={{ marginBottom: 1 }}>
      <ListItemButton onClick={onClick}>
        <ChannelListIcon />
        <ListItemText primary={channel.name} />
      </ListItemButton>
    </ListItem>
  );
};

const ChannelListIcon = () => {
  return (
    <ListItemIcon sx={{ minWidth: 24 }}>
      <Typography variant="h6">#</Typography>
    </ListItemIcon>
  );
};
