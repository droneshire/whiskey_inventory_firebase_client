import { useEffect, useState } from "react";
import {
  onSnapshot,
  FirestoreError,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentReference,
  CollectionReference,
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

export function useCollectionSnapshot<DocumentData>(
  collectionReference: CollectionReference<DocumentData> | undefined
): QuerySnapshot<DocumentData> | undefined {
  const [collectionSnap, setCollectionSnap] = useState<QuerySnapshot<DocumentData> | undefined>();
  useEffect(() => {
    console.log("useCollectionSnapshot", collectionReference);
    if (!collectionReference){
      return;
    }
    return onSnapshot(
      collectionReference,
      (snap) => {
        setCollectionSnap(snap);
        snap.forEach((doc) => {
          console.log("Client", doc.id);
        });
      },
      firestoreErrorHandler
    );
  }, [collectionReference]);
  return collectionSnap;
}
