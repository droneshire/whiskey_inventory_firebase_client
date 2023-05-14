import { FC, useState, useEffect, useCallback } from "react";

import { Typography, Box, Chip, Button } from "@mui/material";

import {
  QuerySnapshot,
  DocumentSnapshot,
  CollectionReference,
  Timestamp,
} from "firebase/firestore";

import { useAsyncAction } from "hooks/async";
import { updateDoc } from "firebase/firestore";
import { ClientConfig } from "types/user";
import { HealthMonitorConfig } from "types/health_monitor";

const timeBetweenHeartbeatSeconds: number = 60 * 70;

export const BackendTab: FC<{
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
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  const {
    runAction: update,
    running: updating,
    error: updateError,
    clearError,
  } = useAsyncAction((value: boolean) =>
    updateDoc(healthMonitorSnapshot.ref, "reset", value)
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
  }, [
    buttonDisabled,
    heartbeat,
    heartbeatSeconds,
    timeBetweenHeartbeatSeconds,
  ]);

  useEffect(() => {
    if (buttonDisabled) {
      updateDoc(
        healthMonitorSnapshot.ref,
        "heartbeat",
        Timestamp.fromDate(new Date(2022, 1, 1))
      );
      updateDoc(healthMonitorSnapshot.ref, "reset", true);
      setTimeout(() => {
        setButtonDisabled(false);
      }, 20000);
    }
  }, [buttonDisabled]);

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
        <Button
          variant="contained"
          disabled={buttonDisabled}
          onClick={() => {
            setButtonDisabled(true);
          }}
          sx={{ width: "20%", alignSelf: "center" }}
        >
          Restart Backend
        </Button>
      </Box>
    </>
  );
};

export default BackendTab;
