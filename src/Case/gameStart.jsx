import React, { useState } from "react";

const API_KEY = "AIzaSyA63dd1fVVukrf0mvmfFo8DoRH5vpzigPs" // Replace with your actual key

const App = () => {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [viewing, setViewing] = useState("suspect");
  const [showModal, setShowModal] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const prompt = `Generate a fictional murder mystery case as a JSON object.

Instructions:
- Include a "case_title", "case_overview", "difficulty", "suspects", and "witnesses"
- 1 murder, 1 murderer among 2–4 suspects
- Each suspect has: name, gender, age, clothing, personality, background, alibi, is_murderer
- Include 2 witnesses: name, description, observation (should not point too obviously to murderer)
- Difficulty: Medium
- Make all characters feel real, with unique voices and motivations
- Format the output as raw JSON (do not wrap in markdown or backticks)`;

  const callGemini = async () => {
    setLoading(true);
    setError(null);
    setCaseData(null);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await res.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        text = text.replace(/```json|```/g, "").trim();
        try {
          const parsed = JSON.parse(text);
          parsed.suspects = parsed.suspects.map((s) => ({ ...s, chat: [] }));
          parsed.witnesses = parsed.witnesses?.map((w) => ({ ...w, chat: [] })) || [];
          setCaseData(parsed);
        } catch (err) {
          console.error("Parsing error:", err);
          setError("Failed to parse Gemini response as JSON.");
        }
      } else {
        setError("No response or invalid format from Gemini.");
      }
    } catch (err) {
      console.error("Error calling Gemini:", err);
      setError("Failed to generate case.");
    }

    setLoading(false);
  };

  const sendMessageToCharacter = async () => {
    if (!currentInput.trim()) return;

    const updated = { ...caseData };
    const key = viewing === "suspect" ? "suspects" : "witnesses";
    const character = updated[key][selectedIndex];
    character.chat.push({ role: "user", content: currentInput });

    setCaseData(updated);
    setChatLoading(true);

    const intro =
      viewing === "suspect"
        ? `You are ${character.name}, a suspect in a murder case. Respond as yourself.\n\n`
        : `You are ${character.name}, a witness in a murder case. Respond as yourself.\n\n`;

    const dialog = character.chat
      .map((msg) =>
        msg.role === "user"
          ? `Investigator: ${msg.content}`
          : `${character.name}: ${msg.content}`
      )
      .join("\n");

    const finalPrompt = intro + dialog + `\n${character.name}:`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
          }),
        }
      );

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (reply) {
        character.chat.push({ role: "model", content: reply });
        setCaseData({ ...updated });
      }
    } catch (err) {
      console.error("Chat error:", err);
    }

    setCurrentInput("");
    setChatLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-mono">
      <h1 className="text-3xl font-bold text-center text-purple-300 mb-6">🕵️ Murder Mystery</h1>

      <div className="flex justify-center mb-10">
        <button
          onClick={callGemini}
          disabled={loading}
          className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Case"}
        </button>
      </div>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      {caseData && (
        <>
          <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-xl border border-purple-900 shadow-xl mb-10">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">{caseData.case_title}</h2>
            <p className="text-sm text-purple-100 mb-2"><strong>Difficulty:</strong> {caseData.difficulty}</p>
            <p className="text-white">{caseData.case_overview}</p>
          </div>

          <div className="flex justify-center gap-4 flex-wrap mb-6">
            {caseData.suspects.map((suspect, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedIndex(idx);
                  setViewing("suspect");
                  setShowModal(true);
                }}
                className="w-20 h-20 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold flex items-center justify-center shadow-lg"
              >
                {suspect.name[0]}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-4 flex-wrap mb-6">
            {caseData.witnesses.map((witness, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedIndex(idx);
                  setViewing("witness");
                  setShowModal(true);
                }}
                className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold flex items-center justify-center shadow-md"
              >
                {witness.name[0]}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && selectedIndex !== null && caseData?.[viewing === "suspect" ? "suspects" : "witnesses"]?.[selectedIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-purple-900 p-8 rounded-xl shadow-2xl w-full max-w-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
            >
              ✖
            </button>

            {(() => {
              const character = caseData[viewing === "suspect" ? "suspects" : "witnesses"][selectedIndex];
              return (
                <>
                  <div className="text-white space-y-2 mb-6">
                    <h3 className="text-xl font-bold text-purple-300">
                      {viewing === "suspect" ? "🕵️ Interviewing" : "👀 Witness"} {character.name}
                    </h3>
                    {Object.entries(character)
                      .filter(([key]) => !["chat", "name", "is_murderer"].includes(key))
                      .map(([key, value], i) => (
                        <p key={i}>
                          <strong className="capitalize">{key}:</strong> {value}
                        </p>
                      ))}
                  </div>

                  <div className="bg-slate-700 h-64 rounded p-3 overflow-y-auto text-sm space-y-3">
                    {character.chat.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            msg.role === "user"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-300 text-black"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex mt-4 gap-2">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessageToCharacter()}
                      placeholder="Ask a question..."
                      className="flex-1 p-2 rounded bg-slate-600 text-white"
                    />
                    <button
                      onClick={sendMessageToCharacter}
                      disabled={chatLoading}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
                    >
                      {chatLoading ? "..." : "Send"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;




