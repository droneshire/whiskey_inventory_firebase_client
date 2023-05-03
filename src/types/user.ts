import { Timestamp } from "@firebase/firestore";

export enum ItemAction {
  TRACKING = "TRACKING",
  UNTRACKED = "UNTRACKED",
}

export interface Inventory {
  items: {
    [id: string]: {
      // The current action for the team to perform
      action: ItemAction;
      name: string;
      available: number;
    };
  };
  inventoryChange: number;
}

export interface Preferences {
  notifications: {
    alertTimeRange: Timestamp[];
    alertTimeZone: string;
    sms: {
      phoneNumber: string;
      updatesEnabled: boolean;
    };
    email: {
      email: string;
      updatesEnabled: boolean;
    };
  };
}

export interface UserConfig {
  inventory: Inventory;
  preferences: Preferences;
}
