import React, {useState} from "react";
import { updateCaseWithGuess } from "./../../Firebase/storeCase";

const Accusation = ({ caseData, onResetGame, onSuccessfulSolve }) => {
    const [accusedName, setAccusedName] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [murdererName, setMurdererName] = useState("");

    const handleSubmit = async(e) => {
        e.preventDefault();
        
        if (!accusedName.trim()) return;
        
        // Find the actual murderer
        const murderer = caseData.suspects.find(suspect => suspect.is_murderer);
        setMurdererName(murderer ? murderer.name : "Unknown");
        
        // Check if accusation is correct (case insensitive comparison)
        const isMatch = murderer && 
          accusedName.toLowerCase().includes(murderer.name.toLowerCase());
          await updateCaseWithGuess(caseData.id, {
            user_guess: accusedName,
            guess_correct: isMatch
          });
        setIsCorrect(isMatch);
        setShowResult(true);
        
        // If the accusation was correct, notify the parent component
        if (isMatch && onSuccessfulSolve) {
          onSuccessfulSolve();
        }
      };

      const handleNextGame = () => {
        setAccusedName("");
        setShowResult(false);
        setIsCorrect(false);
        if (onResetGame) {
          onResetGame();
        }
      };

      if (showResult) {
        return (
          <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-xl border border-purple-900 shadow-xl mt-8 text-center">
            {isCorrect ? (
              <div className="text-green-400">
                <h2 className="text-2xl font-bold mb-4">✅ You Solved the Case!</h2>
                <p className="mb-4">
                  Congratulations, detective! You correctly identified <span className="font-bold">{murdererName}</span> as the murderer.
                </p>
              </div>
            ) : (
              <div className="text-red-400">
                <h2 className="text-2xl font-bold mb-4">❌ Wrong Accusation!</h2>
                <p className="mb-4">
                  Your accusation against <span className="font-bold">{accusedName}</span> was incorrect.
                  The real murderer was <span className="font-bold">{murdererName}</span>.
                </p>
              </div>
            )}
            
            <button
              onClick={handleNextGame}
              className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-md text-white font-semibold shadow-lg"
            >
              Next Case
            </button>
          </div>
        );
      }
  

      return (
        <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-xl border border-purple-900 shadow-xl mt-8">
          <h2 className="text-xl font-bold text-center text-purple-300 mb-4">
            Make Your Accusation
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="accusedName" className="block text-sm font-medium text-gray-300 mb-2">
                Who is the murderer?
              </label>
              <input
                type="text"
                id="accusedName"
                placeholder="Enter the murderer's name"
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={accusedName}
                onChange={(e) => setAccusedName(e.target.value)}
                required
              />
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-md text-white font-semibold shadow-lg"
              >
                Submit Accusation
              </button>
            </div>
          </form>
        </div>
      );
    };
    
export default Accusation;