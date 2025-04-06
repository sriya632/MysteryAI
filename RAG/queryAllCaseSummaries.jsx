import { collection, getDocs } from "firebase/firestore";
import { db } from "./../Firebase/casesDb";

export const queryAllCaseSummaries = async () => {
  const snapshot = await getDocs(collection(db, "embeddings"));
  return snapshot.docs
    .filter(doc => doc.data().field === "summary")
    .map(doc => ({ ...doc.data(), id: doc.id }));
};