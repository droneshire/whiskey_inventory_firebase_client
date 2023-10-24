import React, { FC, useState } from "react";
import {
  deleteField,
  DocumentSnapshot,
  FieldPath,
  updateDoc,
} from "firebase/firestore";
import phone from "phone";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Divider,
  IconButton,
  InputAdornment,
  Fab,
  Tooltip,
} from "@mui/material";
import AddIcCallIcon from "@mui/icons-material/AddIcCall";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

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
  const [phoneNumbers, setPhoneNumbers] = useState([{ id: 1 }]);

  const handleAddPhone = () => {
    setPhoneNumbers([...phoneNumbers, { id: phoneNumbers.length + 1 }]);
  };

  const handleDeletePhone = (id: number) => {
    setPhoneNumbers(
      phoneNumbers.filter((phoneNumber) => phoneNumber.id !== id)
    );
    updateDoc(
      userConfigSnapshot.ref,
      new FieldPath(
        "preferences",
        "notifications",
        "sms",
        "phoneNumbers",
        id.toString()
      ),
      deleteField()
    );
  };

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
      <div style={{ position: "relative" }}>
        <FormGroup>
          {phoneNumbers.map((phoneId, index) => (
            <FirestoreBackedTextField
              key={phoneId.id}
              label="Phone number"
              disabled={updatingAnything}
              docSnap={userConfigSnapshot!}
              fieldPath={`preferences.notifications.sms.phoneNumbers.${index.toString()}`}
              variant="standard"
              isValid={(phoneNumber) =>
                !phoneNumber || phone(phoneNumber).isValid
              }
              helperText={(phoneNumber, validPhone) =>
                validPhone ? "" : "Invalid phone number:" + phoneNumber
              }
              sx={{ maxWidth: 300 }}
              InputProps={{
                inputComponent: PhoneNumberInput as any,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => handleDeletePhone(phoneId.id)}
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ))}
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
        <Tooltip title="Add phone number">
          <span>
            <Fab
              color="primary"
              aria-label="add"
              onClick={handleAddPhone}
              style={{ position: "absolute", bottom: "16px", right: "16px" }}
            >
              <AddIcCallIcon />
            </Fab>
          </span>
        </Tooltip>
      </div>
    </>
  );
};

export default NotificationsTab;
