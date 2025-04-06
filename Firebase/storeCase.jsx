// src/storeCase.js
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "./casesDb";

export const storeCaseInFirestore = async (caseData, userId) => {
  try {
    const docRef = await addDoc(collection(db, "cases"), {
      ...caseData,
      createdBy: userId,
      timestamp: serverTimestamp(),
      embedding: null
    });
    console.log("Case stored with ID:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("Error adding case to Firestore:", err);
    throw err;
  }
};

export const updateCaseChat = async (caseId, updatedChatData) => {
    try {
      const ref = doc(db, "cases", caseId);
      await updateDoc(ref, {
        suspects: updatedChatData.suspects,
        witnesses: updatedChatData.witnesses
      });
    } catch (err) {
      console.error("Error updating chat in Firestore:", err);
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
