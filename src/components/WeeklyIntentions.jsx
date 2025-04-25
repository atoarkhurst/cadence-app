import { useState, useEffect } from "react";

const STORAGE_KEY = "cadence_intentions";

export default function WeeklyIntentions() {
    const [intentions, setIntentions] = useState(["", "", ""]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved && Array.isArray(saved)) {
            setIntentions(saved);
        }
    }, []);

    const handleChange = (index, value) => {
        const updated = [...intentions];
        updated[index] = value;
        setIntentions(updated);
    };

    const handleSubmit = () => {
        console.log("Submitted intentions:", intentions);
    };

    return (
        <div className="w-full max-w-md rounded-xl bg-white shadow p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-center">Set Your 3 Weekly Intentions</h2>
            {intentions.map((val, idx) => (
                <input
                key={idx}
                type="text"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder={`Intention ${idx + 1}`}
                value={val}
                onChange={(e) => handleChange(idx, e.target.value)}
                />
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
        </div>
    );
}