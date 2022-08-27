import {
  List,
  ListItem,
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
  Typography,
  SxProps,
} from '@mui/material';
import { Channel } from '../channel';
import { useChannels } from '../hooks';

export type ChannelPickerProps = {
  onChange?: (channel: Channel) => void;
  selectedChannelId?: string;
};

export const ChannelPicker: React.FC<ChannelPickerProps> = ({
  selectedChannelId,
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
          selected={selectedChannelId === channel.id}
          key={channel.id}
          onClick={() => onChannelClick(channel)}
        />
      ))}
    </List>
  );
};

const ChannelListItem: React.FC<{
  channel: Channel;
  selected: boolean;
  onClick?: ListItemButtonProps['onClick'];
}> = ({ channel, selected, onClick }) => {
  return (
    <ListItem disablePadding sx={{ marginBottom: 1 }}>
      <ListItemButton onClick={onClick} sx={channelSx(selected)}>
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

const channelSx = (selected: boolean): SxProps =>
  selected ? { backgroundColor: '#0000002e' } : {};
