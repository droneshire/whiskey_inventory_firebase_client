
export enum ItemAction {
  TRACKING = "TRACKING",
  UNTRACKED = "UNTRACKED",
}

export enum ClientAction {
  NONE = "NONE",
  DELETE = "DELETE",
  ADD = "ADD",
  PAID = "PAID",
  UNPAID = "UNPAID",
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
  minHoursSinceOutOfStock: number;
}

export interface AlertTimeZone {
  abbrev: string;
  altName: string;
  label: string;
  offset: number;
  value: string;
}

export interface Preferences {
  notifications: {
    sms: {
      phoneNumber: string;
      updatesEnabled: boolean;
      alertTimeRange: number[];
      alertTimeZone: AlertTimeZone;
      alertWindowEnabled: boolean;
    };
    email: {
      email: string;
      updatesEnabled: boolean;
    };
  };
}

export interface Accounting {
  plan: string;
  nextBillingDate: string;
  nextBillingAmount: number;
  hasPaid: boolean;
}

export interface ClientConfig {
  inventory: Inventory;
  preferences: Preferences;
  accounting: Accounting;
}

export const DEFAULT_USER_CONFIG = {
  inventory: {
    items: {},
    inventoryChange: 1,
    minHoursSinceOutOfStock: 0,
  },
  accounting: {
    hasPaid: false,
    plan: "",
    nextBillingDate: "",
    nextBillingAmount: 0.0,
  },
  preferences: {
    notifications: {
      email: { email: "", updatesEnabled: true },
      sms: {
        phoneNumber: "",
        updatesEnabled: true,
        alertTimeZone: {
          abbrev: "PDT",
          altName: "Pacific Daylight Time",
          label: "(GMT-07:00) Pacific Time",
          offset: -7,
          value: "America/Los_Angeles",
        },
        alertTimeRange: [],
        alertWindowEnabled: false,
      },
    },
  },
}
