import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

function fmt(ts) {
  return ts.toDate().toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function niceKey(k) {
  return k
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function CheckInHistory() {
  const [checkIns, setCheckIns] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState({});

  useEffect(() => {
    async function fetchHistory(uid) {
      try {
        
        // 1. Fetch last 5 check‑ins
        const checkInQ = query(
          collection(db, "checkIns"),
          where("userId", "==", uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const snap = await getDocs(checkInQ);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCheckIns(list);

        // 2. Fetch latest weekly plan to get goal numbers
        const weekQ = query(
          collection(db, "weeklyIntentions"),
          where("userId", "==", uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const weekSnap = await getDocs(weekQ);
        if (!weekSnap.empty) {
          const intentionsArr = weekSnap.docs[0].data().intentions || [];
          const goalMap = {};
          intentionsArr.forEach((i) => {
            const key = i.label.toLowerCase().replace(/\s+/g, "_");
            if (i.type === "count") goalMap[key] = i.goal;
          });
          setWeeklyGoals(goalMap);
        }
      } catch (err) {
        console.error("Fetch history error →", err);
      }
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchHistory(user.uid);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-4 w-full max-w-md">
      <h3 className="text-xl font-semibold">Recent Check-Ins</h3>

      {checkIns.length === 0 && (
        <p className="text-gray-500">No check-ins yet</p>
      )}

      {checkIns.map((ci) => (
        <div
          key={ci.id}
          className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition flex items-start space-x-3 shadow-sm"
        >
          <span className="text-2xl">{ci.mood}</span>

          <div className="flex-1">
            <div className="text-xs text-gray-500">{fmt(ci.createdAt)}</div>

            {ci.reflection && (
              <p className="mt-1 text-sm leading-snug">{ci.reflection}</p>
            )}
            {/* show progress bullet points */}
            {ci.progressUpdates && Object.keys(ci.progressUpdates).length > 0 && (
              <ul className="mt-2 text-xs text-gray-600 space-y-1">
                {Object.entries(ci.progressUpdates).map(([k, v]) => (
                  <li key={k}>
                    {niceKey(k)}:{" "}
                    {typeof v === "boolean" ? (v ? "✔" : "✖") : v}
                    {typeof v === "number" && weeklyGoals[k] && (
                      <div className="h-1 bg-gray-200 rounded mt-1">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${Math.min(100, (v / weeklyGoals[k]) * 100)}%` }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
