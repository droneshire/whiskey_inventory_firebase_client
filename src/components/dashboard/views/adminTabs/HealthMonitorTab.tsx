import { FC, useState, useEffect, useMemo } from "react";

import { Typography, Box, Chip } from "@mui/material";

import {
  QuerySnapshot,
  DocumentSnapshot,
  CollectionReference,
} from "firebase/firestore";

import { ClientConfig } from "types/user";
import { HealthMonitorConfig } from "types/health_monitor";

const timeBetweenHeartbeatSeconds: number = 60 * 70;

export const HealthMonitorTab: FC<{
  clientsSnapshot: QuerySnapshot<ClientConfig>;
  clientsConfigRef: CollectionReference<ClientConfig>;
  healthMonitorSnapshot: DocumentSnapshot<HealthMonitorConfig>;
}> = ({ healthMonitorSnapshot }) => {
  const heartbeat = healthMonitorSnapshot?.get("heartbeat");
  const [heartbeatString, setHeartbeatString] = useState<string>("Offline");
  const [heartbeatColor, setHeartbeatColor] = useState<"success" | "error">(
    "error"
  );
  const [lastHeartbeatSeconds, setLastHeartbeatSeconds] = useState<number>(0);

  useEffect(() => {
    if (heartbeat) {
      const newHeartbeat = heartbeat?.seconds ?? 0;
      console.log(newHeartbeat - lastHeartbeatSeconds);
      if (newHeartbeat - lastHeartbeatSeconds > timeBetweenHeartbeatSeconds) {
        setHeartbeatString("Offline");
        setHeartbeatColor("error");
      } else {
        setHeartbeatString("Online");
        setHeartbeatColor("success");
      }

      setLastHeartbeatSeconds(newHeartbeat);
    }
  }, [heartbeat, lastHeartbeatSeconds, timeBetweenHeartbeatSeconds]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Backend Monitor
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Chip
          sx={{ width: "20%", alignSelf: "center" }}
          label={heartbeatString}
          color={heartbeatColor}
        />
      </Box>
    </>
  );
};

export default HealthMonitorTab;
