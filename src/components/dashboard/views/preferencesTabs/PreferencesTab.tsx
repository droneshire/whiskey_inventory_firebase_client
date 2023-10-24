import React, { FC } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Divider,
  Tooltip,
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
        <Tooltip title="Alerts you when previously unlisted items are added to the database.">
          <span>
            <FormControlLabel
              control={
                <FirestoreBackedSwitch
                  disabled={updatingAnything}
                  docSnap={userConfigSnapshot!}
                  fieldPath="preferences.updateOnNewData"
                  checkBox
                />
              }
              label="Alerts With New Items"
            />
          </span>
        </Tooltip>
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      <Tooltip title="Forces SMS alsert to be sent within the specified time window.">
        <span>
          <Typography variant="h6" gutterBottom>
            Alert Time Window
          </Typography>
        </span>
      </Tooltip>
      <FormGroup>
        <FirestoreBackedTimeRangeField
          disabled={updatingAnything || !windowAlertsEnabled}
          docSnap={userConfigSnapshot!}
          fieldPath="preferences.notifications.sms.alertTimeRange"
          label="Alert time range"
          sx={{ maxWidth: 300, marginBottom: 4 }}
        ></FirestoreBackedTimeRangeField>
        <Tooltip title="The timezone used for the alert window.">
          <span>
            <Typography variant="body1" gutterBottom>
              Timezone
            </Typography>
            <FirestoreBackedTimeZoneSelect
              disabled={updatingAnything || !windowAlertsEnabled}
              docSnap={userConfigSnapshot!}
              fieldPath="preferences.notifications.sms.alertTimeZone"
            />
          </span>
        </Tooltip>
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
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
    </>
  );
};

export default NotificationsTab;
