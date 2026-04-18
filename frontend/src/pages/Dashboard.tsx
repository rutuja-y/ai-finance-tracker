import { useState } from "react";
import { useEffect } from "react";
import type { Transaction } from "../types/Transaction";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Dashboard({
  transactions,
  setTransactions
}: {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}) {

  const [budgets, setBudgets] = useState<Record<string, number>>({
    Food: 3000,
    Shopping: 2000,
    Travel: 1500,
  });
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const fetchTransactions = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://127.0.0.1:8000/transactions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const generateInsights = () => {
    if (transactions.length === 0) return [];

    let totalExpense = 0;
    let categoryMap: any = {};

    transactions.forEach((t) => {
      if (t.type === "expense") {
        totalExpense += t.amount;

        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }

        categoryMap[t.category] += t.amount;
      }
    });

    let insights: string[] = [];

    // 🟢 Highest category
    let maxCategory = "";
    let maxAmount = 0;

    for (let cat in categoryMap) {
      if (categoryMap[cat] > maxAmount) {
        maxAmount = categoryMap[cat];
        maxCategory = cat;
      }
    }

    if (totalExpense > 0) {
      const percent = ((maxAmount / totalExpense) * 100).toFixed(0);
      insights.push(`🟢 You spent ${percent}% on ${maxCategory}`);
    }

    // 🔴 Overspending warning
    if (maxAmount > 2000) {
      insights.push(`🔴 High spending on ${maxCategory}`);
    }

    // 🟡 Total expense
    insights.push(`🟡 Total expense is ₹${totalExpense}`);

    // 🔵 Suggestion
    if (maxCategory === "Food") {
      insights.push(`🔵 Try reducing eating out`);
    } else if (maxCategory === "Shopping") {
      insights.push(`🔵 Control unnecessary purchases`);
    }

    // 🟠 Budget warning
    Object.entries(budgets).forEach(([cat, limit]) => {
      if ((categoryMap[cat] || 0) > limit) {
        insights.push(`⚠️ You exceeded your ${cat} budget`);
      }
    });

    return insights;
  };
  
  const getCategorySpending = () => {
    let spending: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === "expense") {
        if (!spending[t.category]) {
          spending[t.category] = 0;
        }
        spending[t.category] += t.amount;
      }
    });

    return spending;
  };

  const handleAddTransaction = async () => {
    if (!input) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/ai/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      const data = await res.json();

      // Convert AI string → JSON
      const cleaned = data.result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const newTransaction: Transaction = {
        id: Date.now(),
        text: parsed.text.replace(/\d+/g, "").trim(),
        amount: parsed.amount,
        category: parsed.category,   // ✅ REQUIRED
        type: parsed.type
      };

      const token = localStorage.getItem("token");

      // 🔥 Save to backend
      await fetch("http://127.0.0.1:8000/transactions/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: parsed.text,
          amount: parsed.amount,
          type: parsed.type,
          category: parsed.category
        }),
      });

      // 🔄 Refresh data from backend
      fetchTransactions();

      setInput("");

    } catch (error) {
      console.error("AI error:", error);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");

    await fetch(`http://127.0.0.1:8000/transactions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Refresh data
    fetchTransactions();
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleUpdate = async (id: number) => {
    const token = localStorage.getItem("token");

    try {
      // Step 1: AI parse again
      const aiRes = await fetch("http://127.0.0.1:8000/ai/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: editText }),
      });

      const aiData = await aiRes.json();
      const cleaned = aiData.result.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      // Step 2: Update backend
      await fetch(`http://127.0.0.1:8000/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsed),
      });

      setEditingId(null);
      fetchTransactions();

    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const getChartData = () => {
    const map: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === "expense") {
        if (!map[t.category]) {
          map[t.category] = 0;
        }
        map[t.category] += t.amount;
      }
    });

    return Object.keys(map).map((key) => ({
      name: key,
      value: map[key],
    }));
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="p-6 bg-[#020617] min-h-screen text-white">
      
      <h1 className="text-2xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="bg-gray-800 p-4 rounded-xl mb-6">
        <h2 className="text-lg mb-2">AI Insight 🤖</h2>
        <div className="space-y-2">
          {generateInsights().map((insight, index) => (
            <p key={index} className="text-green-400">
              {insight}
            </p>
          ))}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Category (e.g. Food)"
          className="p-2 rounded bg-gray-700"
          value={budgetCategory}
          onChange={(e) => setBudgetCategory(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          className="p-2 rounded bg-gray-700"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
        />

        <button
          className="bg-green-500 px-3 rounded"
          onClick={() => {
            if (!budgetCategory || !budgetAmount) return;

            setBudgets({
              ...budgets,
              [budgetCategory]: parseInt(budgetAmount),
            });

            setBudgetCategory("");
            setBudgetAmount("");
          }}
        >
          Set
        </button>
      </div>

      <div className="bg-gray-800 p-5 rounded-2xl mb-6">
        <h2 className="text-lg mb-4">Budgets 💰</h2>

        {Object.entries(budgets).map(([category, limit]) => {
          const spending = getCategorySpending()[category] || 0;
          const percent = Math.min((spending / limit) * 100, 100);

          return (
            <div key={category} className="mb-4">
              <div className="flex justify-between mb-1">
                <span>{category}</span>
                <span>₹{spending} / ₹{limit}</span>
              </div>

              <div className="w-full bg-gray-700 rounded h-3">
                <div
                  className={`h-3 rounded ${
                    spending > limit ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-800 p-6 rounded-2xl mb-6">
        <h2 className="text-lg mb-4">Spending Analytics 📊</h2>

        <div className="w-full h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={getChartData()}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {getChartData().map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>  

      <div className="grid grid-cols-3 gap-6">
        
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <p className="text-gray-400">Total Income</p>
          <h2 className="text-2xl font-bold text-green-400">
            ₹{totalIncome}
          </h2>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <p className="text-gray-400">Total Expenses</p>
          <h2 className="text-2xl font-bold text-red-400">
            ₹{totalExpense}
          </h2>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <p className="text-gray-400">Balance</p>
          <h2 className="text-2xl font-bold text-blue-400">
            ₹{balance}
          </h2>
        </div>

      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="e.g. ate pizza 200"
          className="w-full p-3 rounded bg-gray-800 text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="mt-2 bg-green-500 px-4 py-2 rounded"
          onClick={handleAddTransaction}
        >
          Add
        </button>
      </div>

      <div className="mt-8">
            <h2 className="text-xl mb-4">Recent Transactions</h2>

            {transactions.map((t) => (
              <div className="flex justify-between items-center bg-gray-800 p-4 rounded mb-2">
                <div>   
                {editingId === t.id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="bg-gray-700 p-1 rounded"
                  />
                ) : (
                  <p className="font-semibold">{t.text}</p>
                )}
                  <p className="text-sm text-gray-400">{t.category}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={t.type === "expense" ? "text-red-400" : "text-green-400"}>
                    ₹{t.amount}
                  </span>

                  {/* ✏️ Edit button (we'll wire next) */}
                  <button
                    onClick={() => {
                      setEditingId(t.id);
                      setEditText(t.text);
                    }}
                    className="px-3 py-1 text-sm bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>

                  {/* 🗑️ Delete button */}
                  <button
                    onClick={() => confirmDelete(t.id)}
                    className="px-3 py-1 text-sm bg-red-500 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>

                  {editingId === t.id && (
                    <button
                      className="px-3 py-1 text-sm bg-green-500 rounded"
                      onClick={() => handleUpdate(t.id)}
                    >
                      Save
                    </button>
                  )}

                </div>
              </div>
            ))}

      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          
          {/* Modal Box */}
          <div className="bg-[#020617] border border-gray-800 rounded-2xl p-6 w-[350px] shadow-xl">
            
            <h2 className="text-xl font-semibold mb-3">
              Delete Transaction
            </h2>

            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              
              {/* Cancel */}
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>

              {/* Confirm Delete */}
              <button
                onClick={() => {
                  if (deleteId !== null) {
                    handleDelete(deleteId);
                  }
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
    
  );
}