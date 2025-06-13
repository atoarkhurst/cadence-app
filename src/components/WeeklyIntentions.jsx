import { useState, useEffect } from "react";
import { db } from "../firebase";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const STORAGE_KEY = "cadence_intentions";

export default function WeeklyIntentions({ onSaved }) {
  const [intentions, setIntentions] = useState([
    { label: "", type: "none", goal: "" },
    { label: "", type: "none", goal: "" },
    { label: "", type: "none", goal: "" },
  ]);
  const [savedIntentions, setSavedIntentions] = useState([]);

  useEffect(() => {
    // Load from LocalStorage
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved)) {
      setIntentions(saved);
    }

    const fetchSavedIntentions = async (uid) => {
      try {
        const q = query(
          collection(db, "weeklyIntentions"),
          where("userId", "==", uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const intentionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedIntentions(intentionsList);
      } catch (error) {
        console.error("Error fetching intentions:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchSavedIntentions(user.uid);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (index, value) => {
    const updated = [...intentions];
    updated[index] = value;
    setIntentions(updated);
  };
  const updateIntention = (index, field, value) => {
    setIntentions((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (intentions.some((i) => !i.label.trim()))
      return alert("Fill all 3 first 🙂");

    try {
      await addDoc(collection(db, "weeklyIntentions"), {
        userId: auth.currentUser.uid, // ← add this
        intentions: intentions.map((i) => ({
          label: i.label,
          type: i.type || "none",
          ...(i.type === "count" && i.goal ? { goal: Number(i.goal) } : {}),
        })),
        createdAt: new Date(),
      });
      alert("Intentions saved to Firestore – good luck!");
      if (onSaved) onSaved();      // auto‑navigate to Check‑In
    } catch (error) {
      console.error("Error saving intentions:", error);
      alert("Failed to save intentions. Try again.");
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white shadow p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-center">
        Set Your 3 Weekly Intentions
      </h2>
      {intentions.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <input
            type="text"
            placeholder={`Intention ${idx + 1}`}
            value={item.label}
            onChange={(e) => updateIntention(idx, "label", e.target.value)}
            className="w-full p-3 border rounded-lg"
          />

          <select
            value={item.type}
            onChange={(e) => updateIntention(idx, "type", e.target.value)}
            className="w-full p-2 border rounded-md text-sm bg-white"
          >
            <option value="none">One-time goal (default)</option>
            <option value="boolean">Repeatable goal (check off)</option>
            <option value="count">Track numeric goal</option>
          </select>

          {item.type === "count" && (
            <input
              type="number"
              placeholder="Goal (e.g. 20)"
              value={item.goal}
              onChange={(e) => updateIntention(idx, "goal", e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"
      >
        Start This Week →
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your partner will see these.
      </p>

      <div className="pt-6">
        <h3 className="text-lg font-semibold mb-2 text-center">
          Past Intentions
        </h3>
        <ul className="space-y-4">
          {savedIntentions.map((item) => (
            <li key={item.id} className="p-4 bg-gray-100 rounded-lg">
              <ul className="list-disc list-inside space-y-1">
                {item.intentions.map((intent, idx) => (
                  <li key={idx}>
                    {intent.label}
                    {intent.type === "count" && ` — Goal: ${intent.goal}`}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
