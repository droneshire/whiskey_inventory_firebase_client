import React, { useState, useEffect } from "react";

export interface InventoryItem {
  id: string;
}

interface InventoryUploaderProps {
  onUpload?: (inventoryItems: InventoryItem[]) => void;
}

const InventoryUploader: React.FC<InventoryUploaderProps> = ({ onUpload }) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // Only set the timeout if there are items in the inventory.
    if (inventoryItems.length > 0) {
      const timeout = setTimeout(() => {
        setInventoryItems([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 30000);

      // Cleanup function to clear the timeout.
      return () => clearTimeout(timeout);
    }
  }, [inventoryItems]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        parseInventoryIds(content);
      };

      reader.readAsText(file);
    }
  };

  const parseInventoryIds = (content: string) => {
    // Assuming IDs are separated by commas in the file
    const ids = content
      .split(",") // Split by comma
      .map((id) => id.trim())
      .filter(Boolean);

    // Convert array of string IDs to array of InventoryItem
    const parsedInventoryItems: InventoryItem[] = ids.map((idStr) => {
      return { id: idStr }; // Retain the IDs as strings
    });

    setInventoryItems(parsedInventoryItems);

    // If parent component needs the uploaded inventory items, we pass them out
    if (onUpload) {
      onUpload(parsedInventoryItems);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} ref={fileInputRef} />
      {/* Display the parsed IDs */}
      <ul>
        {inventoryItems.map((item, index) => (
          <li key={index}>{item.id}</li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryUploader;
