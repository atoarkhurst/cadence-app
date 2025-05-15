import { useEffect, useState } from "react";
import { db } from "../firebase";
import { auth } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function CheckIn() {
  const [intentions, setIntentions] = useState([]);
  const [mood, setMood] = useState("");
  const [reflection, setReflection] = useState("");
  const [progressUpdates, setProgressUpdates] = useState({});

  useEffect(() => {
    const fetchIntentions = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const q = query(
        collection(db, "weeklyIntentions"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(q);
      console.log("🔥 Fetched weekly intentions snapshot:", snapshot);

      if (!snapshot.empty) {
        const latest = snapshot.docs[0].data();
        console.log("✅ Latest weekly doc:", latest);

        setIntentions(latest.intentions || []);
      } else {
        console.warn("❌ No weekly intentions found for user.");
      }
    };

    fetchIntentions();
  }, []);

  const handleChange = (key, value) => {
    setProgressUpdates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!mood) {
      alert("Please select a mood before submitting.");
      return;
    }

    try {
      await addDoc(collection(db, "checkIns"), {
        userId: auth.currentUser.uid,
        mood,
        reflection,
        progressUpdates,
        createdAt: serverTimestamp(),
      });
      alert("Check-in saved!");
      setMood("");
      setReflection("");
      setProgressUpdates({});
    } catch (error) {
      console.error("Error saving check-in:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white shadow rounded-xl space-y-6">
      <h2 className="text-2xl font-semibold text-center"> Daily Check-In</h2>
      <div className="flex justify-between text-2xl">
        {["😄", "🙂", "😐", "😞", "😭"].map((m) => (
          <button
            key={m}
            onClick={() => setMood(m)}
            className={`p-2 rounded-full ${mood === m ? "bg-indigo-100" : ""}`}
          >
            {m}
          </button>
        ))}
      </div>

      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Write anything you want (optional)…"
        className="w-full p-3 border rounded-lg"
      />

      <div className="space-y-4">
        {intentions.map((item, idx) => {
          if (!item.label) return null;

          //create a unique key from the label
          const key = item.label.toLowerCase().replace(/\s+/g, "_");

          if (item.type === "count") {
            return (
              <div key={idx}>
                <label className="block mb-1 font-medium">{item.label}</label>
                <input
                  type="number"
                  onChange={(e) => handleChange(key, Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            );
          }
          if (item.type === "boolean") {
            return (
              <div key={idx} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  onChange={(e) => handleChange(key, e.target.checked)}
                />
                <label>{item.label}</label>
              </div>
            );
          }

          return null;
        })}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
      >
        Check In →
      </button>
    </div>
  );
}
