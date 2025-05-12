import WeeklyIntentions from "./components/WeeklyIntentions";
import "./index.css";
import CheckIn from "./components/CheckIn";


function App() {
  const testIntentions = [
    { label: "Apply to jobs", type: "count", goal: 20 },
    { label: "Practice Twi", type: "boolean", goal: 2 },
    { label: "Finish MVP", type: "none" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <CheckIn intentions={testIntentions} />
    </div>
  );
}

export default App;
