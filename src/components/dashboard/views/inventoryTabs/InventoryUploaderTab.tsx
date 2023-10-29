import { FC, useState, useEffect } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import InventoryUploader, {
  InventoryItem,
} from "components/utils/inventoryUploader";
import { ItemSpec } from "./ItemsInventoryTab";
import { updateDoc, FieldPath } from "firebase/firestore";
import { ClientConfig } from "types/user";
import { ItemAction } from "types/user";
import {
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const InventoryUploaderTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
  const [isTracking, setIsTracking] = useState(false);
  const onUpload = (inventoryItems: InventoryItem[]) => {
    const createItem = (ItemProps: ItemSpec) => {
      const { itemId, ...item } = ItemProps;
      updateDoc(
        userConfigSnapshot.ref,
        new FieldPath("inventory", "items", itemId),
        item
      );
    };

    inventoryItems.forEach((item: InventoryItem) => {
      const itemSpec: ItemSpec = {
        itemId: item.id.toString(), // Converting to string as the itemId is expected to be string
        name: "",
        available: 0,
        action: isTracking ? ItemAction.TRACKING : ItemAction.UNTRACKED,
      };
      createItem(itemSpec); // Passing the initialized itemSpec object
    });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Bulk Upload
      </Typography>
      <Typography variant="body1" gutterBottom>
        Upload a text file of comma separated inventory IDs
      </Typography>
      <FormControlLabel
        style={{ marginBottom: "24px" }}
        control={
          <Checkbox
            checked={isTracking}
            onChange={(e: any) => setIsTracking(e.target.checked)}
          />
        }
        label="Track items after upload"
      />
      <FormGroup>
        <InventoryUploader onUpload={onUpload}></InventoryUploader>
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
    </>
  );
};

export default InventoryUploaderTab;
