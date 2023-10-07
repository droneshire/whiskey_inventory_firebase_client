import AccountStatusTab from "./AccountStatus";
import NotificationsTab from "./NotificationsTab";
import PreferencesTab from "./PreferencesTab";

const preferencesTabsList = [
  {
    key: "notifications",
    label: "Notifications",
    component: NotificationsTab,
  },
  {
    key: "preferences",
    label: "Preferences",
    component: PreferencesTab
  },
  {
    key: "accountStatus",
    label: "Account Status",
    component: AccountStatusTab,
  },
];

export default preferencesTabsList;
