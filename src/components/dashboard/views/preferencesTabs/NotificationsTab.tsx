import React, { FC } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import phone from "phone";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Divider,
} from "@mui/material";

import { ClientConfig } from "types/user";
import {
  EmailInput,
  FirestoreBackedSwitch,
  FirestoreBackedTextField,
  PhoneNumberInput,
} from "components/utils/forms";
import { isValidEmail } from "utils/validators";

const NotificationsTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
  const updatingAnything = !!userConfigSnapshot?.metadata.fromCache;
  return (
    <>
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
    </>
  );
};

export default NotificationsTab;
