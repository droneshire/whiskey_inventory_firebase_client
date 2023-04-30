export enum ItemAction {
  TRACKING = "TRACKING",
  INACTIVE = "INACTIVE",
}

export interface Inventory {
  items: {
    [id: string]: {
      // The current action for the team to perform
      action: ItemAction;
    };
  };
  inventoryChange: number;
}

export interface Preferences {
  notifications: {
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
