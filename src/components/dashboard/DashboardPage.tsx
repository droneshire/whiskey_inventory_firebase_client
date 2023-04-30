import React, { FC, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { User } from "firebase/auth";
import {
  collection,
  getFirestore,
  doc,
  CollectionReference,
  DocumentSnapshot,
} from "firebase/firestore";

import { Box, CssBaseline, Toolbar, Container } from "@mui/material";

import myApp from "firebaseApp";
import Copyright from "components/Copyright";
import { useDocumentSnapshot } from "hooks/firebase/firestore";
import AppBar from "./AppBar";
import Drawer from "./Drawer";
import { UserConfig } from "types/user";
import { useViewsList } from "./views/viewsList";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "components/utils/errors";

const drawerWidth: number = 240;

export interface DashboardViewContext {
  user?: User;
  userConfigSnapshot?: DocumentSnapshot<UserConfig>;
}

export interface DashboardProps {
  user: User | null;
}
const DashboardPage: FC<DashboardProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const viewsList = useViewsList(user);
  const userConfigRef = useMemo(() => {
    if (!user) {
      return undefined;
    }
    return doc(
      collection(
        getFirestore(myApp),
        "users"
      ) as CollectionReference<UserConfig>,
      user?.email ?? ""
    );
  }, [user]);
  const userConfigSnapshot = useDocumentSnapshot(userConfigRef);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        drawerIsOpen={open}
        openDrawer={() => setOpen(true)}
        drawerWidth={drawerWidth}
        user={user}
      />
      <Drawer
        open={open}
        viewsList={viewsList}
        setOpen={setOpen}
        drawerWidth={drawerWidth}
      />
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet
              context={{ user, userConfigSnapshot } as DashboardViewContext}
            />
          </ErrorBoundary>
          <Copyright sx={{ pt: 4 }} />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;
