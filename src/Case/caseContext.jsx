// src/Case/caseContext.js
import { createContext, useContext, useState } from "react";

export const CaseContext = createContext();

export const CaseProvider = ({ children }) => {
  const [caseData, setCaseData] = useState(null);

  return (
    <CaseContext.Provider value={{ caseData, setCaseData }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => useContext(CaseContext);
