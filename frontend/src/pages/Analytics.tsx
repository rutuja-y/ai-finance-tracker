import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  LineChart, Line,
  ResponsiveContainer
} from "recharts";

import { motion } from "framer-motion";
import type { Transaction } from "../types/Transaction";

export default function Analytics({ transactions }: { transactions: Transaction[] }) {

  // =========================
  // 🔥 TOTALS
  // =========================
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  const balance = totalIncome - totalExpense;

  // =========================
  // 🔥 CATEGORY DATA
  // =========================
  const categoryMap: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.type === "expense") {
      if (!categoryMap[t.category]) categoryMap[t.category] = 0;
      categoryMap[t.category] += t.amount;
    }
  });

  const totalCategory = Object.values(categoryMap).reduce((a, b) => a + b, 0);

  const categoryData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key],
    percent: totalCategory
      ? ((categoryMap[key] / totalCategory) * 100).toFixed(0)
      : "0"
  }));

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444"];

  // =========================
  // 🔥 MONTHLY DATA (ALL MONTHS)
  // =========================
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const monthlyMap: any = {};

  months.forEach(m => {
    monthlyMap[m] = { name: m, income: 0, expense: 0 };
  });

  transactions.forEach(t => {
    const date = new Date(t.created_at);
    const month = date.toLocaleString("default", { month: "short" });

    if (monthlyMap[month]) {
      if (t.type === "income") monthlyMap[month].income += t.amount;
      else monthlyMap[month].expense += t.amount;
    }
  });

  const monthlyData = months.map(m => monthlyMap[m]);

  // =========================
  // 🔥 WEEKLY DATA (REAL)
  // =========================
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const weeklyMap: any = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0,
    Fri: 0, Sat: 0, Sun: 0
  };

  transactions.forEach(t => {
    if (t.type === "expense") {
      const date = new Date(t.created_at);
      const dayIndex = date.getDay();

      const dayMap = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const dayName = dayMap[dayIndex];

      if (weeklyMap[dayName] !== undefined) {
        weeklyMap[dayName] += t.amount;
      }
    }
  });

  const weeklyData = days.map(d => ({
    name: d,
    value: weeklyMap[d]
  }));

  // =========================
  // 🔥 SAVINGS TREND
  // =========================
  const savingsData = monthlyData.map((m: any) => ({
    name: m.name,
    value: m.income - m.expense
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];

      return (
        <div className="bg-gray-900 border border-gray-700 p-2 rounded text-sm">
          <p className="font-semibold">{data.name}</p>
          <p>₹{data.value}</p>
          <p className="text-emerald-400">{data.payload.percent}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ percent }: any) => {
    return percent > 0.1 ? `${(percent * 100).toFixed(0)}%` : "";
  };

  return (
    <div className="p-6 bg-[#020617] min-h-screen text-white">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ================= PIE ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-2xl border border-gray-800"
        >
          <h2 className="mb-4">Spending by Category</h2>

          <div className="relative flex justify-center items-center">

          <ResponsiveContainer width={260} height={260}>
            <PieChart>
              <Pie
                data={categoryData.length ? categoryData : [{ name: "Empty", value: 1 }]}
                dataKey="value"
                innerRadius={75}
                outerRadius={100}
                labelLine={false}
                label={categoryData.length ? renderLabel : false}
              >
                {(categoryData.length ? categoryData : [{ value: 1 }]).map((_, i) => (
                  <Cell
                    key={i}
                    fill={categoryData.length ? COLORS[i % COLORS.length] : "#1f2937"}
                  />
                ))}
              </Pie>

              {/* 🔥 TOOLTIP */}
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

            {/* CENTER */}
            <div className="absolute flex flex-col items-center justify-center">
              <p className="text-gray-400 text-xs">Balance</p>
              <h2 className="text-xl font-bold">₹{balance}</h2>
            </div>
          </div>

          {/* LEGEND */}
          <div className="mt-4 space-y-2">
            {categoryData.length === 0 ? (
              <p className="text-gray-500 text-sm">No data</p>
            ) : (
              categoryData.map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{c.name}</span>
                  <span>{c.percent}%</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* ================= MONTHLY ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-2xl border border-gray-800"
        >
          <h2 className="mb-4">Monthly Trend</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="income" fill="#10B981" />
              <Bar dataKey="expense" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ================= WEEKLY ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-2xl border border-gray-800"
        >
          <h2 className="mb-4">Weekly Spending</h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ================= SAVINGS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-2xl border border-gray-800"
        >
          <h2 className="mb-4">Savings Trend</h2>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={savingsData}>
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
}