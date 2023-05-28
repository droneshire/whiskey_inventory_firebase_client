import React, { FC } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import phone from "phone";
import {
  Chip,
  Typography,
  FormGroup,
  FormControlLabel,
  Divider,
} from "@mui/material";
import PaidIcon from "@mui/icons-material/Paid";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";

import { ClientConfig } from "types/user";
import {
  EmailInput,
  FirestoreBackedSwitch,
  FirestoreBackedTextField,
  FirestoreBackedTimeRangeField,
  FirestoreBackedTimeZoneSelect,
  PhoneNumberInput,
} from "components/utils/forms";
import { isValidEmail } from "utils/validators";

const NotificationsTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
  const updatingAnything = !!userConfigSnapshot?.metadata.fromCache;
  const windowAlertsEnabled = userConfigSnapshot?.get(
    "preferences.notifications.sms.alertWindowEnabled"
  );
  const hasPaid = userConfigSnapshot?.get("accounting.hasPaid");
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Account Status
      </Typography>
      <FormGroup>
        <Chip
          label={hasPaid ? "Active" : "Inactive"}
          icon={
            hasPaid ? (
              <PaidIcon style={{ color: "white" }} />
            ) : (
              <DoNotDisturbOnIcon style={{ color: "white" }} />
            )
          }
          sx={{
            maxWidth: 100,
            color: "white",
            backgroundColor: hasPaid ? "red" : "grey",
          }}
        />
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      <Typography variant="h6" gutterBottom>
        Email
      </Typography>
      <FormGroup>
        <FirestoreBackedTextField
          label="Email address"
          disabled={updatingAnything}
          docSnap={userConfigSnapshot!}
          fieldPath="preferences.notifications.email.email"
          variant="standard"
          isValid={(email) => !email || isValidEmail(email)}
          helperText={(_, validEmail) =>
            validEmail ? "" : "Invalid email address"
          }
          sx={{ maxWidth: 300 }}
          InputProps={{ inputComponent: EmailInput as any }}
        />
        <FormControlLabel
          control={
            <FirestoreBackedSwitch
              disabled={updatingAnything}
              docSnap={userConfigSnapshot!}
              fieldPath="preferences.notifications.email.updatesEnabled"
              checkBox
            />
          }
          label="Email updates"
        />
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      <Typography variant="h6" gutterBottom>
        SMS
      </Typography>
      <FormGroup>
        <FirestoreBackedTextField
          label="Phone number"
          disabled={updatingAnything}
          docSnap={userConfigSnapshot!}
          fieldPath="preferences.notifications.sms.phoneNumber"
          variant="standard"
          isValid={(phoneNumber) => !phoneNumber || phone(phoneNumber).isValid}
          helperText={(phoneNumber, validPhone) =>
            validPhone ? "" : "Invalid phone number:" + phoneNumber
          }
          sx={{ maxWidth: 300 }}
          InputProps={{ inputComponent: PhoneNumberInput as any }}
        />
        <FormControlLabel
          control={
            <FirestoreBackedSwitch
              disabled={updatingAnything}
              docSnap={userConfigSnapshot!}
              fieldPath="preferences.notifications.sms.updatesEnabled"
              checkBox
            />
          }
          label="SMS updates"
        />
      </FormGroup>
      <Divider sx={{ marginTop: 2, marginBottom: 4 }} />
      <FormGroup>
        <FirestoreBackedTimeRangeField
          disabled={updatingAnything || !windowAlertsEnabled}
          docSnap={userConfigSnapshot!}
          fieldPath="preferences.notifications.sms.alertTimeRange"
          label="Alert time range"
          sx={{ maxWidth: 300, marginBottom: 4 }}
        ></FirestoreBackedTimeRangeField>
        <FirestoreBackedTimeZoneSelect
          disabled={updatingAnything || !windowAlertsEnabled}
          docSnap={userConfigSnapshot!}
          fieldPath="preferences.notifications.sms.alertTimeZone"
        />
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
    </>
  );
};

export default NotificationsTab;
