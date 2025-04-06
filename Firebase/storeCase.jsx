// src/storeCase.js
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
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

export const updateCaseWithGuess = async (caseId, { user_guess, guess_correct }) => {
  try {
    const docRef = doc(db, "cases", caseId);
    await updateDoc(docRef, {
      user_guess,
      guess_correct,
      timestamp: new Date()
    });
    console.log("✅ Guess stored.");
  } catch (error) {
    console.error("❌ Error storing guess:", error);
  }
};
