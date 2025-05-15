import { useEffect, useState } from "react";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import WeeklyIntentions from "./components/WeeklyIntentions";
import CheckIn from "./components/CheckIn";
import CheckInHistory from "./components/CheckInHistory";
import "./index.css";

function App() {
  const [view, setView] = useState("intentions"); // move inside the component

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth)
          .then(() => console.log("✅ Signed in anonymously"))
          .catch((error) => console.error("❌ Auth error:", error));
      } else {
        console.log("🔐 Logged in as:", user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      <div className="absolute top-4 right-4 space-x-2">
        <button
          onClick={() => setView("intentions")}
          className={`px-4 py-2 rounded ${
            view === "intentions" ? "bg-indigo-600 text-white" : "bg-gray-200"
          }`}
        >
          Weekly Setup
        </button>
        <button
          onClick={() => setView("checkin")}
          className={`px-4 py-2 rounded ${
            view === "checkin" ? "bg-indigo-600 text-white" : "bg-gray-200"
          }`}
        >
          Daily Check-In
        </button>
      </div>

      {view === "intentions" ? (
        <WeeklyIntentions />
      ) : (
        <>
          <CheckIn />
          {/* little spacer */}
          <div className="mt-8" />
          <CheckInHistory />
        </>
      )}
    </div>
  );
}

export default App;
