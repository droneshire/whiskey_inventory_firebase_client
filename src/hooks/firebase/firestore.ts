import { useEffect, useState } from "react";
import {
  onSnapshot,
  FirestoreError,
  DocumentSnapshot,
  DocumentReference,
} from "firebase/firestore";

const firestoreErrorHandler = (error: FirestoreError) => {
  console.error("TODO: Alerting", error);
};

export function useDocumentSnapshot<DocType>(
  docReference: DocumentReference<DocType> | undefined
): DocumentSnapshot<DocType> | undefined {
  const [docSnap, setDocSnap] = useState<
    DocumentSnapshot<DocType> | undefined
  >();
  useEffect(() => {
    if (!docReference) {
      return;
    }
    return onSnapshot(
      docReference,
      (snap) => setDocSnap(snap),
      firestoreErrorHandler
    );
  }, [docReference]);
  return docSnap;
}
