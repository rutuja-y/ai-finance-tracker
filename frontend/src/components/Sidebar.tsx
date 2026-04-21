import { Home, BarChart2, Clock, Wallet, FileText } from "lucide-react";
import { Link } from "react-router-dom";
export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-6">
      
      <h1 className="text-2xl font-bold text-green-400 mb-10">
        FinanceAI
      </h1>

      <ul className="space-y-6">
        <li>
          <Link to="/" className="flex items-center gap-3 hover:text-green-400">
            <Home size={18}/> Dashboard
          </Link>
        </li>

        <li>
          <Link to="/analytics" className="flex items-center gap-3 hover:text-green-400">
            <BarChart2 size={18}/> Analytics
          </Link>
        </li>

        <li className="flex items-center gap-3 hover:text-green-400 cursor-pointer">
          <Clock size={18}/> 
          <Link to="/history">History</Link>
        </li>

        <li className="flex items-center gap-3 hover:text-green-400 cursor-pointer">
          <Wallet size={18}/>
          <Link to="/budgets">Budgets</Link>
        </li>

        <li className="flex items-center gap-3 hover:text-green-400 cursor-pointer">
          <FileText size={18}/> Reports
        </li>
      </ul>
    </div>
  );
}