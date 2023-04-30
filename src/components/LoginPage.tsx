import React, { FC } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {
  AuthProvider,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  Avatar,
  Box,
  Chip,
  ChipProps,
  Container,
  CssBaseline,
  Stack,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";

import { useAuthStateWatcher } from "hooks/firebase/auth";
import Copyright from "components/Copyright";

const signIn = async (providerFactory: () => AuthProvider) => {
  await signInWithPopup(getAuth(), providerFactory());
};

interface LoginButtonProps extends ChipProps {
  providerFactory: () => AuthProvider;
}
const LoginButton: FC<LoginButtonProps> = ({ providerFactory, ...props }) => (
  <Chip onClick={() => signIn(providerFactory)} {...props} />
);

const LoginPage: React.FC = () => {
  const location = useLocation();
  const user = useAuthStateWatcher();

  if (user) {
    const from = (location.state as any)?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2}>
            <LoginButton
              providerFactory={() => new GoogleAuthProvider()}
              icon={<GoogleIcon />}
              label="Google"
            />
          </Stack>
        </Box>
      </Box>
      <Copyright sx={{ mt: 5 }} />
    </Container>
  );
};

export default LoginPage;
