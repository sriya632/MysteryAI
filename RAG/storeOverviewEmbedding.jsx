// /src/Firebase/storeOverviewEmbedding.js
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./../Firebase/casesDb"; // adjust if your Firebase config file is elsewhere

export const storeOverviewEmbedding = async (caseId, summary, embedding) => {
  try {
    const docRef = await addDoc(collection(db, "case_overview_embeddings"), {
      caseId,
      summary,
      embedding,
      createdAt: serverTimestamp(),
    });
    console.log("📌 Overview embedding stored:", docRef.id);
  } catch (err) {
    console.error("❌ Failed to store overview embedding:", err);
  }
};
