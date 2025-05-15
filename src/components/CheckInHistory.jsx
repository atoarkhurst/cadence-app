import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
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

export default function CheckInHistory() {
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Build: /checkIns where userID == uid order by creaedat desc limit 5
      const q = query(
        collection(db, "checkIns"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCheckIns(list);
    }
    fetchHistory();
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
          className="p-4 rounded-lg bg-gray-100 flex items-start space-x-4"
        >
          <span className="text-3xl">{ci.mood}</span>

          <div className="flex-1">
            <div className="text-sm text-gray-500">{fmt(ci.createdAt)}</div>
            {ci.reflection && <div className="mt-1">{ci.reflection}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
