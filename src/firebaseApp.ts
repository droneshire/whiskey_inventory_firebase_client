import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAeBuFECs5HkVCMyZY9sWdFdmkwDDDo04Y",
  authDomain: "inventory-860f0.firebaseapp.com",
  projectId: "inventory-860f0",
  storageBucket: "inventory-860f0.appspot.com",
  messagingSenderId: "654772159764",
  appId: "1:654772159764:web:d7c9eb778e09964b5cae01",
  measurementId: "G-WNWBCJ0MS1"
};

// Initialize Firebase
const myApp = initializeApp(firebaseConfig);
export default myApp;
