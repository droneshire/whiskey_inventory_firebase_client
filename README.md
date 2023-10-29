# NC ABC Whiskey Inventory Management Front End

React based website backed by Firebase database to manage the clients and their inventory monitoring settings.

![logo](https://github.com/droneshire/whiskey_inventory_firebase_client/assets/2355438/dc73d20a-fcc4-4f75-9a36-66d2ad09135d)

The server side is located at: https://github.com/droneshire/whiskey_inventory_alert_upwork

### Useful References
- [security rules](https://firebase.google.com/docs/firestore/security/overview)
- [firestore web reference](https://firebase.google.com/docs/reference/js/firestore_)
- [mui icons](https://mui.com/material-ui/material-icons/)
- [fort awesome icons](https://fontawesome.com/icons)
- [react documentation](https://react.dev/learn)

# Dashboard
The dashboard contains several views, one of which is an admin only view:

- Admin - manage all clients' inventory preferences, manage payment status, and monitor the backend health
- Inventory - add inventory to track and manage alert inventory change threshold
- Preferences - manage contact info and alert preferences

# Models

### Client
```

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
  updateOnNewData: boolean;
  notifications: {
    sms: {
      phoneNumbers: {
        [id: string]: {
          phoneNumber: string;
        };
      }
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


```

# Future Work

- Billing framework, either monthly/yearly or by notification?
