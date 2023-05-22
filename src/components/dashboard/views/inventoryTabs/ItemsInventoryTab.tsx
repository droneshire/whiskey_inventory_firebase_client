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
  Checkbox,
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
import DoDisturbIcon from "@mui/icons-material/DoDisturb";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import { Inventory, ItemAction, ClientConfig } from "types/user";
import { Box } from "@mui/system";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { faChartSimple } from "@fortawesome/free-solid-svg-icons";

import { capitalizeFirstLetter } from "utils/string";
import { useAsyncAction } from "hooks/async";
import { FirestoreBackedSlider } from "components/utils/forms";
import {
  DocumentSnapshot,
  FieldPath,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { useKeyPress } from "hooks/events";

const TrackingIcon: FC<Omit<FontAwesomeIconProps, "icon">> = (props) => (
  <FontAwesomeIcon icon={faChartSimple} {...props} />
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
  selectedItems: string[];
  toggleItemSelection: (itemId: string) => void;
};
const Item: FC<ItemProps> = ({
  name,
  itemId,
  available,
  actionButtons,
  selectedItems,
  toggleItemSelection,
}) => {
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
          {(selectedItems.includes(itemId) && (
            <Chip
              icon={<LocalBarIcon />}
              label={itemId}
              onClick={() => toggleItemSelection(itemId)}
            />
          )) || (
            <Chip
              icon={<LocalBarIcon />}
              label={itemId}
              variant="outlined"
              onClick={() => toggleItemSelection(itemId)}
            />
          )}
        </Tooltip>
      </TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{available}</TableCell>
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

const TableDisplayButtons: FC<{
  items: ItemSpec[];
  visibleItems: number;
  setVisibleItems: (visibleItems: number) => void;
  incrementalVisibleItems: number;
}> = ({ items, visibleItems, setVisibleItems, incrementalVisibleItems }) => {
  return items.length > 0 && items.length > incrementalVisibleItems ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Button
        onClick={() => {
          setVisibleItems(incrementalVisibleItems);
        }}
        disabled={visibleItems <= incrementalVisibleItems}
      >
        Show Min
      </Button>
      <Button
        onClick={() => {
          setVisibleItems(visibleItems + incrementalVisibleItems);
        }}
        disabled={visibleItems > items.length}
      >
        Show More
      </Button>

      <Button
        onClick={() => {
          setVisibleItems(visibleItems - incrementalVisibleItems);
        }}
        disabled={visibleItems <= incrementalVisibleItems}
      >
        Show Less
      </Button>
      <Button
        onClick={() => {
          setVisibleItems(items.length);
        }}
        disabled={visibleItems === items.length}
      >
        Show All
      </Button>
    </div>
  ) : null;
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
  const incrementalVisibleItems = 10;
  const [visibleItems, setVisibleItems] = useState(incrementalVisibleItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const displayedItems = items.slice(0, visibleItems);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const actionMenuOpen = Boolean(actionMenuAnchorEl);
  const handleActionMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchorEl(event.currentTarget);
  };
  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };

  const toggleAllItems = useCallback(() => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.itemId));
    }
  }, [items, selectedItems]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableBody>
          {items.length > 0 && (
            <TableRow sx={{ marginLeft: "1rem" }}>
              <TableCell>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        selectedItems.length === items.length &&
                        items.length > 0
                      }
                      indeterminate={
                        selectedItems.length > 0 &&
                        selectedItems.length < items.length
                      }
                      onChange={toggleAllItems}
                    />
                  }
                  label="Select All/None"
                />
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell sx={{ textAlign: "right" }}>
                <Button onClick={handleActionMenuClick}>Actions</Button>
                <Menu
                  anchorEl={actionMenuAnchorEl}
                  open={actionMenuOpen}
                  onClose={handleActionMenuClose}
                >
                  {actionButtons.map(
                    ({ doAction, ActionIcon, title }, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          selectedItems.forEach((itemId) => {
                            doAction(itemId);
                          });
                        }}
                      >
                        {ActionIcon && (
                          <ListItemIcon>
                            <ActionIcon fontSize="small" />
                          </ListItemIcon>
                        )}
                        <ListItemText>{title("")}</ListItemText>
                      </MenuItem>
                    )
                  )}
                </Menu>
              </TableCell>
            </TableRow>
          )}
          {displayedItems.map((props) => (
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
              toggleItemSelection={toggleItemSelection}
              selectedItems={selectedItems}
            />
          ))}
        </TableBody>
      </Table>
      <TableDisplayButtons
        {...{ items, visibleItems, setVisibleItems, incrementalVisibleItems }}
      />
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
  const [itemName, setitemName] = useState("");
  const [itemAvailable, setitemAvailable] = useState(-1);
  const [itemAction, setItemAction] = useState<ItemAction>(ItemAction.TRACKING);
  const {
    runAction: doCreateItem,
    running: creatingItem,
    error,
    clearError,
  } = useAsyncAction(createItem);

  const validitemId =
    itemId && !existingitemIds.includes(itemId) && itemId.length === 5;
  const disabled = creatingItem || !validitemId;

  const reset = useCallback(() => {
    setItemAction(ItemAction.TRACKING);
    setitemId("");
    setitemAvailable(-1);
    setitemName("");
  }, [setItemAction, setitemId, setitemAvailable, setitemName]);

  const doSubmit = useCallback(async () => {
    if (disabled) {
      return;
    }
    const success = await doCreateItem({
      itemId,
      name: itemName,
      available: itemAvailable,
      action: itemAction,
    });
    if (success) {
      reset();
      onClose();
    }
  }, [
    onClose,
    reset,
    doCreateItem,
    itemId,
    itemAction,
    itemAvailable,
    itemName,
    disabled,
  ]);

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
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          />
          <FormControl>
            <FormLabel>Action</FormLabel>
            <RadioGroup
              name="controlled-radio-buttons-group"
              value={itemAction}
              onChange={(e) =>
                setItemAction(
                  ItemAction[
                    e.target
                      .value as (typeof ItemAction)[keyof typeof ItemAction]
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
                value={ItemAction.UNTRACKED}
                control={<Radio />}
                label={capitalizeFirstLetter(
                  ItemAction.UNTRACKED.toLowerCase()
                )}
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

const ItemsInventoryTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
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
      case ItemAction.UNTRACKED:
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
    changeItemAction(itemId, ItemAction.UNTRACKED);
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
            max={10}
            fieldPath="inventory.inventoryChange"
            valueLabelDisplay="auto"
            marks={[
              {
                value: 0,
                label: "0",
              },
              {
                value: 10,
                label: "10",
              },
            ]}
            sx={{ maxWidth: 300 }}
          />
        </FormGroup>
        <FormGroup sx={{ p: 2 }}>
          <Typography gutterBottom>Min Hours Since Out of Stock</Typography>
          <FirestoreBackedSlider
            disabled={updatingAnything}
            docSnap={userConfigSnapshot!}
            min={0}
            max={48}
            fieldPath="inventory.minHoursSinceOutOfStock"
            valueLabelDisplay="auto"
            marks={[
              {
                value: 0,
                label: "0",
              },
              {
                value: 48,
                label: "48",
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
          <TrackingIcon />
          <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Items Tracked
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
            Untracked Items
          </Typography>
        </Box>
        <ItemActivityGroup
          items={inactiveItems}
          actionButtons={[
            {
              doAction: changeToTracking,
              title: (itemId: string) => `Change item ${itemId} to tracking`,
              ActionIcon: TrackingIcon,
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

export default ItemsInventoryTab;
