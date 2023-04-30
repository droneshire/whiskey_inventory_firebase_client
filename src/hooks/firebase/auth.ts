import { useEffect, useState } from "react";
import { getAuth, User } from "firebase/auth";
import myApp from "firebaseApp";

export const useAuthStateWatcher = () => {
  const auth = getAuth(myApp);
  const [user, setUserState] = useState<User | null>(auth.currentUser);
  const onChange = (user: User | null) => setUserState(user);
  useEffect(() => {
    setUserState(auth.currentUser);
    return auth.onAuthStateChanged(onChange);
  }, [auth]);

  return user;
};
