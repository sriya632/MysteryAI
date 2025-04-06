export const extractSummaryForEmbedding = (caseData) => {
    return `${caseData.case_title}. ${caseData.case_overview}`;
  };