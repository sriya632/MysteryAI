// rag/queryRelevantEmbeddings.js
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./../Firebase/casesDb";
import { cosineSimilarity } from "./cosineUtils";
import { getEmbeddingFromHF } from "./generateEmbeddingHF";

export const getRelevantContext = async (caseId, input) => {
  const inputEmbedding = await getEmbeddingFromHF(input);
  if (!inputEmbedding) return null;

  const q = query(collection(db, "embeddings"), where("caseId", "==", caseId));
  const snapshot = await getDocs(q);

  let bestMatch = null;
  let bestScore = -1;

  snapshot.forEach(doc => {
    const data = doc.data();
    const score = cosineSimilarity(data.embedding, inputEmbedding);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = data.text;
    }
  });

  return bestMatch;
};
