import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";import { Login, Signup } from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ChatbotWidget from "./components/ChatbotWidget";

import { useState } from "react";
import type { Transaction } from "./types/Transaction";

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  return (
    <Router>
      <Routes>

        {/* ✅ PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 🔐 PROTECTED LAYOUT */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="flex bg-[#020617] text-white min-h-screen">
                <Sidebar />

                <div className="flex-1">
                  <Navbar />
                  <Outlet />
                </div>

                <ChatbotWidget transactions={transactions} />
              </div>
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Dashboard
                transactions={transactions}
                setTransactions={setTransactions}
              />
            }
          />

          <Route
            path="history"
            element={
              <History
                transactions={transactions}
                setTransactions={setTransactions}
              />
            }
          />

          <Route
            path="analytics"
            element={<Analytics transactions={transactions} />}
          />

          {/* ✅ FIXED */}
          <Route path="budgets" element={
            <Budgets transactions={transactions} />
          } /> 
        </Route>

            
      </Routes>
    </Router>
  );
}

export default App;