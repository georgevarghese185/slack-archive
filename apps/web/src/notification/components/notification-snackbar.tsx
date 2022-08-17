import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';

const snackbarStyle = {
  boxShadow:
    '0px 2px 4px -1px rgb(0 0 0 / 20%), 0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%)', // copied from MUI's AppBar's box-shadow values because I liked it
};

export const NotificationSnackbar: React.FC<{
  open?: boolean;
  onClose?: () => void;
  message?: string;
}> = ({ open = false, onClose = () => {}, message = '' }) => {
  const onCloseHandler = (_event: unknown, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }

    onClose();
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      onClose={onCloseHandler}
      sx={snackbarStyle}
    >
      <Alert onClose={onCloseHandler} severity="error" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
