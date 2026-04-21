import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const getCategoryColor = (category: string) => {
  const colors = [
    "bg-yellow-500/20 text-yellow-400",
    "bg-blue-500/20 text-blue-400",
    "bg-green-500/20 text-green-400",
    "bg-pink-500/20 text-pink-400",
    "bg-red-500/20 text-red-400",
    "bg-purple-500/20 text-purple-400",
    "bg-indigo-500/20 text-indigo-400",
    "bg-orange-500/20 text-orange-400",
  ];

  // simple hash from string
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;

  return colors[index];
};

export default function Budgets({ transactions }: { transactions: any[] }) {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",          
  ];


  const fetchBudgets = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/budgets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("STATUS:", res.status);   // 👈 IMPORTANT

      const data = await res.json();
      console.log("BUDGET DATA:", data);    // 👈 IMPORTANT

      setBudgets(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const addBudget = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login required");
      return;
    }

    const finalCategory =
      category === "Other" ? customCategory : category;

    try {
      const res = await fetch("http://127.0.0.1:8000/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: finalCategory,
          limit: Number(limit),
        }),
      });

      if (!res.ok) {
        console.error("Failed:", res.status);
        return;
      }

      setShowModal(false);
      setCategory("");
      setCustomCategory("");
      setLimit("");

      fetchBudgets();

    } catch (err) {
      console.error("Error:", err);
    }
  };

  const getCategorySpent = (category: string) => {
    return transactions
      .filter((t) => t.type === "expense" && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const deleteBudget = async () => {
    const token = localStorage.getItem("token");

    await fetch(`http://127.0.0.1:8000/budgets/${deleteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDeleteId(null);
    fetchBudgets(); // refresh UI
  };

  return (
    <div className="p-6 text-white bg-[#020617] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-gray-400 text-sm">
            Set limits and track your spending
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 px-4 py-2 rounded-xl"
        >
          + Add Budget
        </button>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {budgets.map((b) => {
          const colorClass = getCategoryColor(b.category);
          const spent = getCategorySpent(b.category);
          const percent = Math.min((spent / b.limit) * 100, 100);
          const remaining = b.limit - spent;

          return (
            <motion.div
              key={b.id}
              whileHover={{ scale: 1.02 }}
              className="p-5 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-800"
            >
              <div className="flex justify-between mb-2">
                <h2 className={`font-semibold px-3 py-1 rounded-full w-fit ${colorClass}`}>
                  {b.category}
                </h2>
                <span className="text-sm text-gray-400">
                  {percent.toFixed(0)}%
                </span>
              </div>

              {/* Progress */}
              <div className="w-full bg-gray-700 h-2 rounded-full mb-3">
                <div
                  className={`h-2 rounded-full ${
                    percent > 90
                      ? "bg-red-500"
                      : percent > 70
                      ? "bg-yellow-400"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Info */}
              <div className="flex justify-between text-sm text-gray-400">
                <span>Spent: ₹{spent}</span>
                <span>Limit: ₹{b.limit}</span>
              </div>

              <p className="text-green-400 text-sm mt-1">
                ₹{remaining} remaining
              </p>

              <button 
                onClick={() => setDeleteId(b.id)}
                className="text-xs text-red-400 mt-3 hover:text-red-500 transition"
              >
                Delete
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center">

          <div className="bg-[#020617] p-6 rounded-2xl w-96 border border-gray-800">

            <h2 className="text-lg mb-4">Add Budget</h2>

            <select
              className="w-full mb-3 p-3 bg-gray-800 rounded"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Enter limit"
              className="w-full mb-4 p-3 bg-gray-800 rounded"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />

            {category === "Other" && (
              <input
                type="text"
                placeholder="Enter custom category"
                className="w-full mb-3 p-3 bg-gray-800 rounded"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>Cancel</button>

              <button
                onClick={addBudget}
                disabled={
                  !limit ||
                  !category ||
                  (category === "Other" && customCategory.trim() === "")
                }
                className="bg-emerald-500 px-4 py-2 rounded disabled:opacity-50 hover:scale-105 transition"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">
          
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 w-80">

            <h2 className="text-lg mb-4">Delete this budget?</h2>

            <p className="text-gray-400 text-sm mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)}>
                Cancel
              </button>

              <button
                onClick={deleteBudget}
                className="bg-red-500 px-4 py-2 rounded"
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