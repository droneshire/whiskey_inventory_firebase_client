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
  const [heartbeatSeconds, setHeartbeatSeconds] = useState<number>(
    heartbeat?.seconds ?? timeBetweenHeartbeatSeconds + 1
  );

  useEffect(() => {
    if (heartbeat) {
      const now: number = Math.floor(Date.now() / 1000);
      const newHeartbeat: number = heartbeat?.seconds ?? heartbeatSeconds;
      console.log(now, newHeartbeat, heartbeatSeconds, now - heartbeatSeconds);
      if (now - heartbeatSeconds > timeBetweenHeartbeatSeconds) {
        setHeartbeatString("Offline");
        setHeartbeatColor("error");
      } else {
        setHeartbeatString("Online");
        setHeartbeatColor("success");
      }
      setHeartbeatSeconds(newHeartbeat);
    }
  }, [heartbeat, heartbeatSeconds, timeBetweenHeartbeatSeconds]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Backend Monitor
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Chip
          sx={{ width: "20%", alignSelf: "center", marginBottom: 4 }}
          label={heartbeatString}
          color={heartbeatColor}
        />
      </Box>
    </>
  );
};

export default HealthMonitorTab;
