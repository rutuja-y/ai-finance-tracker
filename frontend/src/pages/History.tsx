import { useState } from "react";
import { useEffect } from "react";
import type { Transaction } from "../types/Transaction";
import { FaUtensils, FaCar, FaShoppingBag, FaFilm, FaFileInvoice, FaMoneyBill } from "react-icons/fa";



export default function History({
  transactions,
  setTransactions,
}: {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editTx, setEditTx] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const categories = [
    "All",
    "Food",
    "Transport",
    "Income",
    "Entertainment",
    "Bills",
    "Shopping",
  ];

  const filtered = transactions
    .filter((t) => {
      const matchesSearch = t.text
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || t.category === filter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const fetchTransactions = async () => {
    const token = localStorage.getItem("token"); // ✅ ADD THIS

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("API ERROR:", res.status);
        return;
      }

      const data = await res.json();
      setTransactions(data);

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="p-6 bg-[#020617] min-h-screen text-white">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-gray-400 text-sm">
          All your income and expenses
        </p>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-3 mb-6">

        {/* Search */}
        <input
          type="text"
          placeholder="Search transactions..."
          className="flex-1 min-w-[250px] p-3 rounded-xl bg-gray-800 border border-gray-700 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === cat
                  ? "bg-emerald-500 text-black"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">

        {/* Table Header */}
        <div className="grid grid-cols-5 p-4 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-800">
          <span>Description</span>
          <span>Category</span>
          <span>Date</span>
          <span>Amount</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <p className="p-6 text-gray-400">No transactions found</p>
        ) : (
          filtered.map((t) => {
            const categoryColors: any = {
              Food: "bg-yellow-500/20 text-yellow-400",
              Transport: "bg-blue-500/20 text-blue-400",
              Income: "bg-green-500/20 text-green-400",
              Shopping: "bg-pink-500/20 text-pink-400",
              Bills: "bg-red-500/20 text-red-400",
              Entertainment: "bg-purple-500/20 text-purple-400",
            };

            const categoryIcons: any = {
              Food: <FaUtensils />,
              Transport: <FaCar />,
              Shopping: <FaShoppingBag />,
              Entertainment: <FaFilm />,
              Bills: <FaFileInvoice />,
              Income: <FaMoneyBill />,
            };

            return (
              <div
                key={t.id}
                className="grid grid-cols-5 p-4 items-center border-b border-gray-800 hover:bg-gray-800/40 transition"
              >
                {/* 🔹 Description + icon */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-lg">
                    {categoryIcons[t.category] || "💸"}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {t.text.replace(/\d+/g, "")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t.type === "expense" ? "Expense" : "Income"}
                    </p>
                  </div>
                </div>

                {/* 🔹 Category badge */}
                <span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      categoryColors[t.category] || "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {t.category}
                  </span>
                </span>

                {/* 🔹 Date */}
                <span className="text-gray-400 text-sm">
                  {new Date(t.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                {/* 🔹 Amount */}
                <span
                  className={`font-semibold ${
                    t.type === "expense"
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {t.type === "expense" ? "-" : "+"}₹{t.amount}
                </span>

                {/* 🔹 Actions */}
                <div className="flex gap-2">
                  <button onClick={() => setEditTx(t)} className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                    Edit
                  </button>

                  <button onClick={() => setDeleteId(t.id)} className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}

      </div>

      {editTx && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#020617] p-6 rounded-2xl w-96 border border-gray-800">
            
            <h2 className="text-xl mb-4">Edit Transaction</h2>

            <input
              className="w-full mb-3 p-3 bg-gray-800 rounded"
              value={editTx.text}
              onChange={(e) => setEditTx({ ...editTx, text: e.target.value })}
            />

            <input
              type="number"
              className="w-full mb-3 p-3 bg-gray-800 rounded"
              value={editTx.amount}
              onChange={(e) => setEditTx({ ...editTx, amount: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditTx(null)}>Cancel</button>

              <button
                className="bg-emerald-500 px-4 py-2 rounded"
                onClick={async () => {
                  const token = localStorage.getItem("token");

                  await fetch(`http://127.0.0.1:8000/transactions/${editTx.id}`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(editTx),
                  });

                  setEditTx(null);
                  fetchTransactions();
                }}
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
            <h2 className="text-lg mb-4">Delete transaction?</h2>

            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)}>Cancel</button>

              <button
                className="bg-red-500 px-4 py-2 rounded"
                onClick={async () => {
                  const token = localStorage.getItem("token");

                  await fetch(`http://127.0.0.1:8000/transactions/${deleteId}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });

                  setDeleteId(null);
                  fetchTransactions();
                }}
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