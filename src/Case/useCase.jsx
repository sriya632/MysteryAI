// src/Case/useCase.js
import { useContext } from "react";
import { CaseContext } from "./caseContext";

export const useCase = () => useContext(CaseContext);
