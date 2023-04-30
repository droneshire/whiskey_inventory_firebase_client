import React, { useMemo } from "react";

import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MapIcon from "@mui/icons-material/Map";
import { SvgIconComponent } from "@mui/icons-material";

import PerformanceView from "./PerformanceView";
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
  {
    key: "performance",
    label: "Performance",
    icon: BarChartIcon,
    component: PerformanceView,
    adminOnly: true,
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: MapIcon,
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
