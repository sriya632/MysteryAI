import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase/casesDb";
import { cosineSimilarity } from "../RAG/cosineUtils";

export const isCaseTooSimilar = async (embedding, threshold = 0.9) => {
  const snapshot = await getDocs(collection(db, "case_embeddings")); // separate collection just for case summaries
  for (const doc of snapshot.docs) {
    const existing = doc.data();
    const similarity = cosineSimilarity(existing.embedding, embedding);
    if (similarity > threshold) {
      console.log("⚠️ Similar case found. Similarity:", similarity);
      return true;
    }
  }
  return false;
};
