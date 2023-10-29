import ItemsInventoryTab from "./ItemsInventoryTab";
import InventoryUploaderTab from "./InventoryUploaderTab";

const inventoryTabsList = [
  {
    key: "items",
    label: "Inventory",
    component: ItemsInventoryTab,
  },
  {
    key: "uploader",
    label: "Uploader",
    component: InventoryUploaderTab,
  }
];

export default inventoryTabsList;
