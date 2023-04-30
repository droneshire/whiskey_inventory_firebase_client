import React, { useMemo } from "react";

import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { SvgIconComponent } from "@mui/icons-material";

import AdminView from "./AdminView";
import InventoryView from "./InventoryView";
import PreferencesView from "./PreferencesView";
import { User } from "firebase/auth";
import { ADMIN_USERS } from "utils/constants";

export interface DashbardViewSpec {
  key: string;
  label: string;
  icon: SvgIconComponent;
  component: React.ComponentType;
  adminOnly?: boolean;
}

const viewsList: DashbardViewSpec[] = [
  // {
  //   key: "admin",
  //   label: "Admin",
  //   icon: AdminPanelSettingsIcon,
  //   component: AdminView,
  //   adminOnly: true,
  // },
  {
    key: "inventory",
    label: "Inventory",
    icon: BarChartIcon,
    component: InventoryView,
    adminOnly: false,
  },
  {
    key: "preferences",
    label: "Preferences",
    icon: SettingsIcon,
    component: PreferencesView,
    adminOnly: false,
  },
];

export const useViewsList = (user: User | null | undefined) => {
  return useMemo(() => {
    if (user && ADMIN_USERS.includes(user.email ?? "")) {
      return viewsList;
    }
    return viewsList.filter((view) => !view.adminOnly);
  }, [user]);
};
