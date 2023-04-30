import React, { FC } from "react";
import { Typography, Link } from "@mui/material";

const Copyright: FC<any> = (props: any) => {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © Joshua Tilton "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
};

export default Copyright;
