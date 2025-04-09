import React, { useState, useEffect } from "react";
import Accusation from "./accusation";
import { useCase } from "./useCase";
import { storeCaseInFirestore, updateCaseChat } from "../../Firebase/storeCase.jsx";
import Timer from "./timer.jsx";
import UserStats from "../Stats/UserStats";
import { isAuthenticated } from "../Auth/Auth";
import { auth, db } from '../../Firebase/userAuth';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';


import { storeEmbeddingsForCase } from "./../../Firebase/storeEmbeddings";
import { cosineSimilarity } from "../../RAG/cosineUtils";
import { getRelevantContext } from "./../../RAG/getRelaventContext"; 
import { getEmbeddingFromHF } from "./../../RAG/generateEmbeddingHF";
import { queryAllCaseSummaries } from "./../../RAG/queryAllCaseSummaries";
import { storeOverviewEmbedding } from "../../RAG/storeOverviewEmbedding";

const API_KEY = "AIzaSyA63dd1fVVukrf0mvmfFo8DoRH5vpzigPs";

const GameStart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [viewing, setViewing] = useState("suspect");
  const [showModal, setShowModal] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  
  const getGenderBasedAvatar = (username, gender) => {
    const formattedUsername = encodeURIComponent(username);
    
    if (gender && gender.toLowerCase() === 'female') {
      return `https://avatar.iran.liara.run/public/girl?username=${formattedUsername}`;
    } else {
      return `https://avatar.iran.liara.run/public/boy?username=${formattedUsername}`;
    }
  };
  
  const { caseData, setCaseData } = useCase();

  const [startTime, setStartTime] = useState(Date.now());
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [confirmQuitModal, setConfirmQuitModal] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");

  // Get current username on component mount
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      setCurrentUsername(userData.username);
    }
  }, []);
  
  // Save game stats to localStorage
  const saveGameStats = async(result, timeTaken) => {
    
    if (!auth.currentUser) return;
  
  try {
    // Save game details to userGames collection
    await addDoc(collection(db, "userGames"), {
      userId: auth.currentUser.uid,
      caseTitle: caseData?.case_title || "Mystery Case",
      solved: result,
      timeTaken: timeTaken,
      timestamp: serverTimestamp(),
      caseId: caseData?.id || null
    });
    
    // Create a new game entry
    const userRef = doc(db, "userDetails", auth.currentUser.uid);
    await updateDoc(userRef, {
      "stats.gamesPlayed": increment(1),
      "stats.wins": increment(result ? 1 : 0),
      "stats.totalSolveTime": increment(timeTaken)
    });
  } catch (error) {
    console.error("Error saving game stats:", error);
  }
};

  const handleQuit = () => {
    setConfirmQuitModal(true);
  };
  
  const handleTimerEnd = () => {
    // Logic for when timer ends
    alert("Time's up! Game over.");
    handleGameEnd(false);
  };
  
  const handleTimePause = () => {
    setIsTimerPaused(true);
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    setTotalTimeTaken(prev => prev + elapsedTime);
  };

  const handleTimeResume = () => {
    setIsTimerPaused(false);
    setStartTime(Date.now());
  };
  
  const handleGameEnd = (won, finalTime) => {
    // Calculate total time if not provided
    const gameTime = finalTime || (isTimerPaused 
      ? totalTimeTaken 
      : totalTimeTaken + Math.floor((Date.now() - startTime) / 1000));
    
    // Save game stats
    saveGameStats(won, gameTime);
    
    // Reset game state
    setCaseData(null);
    setSelectedIndex(null);
    setShowModal(false);
    setStartTime(Date.now());
    setTotalTimeTaken(0);
    setIsTimerPaused(false);
  };
  
  // Handle successful case solve (called from Accusation component)
  const handleSuccessfulSolve = (time) => {
    handleGameEnd(true, time);
  };

  const randomSettings = [
    "abandoned amusement park", "deep sea research lab", "underground speakeasy",
    "snowbound mountain lodge", "suburban block party", "VR gaming expo",
    "desert music festival", "private jet", "haunted mansion"
  ];
  
  const randomEvents = [
    "mask reveal ceremony", "talent show", "blizzard lockdown", "power outage",
    "silent auction", "fire drill", "art unveiling", "company IPO party"
  ];
  
  const randomMurderMethods = [
    "poisoned drink", "electrocuted in bath", "stage light rig collapse", "sabotaged harness",
    "crossbow from behind curtain", "snake venom", "laced perfume"
  ];
  
  const seed = Date.now();
  
  const prompt = JSON.stringify({
    instructions: "You are an expert mystery storyteller. Generate a complex and surprising murder mystery in a unique setting.",
    structure: {
      setting: randomSettings[Math.floor(Math.random() * randomSettings.length)],
      event: randomEvents[Math.floor(Math.random() * randomEvents.length)],
      murder_method: randomMurderMethods[Math.floor(Math.random() * randomMurderMethods.length)],
      case_title: "Generate a short creative title.",
      case_overview: "Write an intriguing 3–5 line summary using the setting, event, and method.",
      suspects: "Include 2–4 suspects. Only one is the murderer and is lying. Each must have unique motives, personalities, and styles.",
      witnesses: "Include 0–2 witnesses. They are always truthful but speak vaguely.",
      variation: "Do not repeat names, motives, or structure from prior examples."
    },
    output_format: "{ \"case_title\": \"...\", \"case_overview\": \"...\", \"difficulty\": \"...\", \"suspects\": [ { \"name\": \"...\", \"gender\": \"...\", \"age\": ..., \"clothing\": \"...\", \"personality\": \"...\", \"background\": \"...\", \"alibi\": \"...\", \"is_murderer\": true/false } ], \"witnesses\": [ { \"name\": \"...\", \"description\": \"age, profession, and location during the crime\", \"observation\": \"What they saw or heard, vague but truthful\", \"note\": \"Contextual detail that subtly supports or contradicts a suspect's alibi\" } ] }",
    difficulty: "Medium",
    randomness: "Use a timestamp-based seed to increase randomness.",
    seed: seed
  });

  const extractSummaryForEmbedding = (caseData) => {
    return `${caseData.case_title}. ${caseData.case_overview}`
      .replace(/\n/g, " ")
      .replace(/"/g, "'")
      .replace(/\\+/g, " ")
      .slice(0, 512);
  };

  const callGemini = async () => {
    setLoading(true);
    let attempts = 0;
    let found = false;
    let finalParsed = null;
    let summary = null;
    let newEmbedding = null;
    
    while (attempts < 5 && !found) {
      attempts++;
    
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
      
        if (!text) continue;
      
        text = text.replace(/```json|```/g, "").trim();
        text = text.replace(/^\s*[\r\n]/gm, "").trim();
        const parsed = JSON.parse(text);
        summary = extractSummaryForEmbedding(parsed);
        newEmbedding = await getEmbeddingFromHF(summary);
        
        // Get all past embeddings
        const existingSummaries = await queryAllCaseSummaries();
        const tooSimilar = existingSummaries.some((entry) => {
          const sim = cosineSimilarity(newEmbedding, entry.embedding);
          return sim > 0.91; // tweak threshold
        });
      
        if (!tooSimilar) {
          found = true;
          finalParsed = parsed;
          finalParsed.embedding = newEmbedding;
        }
      } catch (err) {
        console.error("Parse or embed error:", err);
      }
    }
    
    if (!finalParsed) {
      setError("Could not generate a unique case after multiple tries.");
      setLoading(false);
      return;
    }
    
    const userId = currentUsername || null;
    finalParsed.suspects = finalParsed.suspects.map((s) => ({ ...s, chat: [] }));
    finalParsed.witnesses = finalParsed.witnesses?.map((w) => ({ ...w, chat: [] })) || [];
    
    try {
      const docId = await storeCaseInFirestore(finalParsed, userId);
      finalParsed.id = docId;
      await storeOverviewEmbedding(docId, summary, newEmbedding);
      await storeEmbeddingsForCase(finalParsed, docId);
    } catch (error) {
      console.error("Error storing case:", error);
    }

    setCaseData(finalParsed);
    setShowModal(false);
    setSelectedIndex(null);
    setStartTime(Date.now());
    setTotalTimeTaken(0);
    setIsTimerPaused(false);
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

    const dialog = character.chat
      .map((msg) =>
        msg.role === "user"
          ? `Investigator: ${msg.content}`
          : `${character.name}: ${msg.content}`
      )
      .join("\n");

    let context = await getRelevantContext(caseData.id, currentInput);

    const finalPrompt = `
        ${viewing === "suspect" ? `You are ${character.name}, a suspect in a murder case.` 
                                : `You are ${character.name}, a witness in a murder case.`}
        Context from the case:
        ${context || "None available"}
        Chat history:
        ${dialog}
        ${character.name}:
        With the context and the role assigned to you and your chat history, respond according to your character's facts
        and personality. If you are the culprit, make sure to come up with convincing lies to mislead the investigator and try to stick
        to your alibi otherwise it would be very easy to catch him. Do not answer in long paragraphs, try to keep it as concise as possible
        with a soft limit of 35 words. Each character can at most answer 5 questions so make sure that the characters do not get stuck in a
        loop and can reveal at most the observation. Also, provide user with 1 suggested very generic short detective question idea for beginners (in 5 words or less) based on the chat context that would aid them in extracting more useful information.
        Separate the response and hint with @ symbol and give plain text for both without any labels.`;

      
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
      const parts = reply ? reply.split("@") : [];

      if (reply) {
        character.chat.push({ role: "model", parts });
        setCaseData({ ...updated });
        if (caseData.id) {
          await updateCaseChat(caseData.id, {
            suspects: updated.suspects,
            witnesses: updated.witnesses
          });
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
    }

    setCurrentInput("");
    setChatLoading(false);
  };
  
  const handleResetGame = () => {
    setCaseData(null);
    setSelectedIndex(null);
    setShowModal(false);
    callGemini(); // Generate a new case
  };
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/auth';
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-mono">
      <h1 className="text-3xl font-bold text-center text-purple-300 mb-6">🕵️ Murder Mystery</h1>
      
      {!caseData && <UserStats />}
      
      <div className="flex items-center space-x-4 mb-4">
        {/* Timer */}
        {caseData && (
          <Timer 
            onTimerEnd={handleTimerEnd}
            onTimePause={handleTimePause}
            onTimeResume={handleTimeResume}
          />
        )}

        {/* Quit Button */}
        {caseData && (
          <button 
            onClick={handleQuit}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white"
          >
            Quit
          </button>
        )}
      </div>
  
      {/* Only show Generate Case button when no case is active */}
      {!caseData && (
        <div className="flex justify-center mb-10">
          <button
            onClick={callGemini}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Case"}
          </button>
        </div>
      )}
  
      {error && <p className="text-red-400 text-center mb-4">{error}</p>}
  
      {caseData && (
        <>
          <div className="max-w-3xl mx-auto bg-slate-800 p-8 rounded-xl border border-purple-900 shadow-xl mb-10">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">{caseData.case_title}</h2>
            <p className="text-sm text-purple-100 mb-2"><strong>Difficulty:</strong> {caseData.difficulty}</p>
            <p className="text-white">{caseData.case_overview}</p>
          </div>

          <div className="flex justify-center gap-6 flex-wrap mb-8">
            <h2>Interact with the characters to know more!</h2>
          </div>

          <div className="flex justify-center gap-6 flex-wrap mb-8">
            {caseData.suspects.map((suspect, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <button
                  onClick={() => {
                    setSelectedIndex(idx);
                    setViewing("suspect");
                    setShowModal(true);
                  }}
                  className="w-24 h-24 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg overflow-hidden p-0 border-2 border-purple-400"
                >
                  <img 
                    src={getGenderBasedAvatar(suspect.name.replace(/\s+/g, ''), suspect.gender)}
                    alt={`${suspect.name} avatar`}
                    className="w-full h-full object-cover"
                  />
                </button>
                <span className="mt-2 text-sm text-center text-purple-200">{suspect.name}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-6 flex-wrap mb-8">
            {caseData.witnesses.map((witness, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <button
                  onClick={() => {
                    setSelectedIndex(idx);
                    setViewing("witness");
                    setShowModal(true);
                  }}
                  className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md overflow-hidden p-0 border-2 border-blue-400"
                >
                  <img 
                    src={getGenderBasedAvatar(witness.name.replace(/\s+/g, ''), witness.gender)}
                    alt={`${witness.name} avatar`}
                    className="w-full h-full object-cover"
                  />
                </button>
                <span className="mt-2 text-sm text-center text-blue-200">{witness.name}</span>
              </div>
            ))}
          </div>
          
          <Accusation 
            caseData={caseData} 
            onResetGame={handleResetGame} 
            onSuccessfulSolve={() => {
              // Calculate total time
              const totalTime = isTimerPaused 
                ? totalTimeTaken 
                : totalTimeTaken + Math.floor((Date.now() - startTime) / 1000);
                
              handleSuccessfulSolve(totalTime);
            }} 
          />
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
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                          msg.role === "user" ? "bg-purple-600 text-white" : "bg-gray-300 text-black"
                        }`}>
                          {msg.role === "model" && msg.parts ? (
                            <div>
                              <div className="font-normal">{msg.parts[0]}</div>
                              {msg.parts[1] && (
                                <div className="mt-2 font-italic text-xs italic text-gray-600">
                                  <span className="font-bold">Hint:</span> {msg.parts[1]}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>{msg.content}</div>
                          )}
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
      
      {confirmQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-purple-900 p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
            <h2 className="text-xl text-purple-200 font-semibold mb-4">Quit Game?</h2>
            <p className="text-white mb-6">Are you sure you want to quit the game?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setConfirmQuitModal(false);
                  handleGameEnd(false); // Quit without solving the case
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white"
              >
                Yes, Quit
              </button>
              <button
                onClick={() => setConfirmQuitModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStart;