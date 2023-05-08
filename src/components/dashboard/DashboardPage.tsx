import React, { FC, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { User } from "firebase/auth";
import {
  collection,
  getFirestore,
  doc,
  CollectionReference,
  DocumentSnapshot,
  DocumentReference,
  QuerySnapshot,
} from "firebase/firestore";

import { Box, CssBaseline, Toolbar, Container } from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";

import Copyright from "components/Copyright";
import myApp from "firebaseApp";
import AppBar from "./AppBar";
import Drawer from "./Drawer";
import { useViewsList } from "./views/viewsList";
import { ErrorFallback } from "components/utils/errors";
import { ADMIN_USERS } from "utils/constants";
import { ClientsConfig, UserConfig } from "types/user";
import {
  useDocumentSnapshot,
  useCollectionSnapshot,
} from "hooks/firebase/firestore";
const drawerWidth: number = 240;

export interface DashboardViewContext {
  user?: User;
  userConfigSnapshot?: DocumentSnapshot<UserConfig>;
  userConfigRef?: DocumentReference<UserConfig>;
  clientsSnapshot?: QuerySnapshot<ClientsConfig>;
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
        "clients"
      ) as CollectionReference<UserConfig>,
      user?.email ?? ""
    );
  }, [user]);
  const clientsConfigRef = useMemo(() => {
    console.log(user?.email, ADMIN_USERS.includes(user?.email ?? ""));
    if (user && ADMIN_USERS.includes(user.email ?? "")) {
      return collection(
        getFirestore(myApp),
        "clients"
      ) as CollectionReference<ClientsConfig>;
    }
    return undefined;
  }, [user]);
  const userConfigSnapshot = useDocumentSnapshot(userConfigRef);
  const clientsSnapshot = useCollectionSnapshot(clientsConfigRef);

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
              context={
                {
                  user,
                  userConfigSnapshot,
                  userConfigRef,
                  clientsSnapshot,
                } as DashboardViewContext
              }
            />
          </ErrorBoundary>
          <Copyright sx={{ pt: 4 }} />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;
