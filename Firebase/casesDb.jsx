// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAPPv3XYZW26dlicnpwUUYcgWlrfbxNIj8",
    authDomain: "mysteryai-46907.firebaseapp.com",
    projectId: "mysteryai-46907",
    storageBucket: "mysteryai-46907.firebasestorage.app",
    messagingSenderId: "415359645504",
    appId: "1:415359645504:web:2b21c63d87bef26782eca5",
    measurementId: "G-8GV2348PB2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ---- storeCase.js ----
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";

export const storeCaseInFirestore = async (caseData, userId) => {
  try {
    const docRef = await addDoc(collection(db, "cases"), {
      ...caseData,
      createdBy: userId,
      timestamp: serverTimestamp(),
      embedding: null // Optional, for RAG
    });
    console.log("Case stored with ID:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("Error adding case to Firestore:", err);
    throw err;
  }
};

export const updateUserStats = async (userId, isWin, timeTaken) => {
  const ref = doc(db, "users", userId, "stats", "default");
  await updateDoc(ref, {
    gamesPlayed: increment(1),
    wins: increment(isWin ? 1 : 0),
    totalSolveTime: increment(timeTaken || 0)
  });
};

// ---- caseContext.js ----
import { createContext, useContext, useState } from "react";

const CaseContext = createContext();

export const CaseProvider = ({ children }) => {
  const [caseData, setCaseData] = useState(null);

  return (
    <CaseContext.Provider value={{ caseData, setCaseData }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => useContext(CaseContext);
