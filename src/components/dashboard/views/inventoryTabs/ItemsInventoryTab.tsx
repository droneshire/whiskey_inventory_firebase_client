import React, { FC, useCallback, useMemo, useRef, useState } from "react";

import {
  Tooltip,
  CircularProgress,
  Modal,
  Typography,
  Fab,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Snackbar,
  Alert,
  TableRow,
  TableCell,
  TableContainer,
  TableBody,
  Paper,
  Table,
  Chip,
  FormGroup,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import { Inventory, ItemAction, UserConfig } from "types/user";
import { Box } from "@mui/system";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import {
  faPersonDigging,
  faSackDollar,
} from "@fortawesome/free-solid-svg-icons";

import { capitalizeFirstLetter } from "utils/string";
import { useAsyncAction } from "hooks/async";
import {
  FirestoreBackedSlider,
  FirestoreBackedSwitch,
  IntegerInput,
} from "components/utils/forms";
import {
  DocumentSnapshot,
  FieldPath,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { useKeyPress } from "hooks/events";

const LootingIcon: FC<Omit<FontAwesomeIconProps, "icon">> = (props) => (
  <FontAwesomeIcon icon={faSackDollar} {...props} />
);
const MiningIcon: FC<Omit<FontAwesomeIconProps, "icon">> = (props) => (
  <FontAwesomeIcon icon={faPersonDigging} {...props} />
);

type ItemSpec = Inventory["items"][string] & {
  itemId: string;
};

interface ItemActionOption {
  doAction: () => void;
  ActionIcon: React.ElementType;
  title: string;
}

type ItemProps = ItemSpec & {
  actionButtons: ItemActionOption[];
};
const Item: FC<ItemProps> = ({ itemId, actionButtons }) => {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const actionMenuOpen = Boolean(actionMenuAnchorEl);
  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };
  return (
    <TableRow hover>
      <TableCell>
        <Tooltip title={`Item ${itemId}`}>
          <Chip icon={<ElectricBoltIcon />} label={itemId} variant="outlined" />
        </Tooltip>
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

interface ItemGroupActionButton {
  doAction: (itemId: string) => void;
  ActionIcon: React.ElementType;
  title: (itemId: string) => string;
}

const ItemActivityGroup: FC<{
  items: ItemSpec[];
  actionButtons: ItemGroupActionButton[];
}> = ({ items, actionButtons }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableBody>
          {items.map((props) => (
            <Item
              key={props.itemId}
              {...props}
              actionButtons={actionButtons.map(
                ({ doAction, title, ActionIcon }) => ({
                  doAction: () => doAction(props.itemId),
                  title: title(props.itemId),
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

interface ItemModalProps {
  open: boolean;
  onClose: () => void;
  createItem: (item: ItemSpec) => Promise<void> | void;
  existingitemIds: string[];
}
const NewItemModal: FC<ItemModalProps> = ({
  open,
  onClose,
  createItem,
  existingitemIds,
}) => {
  const modalRef = useRef<HTMLElement>(null);
  const [itemId, setitemId] = useState("");
  const [itemAction, setItemAction] = useState<ItemAction>(ItemAction.TRACKING);
  const {
    runAction: doCreateItem,
    running: creatingItem,
    error,
    clearError,
  } = useAsyncAction(createItem);

  const validitemId = itemId && !existingitemIds.includes(itemId);
  const disabled = creatingItem || !validitemId;

  const reset = useCallback(() => {
    setItemAction(ItemAction.TRACKING);
    setitemId("");
  }, [setItemAction, setitemId]);

  const doSubmit = useCallback(async () => {
    if (disabled) {
      return;
    }
    const success = await doCreateItem({
      itemId,
      action: itemAction,
    });
    if (success) {
      reset();
      onClose();
    }
  }, [onClose, reset, doCreateItem, itemId, itemAction, disabled]);

  const keyHander = useCallback(
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
            New Item
          </Typography>
          <TextField
            label="Item ID"
            variant="standard"
            value={itemId}
            onChange={(e) => setitemId(e.target.value)}
            error={!validitemId}
            InputProps={{ inputComponent: IntegerInput as any }}
          />
          <FormControl>
            <FormLabel>Action</FormLabel>
            <RadioGroup
              name="controlled-radio-buttons-group"
              value={itemAction}
              onChange={(e) =>
                setItemAction(
                  ItemAction[
                    e.target.value as typeof ItemAction[keyof typeof ItemAction]
                  ]
                )
              }
            >
              <FormControlLabel
                value={ItemAction.TRACKING}
                control={<Radio />}
                label={capitalizeFirstLetter(ItemAction.TRACKING.toLowerCase())}
              />
              <FormControlLabel
                value={ItemAction.INACTIVE}
                control={<Radio />}
                label={capitalizeFirstLetter(ItemAction.INACTIVE.toLowerCase())}
              />
            </RadioGroup>
          </FormControl>
          <Box textAlign="center">
            {creatingItem ? (
              <CircularProgress />
            ) : (
              <Tooltip title="Add item">
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
          {`Failed to create item: ${error}`}
        </Alert>
      </Snackbar>
    </>
  );
};

const ReinforcementsStrategyTab: FC<{
  userConfigSnapshot: DocumentSnapshot<UserConfig>;
}> = ({ userConfigSnapshot }) => {
  const inventory = userConfigSnapshot?.data()?.inventory;
  const updatingAnything = !!userConfigSnapshot?.metadata.fromCache;
  const [modalOpen, setModalOpen] = useState(false);
  const existingitemIds = useMemo(
    () => Object.keys(inventory?.items || {}),
    [inventory]
  );

  if (!inventory) {
    return <CircularProgress />;
  }
  const trackingItems: ItemSpec[] = [];
  const miningItems: ItemSpec[] = [];
  const inactiveItems: ItemSpec[] = [];
  Object.entries(inventory.items || {}).forEach((t) => {
    const [itemId, item] = t;
    switch (item.action.valueOf()) {
      case ItemAction.TRACKING:
        trackingItems.push({ itemId, ...item });
        break;
      case "TRACKING":
        trackingItems.push({ itemId, ...item });
        break;
      case ItemAction.INACTIVE:
        inactiveItems.push({ itemId, ...item });
        break;
      default:
        throw new Error(`Invalid item action: ${itemId}, ${item.action}`);
    }
  });

  const changeItemAction = (itemId: string, action: ItemAction) => {
    updateDoc(
      userConfigSnapshot.ref,
      new FieldPath("inventory", "items", itemId, "action"),
      action
    );
  };
  const changeToTracking = (itemId: string) => {
    changeItemAction(itemId, ItemAction.TRACKING);
  };

  const deleteItem = (itemId: string) => {
    updateDoc(
      userConfigSnapshot.ref,
      new FieldPath("inventory", "items", itemId),
      deleteField()
    );
  };

  const inactivateItem = (itemId: string) => {
    changeItemAction(itemId, ItemAction.INACTIVE);
  };

  return (
    <>
      <Box alignItems="center">
        <FormGroup sx={{ p: 2 }}>
          <Typography gutterBottom>Alert Inventory Threshold</Typography>
          <FirestoreBackedSlider
            disabled={updatingAnything}
            docSnap={userConfigSnapshot!}
            min={0}
            max={100}
            fieldPath="inventory.inventoryChange"
            valueLabelDisplay="auto"
            marks={[
              {
                value: 0,
                label: "0",
              },
              {
                value: 100,
                label: "100",
              },
            ]}
            sx={{ maxWidth: 300 }}
          />
        </FormGroup>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 2,
          }}
        >
          <MiningIcon />
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Items Tracked
          </Typography>
        </Box>
        <ItemActivityGroup
          items={miningItems}
          actionButtons={[
            {
              doAction: changeToTracking,
              title: (itemId: string) => `Change item ${itemId} to tracking`,
              ActionIcon: LootingIcon,
            },
            {
              doAction: inactivateItem,
              title: (itemId: string) => `Inactivate item ${itemId}`,
              ActionIcon: DoDisturbIcon,
            },
            {
              doAction: deleteItem,
              title: (itemId: string) => `Delete item ${itemId}`,
              ActionIcon: DeleteIcon,
            },
          ]}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 2,
          }}
        >
          <LootingIcon />
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Looting itemss
          </Typography>
        </Box>
        <ItemActivityGroup
          items={trackingItems}
          actionButtons={[
            {
              doAction: inactivateItem,
              title: (itemId: string) => `Change item ${itemId} to inactive`,
              ActionIcon: DoDisturbIcon,
            },
            {
              doAction: deleteItem,
              title: (itemId: string) => `Delete item ${itemId}`,
              ActionIcon: DeleteIcon,
            },
          ]}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 2,
          }}
        >
          <DoDisturbIcon />
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Inactive Items
          </Typography>
        </Box>
        <ItemActivityGroup
          items={inactiveItems}
          actionButtons={[
            {
              doAction: changeToTracking,
              title: (itemId: string) => `Change item ${itemId} to tracking`,
              ActionIcon: LootingIcon,
            },
            {
              doAction: deleteItem,
              title: (itemId: string) => `Delete item ${itemId}`,
              ActionIcon: DeleteIcon,
            },
          ]}
        />
      </Box>
      <Box textAlign="right" sx={{ marginTop: 2 }}>
        <Tooltip title="Add item">
          <Fab color="primary" onClick={() => setModalOpen(true)}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
      <NewItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        existingitemIds={existingitemIds}
        createItem={(ItemProps) => {
          const { itemId, ...item } = ItemProps;
          updateDoc(
            userConfigSnapshot.ref,
            new FieldPath("inventory", "items", itemId),
            item
          );
        }}
      />
    </>
  );
};

export default ReinforcementsStrategyTab;