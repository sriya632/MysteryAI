import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./casesDb";
import { getEmbeddingFromHF } from "./generateEmbeddingHF";
import { cosineSimilarity } from "./cosineUtils"; // you already have this

export const queryRelevantEmbeddings = async (userQuestion, caseId, topK = 3) => {
  const questionEmbedding = await getEmbeddingFromHF(userQuestion);
  if (!questionEmbedding) return [];

  const q = query(collection(db, "embeddings"), where("caseId", "==", caseId));
  const snapshot = await getDocs(q);

  const scoredChunks = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.embedding || !Array.isArray(data.embedding)) return;

    const score = cosineSimilarity(questionEmbedding, data.embedding);
    scoredChunks.push({
      ...data,
      similarity: score
    });
  });

  // Sort and pick top K
  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  return scoredChunks.slice(0, topK);
};
