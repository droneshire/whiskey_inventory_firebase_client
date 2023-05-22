import { useEffect, useState } from "react";
import {
  getAuth,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  doc,
  where,
  setDoc,
} from "firebase/firestore";
import myApp from "firebaseApp";

import { ClientConfig } from "types/user";

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

interface EmailLoginProps {
  email: string;
  password: string;
}

interface RegisterEmailProps extends EmailLoginProps {
  name: string;
  collection_name: string;
  default_config: ClientConfig;
}

export const signInWithGoogle = async (collection_name: string, default_config: ClientConfig) => {
  try {
    const db = getFirestore(myApp);
    const res = await signInWithPopup(getAuth(myApp), new GoogleAuthProvider());
    const user = res.user;
    const q = query(collection(db, collection_name), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0 && user.email) {
      await setDoc(doc(collection(db, collection_name), user.email), default_config);
    }
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

export const logInWithEmailAndPassword = async (props: EmailLoginProps) => {
  const { email, password } = props;
  try {
    await signInWithEmailAndPassword(getAuth(myApp), email, password);
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};


export const registerWithEmailAndPassword = async (props: RegisterEmailProps) => {
  const { name, email, password, collection_name, default_config } = props;
  try {
    const db = getFirestore(myApp);
    console.log("Creating new user: ", name, email);
    const res = await createUserWithEmailAndPassword(getAuth(myApp), email, password);
    const user = res.user;
    const q = query(collection(db, collection_name), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await setDoc(doc(collection(db, collection_name), email), default_config);
    }
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(getAuth(myApp), email);
    alert("Password reset link sent!");
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

export const logout = () => {
  signOut(getAuth(myApp));
};
