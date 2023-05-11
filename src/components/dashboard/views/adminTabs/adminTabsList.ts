import ClientsTab from "./ClientsTab";
import HealthMonitorTab from "./HealthMonitorTab";

const adminTabsList = [
  {
    key: "clients",
    label: "Clients",
    component: ClientsTab,
  },
  {
    key: "health_monitor",
    label: "Backend",
    component: HealthMonitorTab,
  },
];

export default adminTabsList;
