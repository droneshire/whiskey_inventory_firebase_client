import React, { FC } from "react";
import {
  doc,
  addDoc,
  QuerySnapshot,
  collection,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";
import {
  CircularProgress,
  Box,
  Typography,
  Chip,
  Fab,
  TableContainer,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Button,
  Menu,
  Tooltip,
  ListItemIcon,
  MenuItem,
  ListItemText,
  Paper,
  Alert,
  Snackbar,
  Modal,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import PaidIcon from "@mui/icons-material/Paid";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";

import { useAsyncAction } from "hooks/async";
import { useKeyPress } from "hooks/events";
import myApp from "firebaseApp";
import { ClientsConfig } from "types/user";
import { isValidEmail } from "utils/validators";

interface UserActionOption {
  doAction: () => void;
  ActionIcon: React.ElementType;
  title: string;
}

interface UserSpec {
  userId: string;
  hasPaid: boolean;
}

type UserProps = UserSpec & {
  actionButtons: UserActionOption[];
};
const User: FC<UserProps> = ({ userId, hasPaid, actionButtons }) => {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const actionMenuOpen = Boolean(actionMenuAnchorEl);
  const [paymentIcon, setPaymentIcon] = React.useState<React.ReactElement>(
    <DoNotDisturbOnIcon />
  );
  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };
  React.useEffect(() => {
    if (hasPaid) {
      setPaymentIcon(<PaidIcon />);
    } else {
      setPaymentIcon(<DoNotDisturbOnIcon />);
    }
  }, [hasPaid]);

  return (
    <TableRow hover>
      <TableCell>
        <Tooltip title={`User ${userId}`}>
          <Chip icon={<PersonIcon />} label={userId} variant="outlined" />
        </Tooltip>
      </TableCell>
      <TableCell>
        <Chip
          icon={paymentIcon}
          label={hasPaid ? "Paid" : "Unpaid"}
          variant="filled"
        />
      </TableCell>
      <TableCell sx={{ textAlign: "right" }}>
        <Button onClick={handleActionMenuClick}>Actions</Button>
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={actionMenuOpen}
          onClose={handleActionMenuClose}
        >
          {actionButtons.map(({ doAction, ActionIcon, title }, index) => (
            <MenuItem key={index} onClick={doAction}>
              {ActionIcon && (
                <ListItemIcon>
                  <ActionIcon fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText>{title}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </TableCell>
    </TableRow>
  );
};

interface UserGroupActionButton {
  doAction: (userId: string) => void;
  ActionIcon: React.ElementType;
  title: (userId: string) => string;
}

const UserActivityGroup: FC<{
  users: UserSpec[];
  actionButtons: UserGroupActionButton[];
}> = ({ users, actionButtons }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableBody>
          {users.map((props) => (
            <User
              key={props.userId}
              {...props}
              actionButtons={actionButtons.map(
                ({ doAction, title, ActionIcon }) => ({
                  doAction: () => doAction(props.userId),
                  title: title(props.userId),
                  ActionIcon: ActionIcon,
                })
              )}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  createUser: (user: UserSpec) => Promise<void> | void;
  existinguserIds: UserSpec[];
}
const NewUserModal: FC<UserModalProps> = ({
  open,
  onClose,
  createUser,
  existinguserIds,
}) => {
  const modalRef = React.useRef<HTMLElement>(null);
  const [userId, setuserId] = React.useState("");
  const [userName, setuserName] = React.useState("");
  const [userAvailable, setuserAvailable] = React.useState(-1);
  const {
    runAction: doCreateUser,
    running: creatingUser,
    error,
    clearError,
  } = useAsyncAction(createUser);

  // need to check if the userId is in the existinguserIds which is a list of UserSpec
  // and if the userId is a valid email

  const validuserId =
    userId &&
    !existinguserIds.some((userSpec) => userId === userSpec.userId) &&
    isValidEmail(userId);
  const disabled = creatingUser || !validuserId;

  const reset = React.useCallback(() => {
    setuserId("");
    setuserAvailable(-1);
    setuserName("");
  }, [setuserId, setuserAvailable, setuserName]);

  const doSubmit = React.useCallback(async () => {
    if (disabled) {
      return;
    }
    const success = await doCreateUser({
      userId,
      hasPaid: false,
    });
    if (success) {
      reset();
      onClose();
    }
  }, [onClose, reset, doCreateUser, userId, disabled]);

  const keyHander = React.useCallback(
    ({ key }: KeyboardEvent) => {
      switch (key) {
        case "Enter":
          doSubmit();
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    },
    [doSubmit, onClose]
  );
  useKeyPress(["Enter", "Escape"], keyHander);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          ref={modalRef}
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" component="h2" textAlign="center">
            New User
          </Typography>
          <TextField
            label="User ID"
            variant="standard"
            value={userId}
            onChange={(e) => setuserId(e.target.value)}
            error={!validuserId}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          />
          <Box textAlign="center">
            {creatingUser ? (
              <CircularProgress />
            ) : (
              <Tooltip title="Add user">
                <span>
                  <Fab
                    color="primary"
                    variant="extended"
                    disabled={disabled}
                    onClick={doSubmit}
                  >
                    <AddIcon />
                    Add
                  </Fab>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Modal>
      <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
        <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
          {`Failed to create user: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
};

const NewUsersTab: FC<{
  clientsSnapshot: QuerySnapshot<ClientsConfig>;
}> = ({ clientsSnapshot }) => {
  const clients = clientsSnapshot?.docs;
  const [modalOpen, setModalOpen] = React.useState(false);
  const [userDeleteId, setUserDeleteId] = React.useState("");
  const existinguserIds: UserSpec[] = React.useMemo(
    () =>
      (clients || {}).map((client) => ({ userId: client.id, hasPaid: true })),
    [clients]
  );
  const {
    runAction: addNewUser,
    running: updating,
    error,
    clearError,
  } = useAsyncAction((userId: string) =>
    addDoc(collection(getFirestore(myApp), "clients"), {
      preferences: { email: { email: userId } },
    })
  );

  React.useEffect(() => {
    if (userDeleteId) {
      deleteDoc(doc(collection(getFirestore(myApp), "clients"), userDeleteId));
      console.log("Deleted user", userDeleteId);
    }
  }, [userDeleteId]);

  if (!clients) {
    return <CircularProgress />;
  }

  return (
    <>
      <Box alignItems="center">
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 2,
          }}
        >
          <PersonIcon />
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Users
          </Typography>
        </Box>
        <UserActivityGroup
          users={existinguserIds}
          actionButtons={[
            {
              doAction: (userId: string) => setUserDeleteId(userId),
              title: (userId: string) => `Delete user ${userId}`,
              ActionIcon: DeleteIcon,
            },
          ]}
        />
      </Box>
      <Box textAlign="right" sx={{ marginTop: 2 }}>
        <Tooltip title="Add user">
          <Fab color="primary" onClick={() => setModalOpen(true)}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
      <NewUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existinguserIds={existinguserIds}
        createUser={(UserProps) => {
          const { userId, ...user } = UserProps;
          addNewUser(userId);
        }}
      />
    </>
  );
};

export default NewUsersTab;
