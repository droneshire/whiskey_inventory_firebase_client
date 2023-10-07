import React, { FC } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Divider,
} from "@mui/material";

import { ClientConfig } from "types/user";
import {
  FirestoreBackedSwitch,
  FirestoreBackedTimeRangeField,
  FirestoreBackedTimeZoneSelect,
} from "components/utils/forms";
const NotificationsTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
  const updatingAnything = !!userConfigSnapshot?.metadata.fromCache;
  const windowAlertsEnabled = userConfigSnapshot?.get(
    "preferences.notifications.sms.alertWindowEnabled"
  );
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Alert Selections
      </Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <FirestoreBackedSwitch
              disabled={updatingAnything}
              docSnap={userConfigSnapshot!}
              fieldPath="preferences.updateOnNewData"
              checkBox
            />
          }
          label="Update On New Data"
        />
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      <Typography variant="h6" gutterBottom>
        Alert Window
      </Typography>
      <FormGroup>
        <FirestoreBackedTimeRangeField
          disabled={updatingAnything || !windowAlertsEnabled}
          docSnap={userConfigSnapshot!}
          fieldPath="preferences.notifications.sms.alertTimeRange"
          label="Alert time range"
          sx={{ maxWidth: 300, marginBottom: 4 }}
        ></FirestoreBackedTimeRangeField>
        <FormControlLabel
          control={
            <FirestoreBackedSwitch
              disabled={updatingAnything}
              docSnap={userConfigSnapshot!}
              fieldPath="preferences.notifications.sms.alertWindowEnabled"
            />
          }
          label="Use SMS alert window"
        />
        <FirestoreBackedTimeZoneSelect
          disabled={updatingAnything || !windowAlertsEnabled}
          docSnap={userConfigSnapshot!}
          fieldPath="preferences.notifications.sms.alertTimeZone"
        />
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
    </>
  );
};

export default NotificationsTab;
