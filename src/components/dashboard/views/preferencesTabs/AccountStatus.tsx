import React, { FC } from "react";
import { DocumentSnapshot } from "firebase/firestore";
import { Chip, Typography, FormGroup, Divider } from "@mui/material";

import PaidIcon from "@mui/icons-material/Paid";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import { ClientConfig } from "types/user";
const AccountStatusTab: FC<{
  userConfigSnapshot: DocumentSnapshot<ClientConfig>;
}> = ({ userConfigSnapshot }) => {
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
    </>
  );
};

export default AccountStatusTab;
