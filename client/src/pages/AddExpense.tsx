import React, { useState } from "react";
import axios from "axios";
import { ENV } from "@/core/config";
import { useNotification } from "@/context/NotificationContext";

export default function AddExpense({
  isOpen,
  setIsOpen,
  fetchExpenses,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchExpenses: () => void;
}) {
  const notify = useNotification();
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisabled(true);
    setIsOpen(false);
    axios(`${ENV.API_URL}/expenses`, {
      method: "POST",
      data: {
        item,
        amount,
        notes,
      },
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
      .then(() => {
        fetchExpenses();
        notify.success("Expense added successfully");
      })
      .catch((error) => {
        console.error("Error adding expense:", error);
        notify.error("Add Expense failed");
      })
      .finally(() => {
        setItem("");
        setAmount("");
        setNotes("");
        setDisabled(false);
      });
  };

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center ">
        <div className="bg-white p-6 rounded shadow-lg w-80">
          <h2 className="text-xl font-semibold mb-4">Add Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Item<sup className="pl-2 text-red-500">*</sup>
              </label>
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full mt-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Notes <span className="text-xs">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setItem("");
                  setAmount("");
                  setNotes("");
                }}
                className="px-4 py-2 text-gray-700 hover:underline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                disabled={disabled || !item || !amount}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}
