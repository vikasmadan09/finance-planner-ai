import { useContext, useEffect, useState } from "react";
import ExpenseChart from "../components/ExpenseChart";
import AddExpense from "./AddExpense";
import axios from "axios";
import { PlusIcon, SparklesIcon } from "@heroicons/react/24/solid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ExpenseList from "@/components/ExpenseList";
import ChartWithFilter from "@/components/ChartWithFilter";
import { ENV } from "@/core/config";
import MovingBanner from "@/components/MovingBanner";
import { Suggestion } from "@/components/Suggestion";
import { Tooltip as CustomTooltip } from "@/components/tooltip/Tooltip";
import { UserMetadata } from "@/components/UserMetadata";
import { UserContext } from "@/layouts/DashboardLayout";
import { useNotification } from "@/context/NotificationContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestions, setSuggestions] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const { country, userMetadataLoading } = useContext(UserContext);
  const notify = useNotification();

  const handleSuggestion = () => {
    setSuggestionLoading(true);
    axios
      .post(
        `${ENV.API_URL}/ai/suggest`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then((response) => {
        const { data } = response;
        setSuggestions(data.suggestion);
        setSuggestionLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching expenses:", error);
        setSuggestionLoading(false);
      });
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${ENV.API_URL}/expenses`, {
        withCredentials: true,
      });
      const { data } = response.data;
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      notify.error("Failed to fetch expenses");
      setExpenses([]);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div>
      <MovingBanner />
      <div
        className={`p-6 ${
          isOpen || showSuggestion || !country ? "opacity-50" : ""
        } `}
      >
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="flex flex-wrap gap-6 justify-around">
          <ExpenseChart />
          <ChartWithFilter originalData={expenses} />
        </div>
      </div>
      <div className="p-6 max-w-5md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <ExpenseList expenses={expenses} />
      </div>
      <button
        className="fixed bottom-15 right-0 m-4 p-4 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition duration-300"
        onClick={() => setIsOpen(true)}
      >
        <CustomTooltip text="Add Expense" position="top">
          <PlusIcon className="h-6 w-6" />
        </CustomTooltip>
      </button>
      <AddExpense
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        fetchExpenses={fetchExpenses}
      />
      <button
        className="fixed bottom-0 right-0 m-4 p-4 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition duration-300"
        onClick={() => {
          setShowSuggestion(true);
          handleSuggestion();
        }}
      >
        <CustomTooltip text="Get Suggestions" position="top">
          <SparklesIcon className="w-6 h-6 text-yellow-400 cursor-pointer" />
        </CustomTooltip>
      </button>
      <Suggestion
        isOpen={showSuggestion}
        setIsOpen={setShowSuggestion}
        suggestions={suggestions}
        suggestionLoading={suggestionLoading}
      />
      {!userMetadataLoading && !country && (
        <div className="fixed z-50 inset-0 flex items-center justify-center text-center shadow-md rounded">
          <div className="bg-white p-6 rounded shadow-lg w-1/2 max-h-[90vh] overflow-y-auto">
            <UserMetadata />
          </div>
        </div>
      )}
    </div>
  );
}
