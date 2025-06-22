import React, { useContext, useEffect, useState } from "react";
import classnames from "classnames";
import isEqual from "lodash/isEqual";
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
import ExpenseList, { type Expense } from "@/components/ExpenseList";
import ChartWithFilter from "@/components/ChartWithFilter";
import { ENV } from "@/core/config";
import MovingBanner from "@/components/MovingBanner";
import { Suggestion } from "@/components/Suggestion";
import { Tooltip as CustomTooltip } from "@/components/tooltip/Tooltip";
import { UserMetadata } from "@/components/UserMetadata";
import { UserContext } from "@/layouts/DashboardLayout";
import { useNotification } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestions, setSuggestions] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(
    null
  );
  const [modalType, setModalType] = React.useState<"edit" | "delete" | null>(
    null
  );

  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const notify = useNotification();

  const { country, userMetadataLoading } = useContext(UserContext);

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setModalType("edit");
    setEditExpense(expense);
  };

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense);
    setModalType("delete");
  };

  const handleCloseModal = () => {
    setSelectedExpense(null);
    setModalType(null);
  };

  const handleUpdateExpense = () => {
    if (!selectedExpense) return;

    const updatedExpense = {
      item: editExpense?.item || selectedExpense.item,
      amount: Number(editExpense?.amount || selectedExpense.amount),
      notes: editExpense?.notes || selectedExpense.notes,
    };
    setIsUpdating(true);
    axios
      .put(`${ENV.API_URL}/expenses/${selectedExpense.id}`, updatedExpense, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then(() => {
        fetchExpenses();
        notify.success("Expense updated successfully");
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          notify.error("Session expired. Please login again.");
          navigate("/");
          return;
        }
        notify.error("Failed to update expense");
      })
      .finally(() => {
        setIsUpdating(false);
        setSelectedExpense(null);
        setModalType(null);
      });
  };

  const handleDeleteExpense = () => {
    axios
      .delete(`${ENV.API_URL}/expenses/${selectedExpense?.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      })
      .then(() => {
        fetchExpenses();
        notify.success("Expense deleted successfully");
      })
      .catch(() => {
        notify.error("Failed to delete expense");
      })
      .finally(() => {
        setSelectedExpense(null);
        setModalType(null);
      });
  };

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
    setTableLoading(true);
    try {
      const response = await axios.get(`${ENV.API_URL}/expenses`, {
        withCredentials: true,
      });
      const { data } = response.data;
      setExpenses(data);
      setTableLoading(false);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      notify.error("Failed to fetch expenses");
      setExpenses([]);
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const renderModal = () => {
    if (!modalType || !selectedExpense) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {modalType === "edit" ? "Edit Expense" : "Delete Expense"}
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {modalType === "edit" ? (
            <div>
              <p>
                Edit form for <b>{selectedExpense.category}</b> on{" "}
                {selectedExpense.date}
              </p>
              <div>
                <label className="block text-sm font-medium">
                  Item<sup className="pl-2 text-red-500">*</sup>
                </label>
                <input
                  type="text"
                  value={editExpense?.item || selectedExpense?.item}
                  onChange={(e) =>
                    setEditExpense((prev) =>
                      prev
                        ? { ...prev, item: e.target.value }
                        : { ...selectedExpense, item: e.target.value }
                    )
                  }
                  className="w-full mt-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Amount<sup className="pl-2 text-red-500">*</sup>
                </label>
                <input
                  type="number"
                  value={editExpense?.amount || selectedExpense?.amount}
                  onChange={(e) =>
                    setEditExpense((prev) =>
                      prev
                        ? { ...prev, amount: Number(e.target.value) }
                        : { ...selectedExpense, amount: Number(e.target.value) }
                    )
                  }
                  className="w-full mt-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Notes<sup className="pl-2 text-red-500">*</sup>
                </label>
                <textarea
                  rows={2}
                  value={editExpense?.notes || selectedExpense.notes}
                  onChange={(e) =>
                    setEditExpense((prev) =>
                      prev
                        ? { ...prev, notes: e.target.value }
                        : { ...selectedExpense, notes: e.target.value }
                    )
                  }
                  className="w-full mt-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring"
                  required
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Close
                </button>
                <button
                  onClick={handleUpdateExpense}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                  disabled={isEqual(editExpense, selectedExpense) || isUpdating}
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p>
                Are you sure you want to delete{" "}
                <b>{selectedExpense.category}</b> on {selectedExpense.date}?
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteExpense}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <MovingBanner />
      <div
        className={`p-6 ${
          isOpen || showSuggestion || !country || modalType ? "opacity-50" : ""
        } `}
      >
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="flex flex-wrap gap-6 justify-around">
          <ExpenseChart />
          <ChartWithFilter originalData={expenses} />
        </div>
      </div>
      {renderModal()}
      <div
        className={classnames("p-6 max-w-5md mx-auto pb-20", {
          "opacity-50": isOpen || showSuggestion || !country || modalType,
        })}
      >
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <ExpenseList
          expenses={expenses}
          tableDataLoading={tableLoading}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
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
