import { collection, addDoc } from "firebase/firestore";
import { db } from "./casesDb"; // Adjust this if your firebase file is elsewhere
import { getEmbeddingFromHF } from "./../RAG/generateEmbeddingHF"; 


export const storeEmbeddingsForCase = async (caseData, caseId) => {
  const embeddingsRef = collection(db, "embeddings");

  const itemsToEmbed = [];

  // 1️⃣ Loop through suspects
  caseData.suspects.forEach((suspect) => {
    itemsToEmbed.push({
      caseId,
      role: "suspect",
      name: suspect.name,
      field: "alibi",
      text: suspect.alibi
    });
  });

  // 2️⃣ Loop through witnesses
  caseData.witnesses?.forEach((witness) => {
    itemsToEmbed.push({
      caseId,
      role: "witness",
      name: witness.name,
      field: "observation",
      text: witness.observation
    });
  });

  // 3️⃣ Generate and save embeddings
  for (const item of itemsToEmbed) {
    const embedding = await getEmbeddingFromHF(item.text);
    if (!embedding) continue;

    await addDoc(embeddingsRef, {
      ...item,
      embedding
    });
  }

  console.log("✅ Embeddings saved for case:", caseId);
};
