"use client";
import Head from "next/head";

import PharmacistSidebar from "./components/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { RefreshCw, Plus, Printer } from "lucide-react";

interface Item {
  id: number;
  name: string;
  stock: number;
  expireDate: string; // ISO string
}

export default function PharmacistDashboard() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch items from backend
  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await axios.get("/api/route/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Compute stats
  const totalItems = items.length;
  const expiredMedicines = items.filter((i) => new Date(i.expireDate) < new Date()).length;
  const lowStockAlerts = items.filter((i) => i.stock < 10).length;

  // Maximum value among stats for proportional progress bars
  const maxValue = Math.max(totalItems, expiredMedicines, lowStockAlerts, 1); // at least 1

  // Helper to calculate proportional progress percentage
  const progress = (count: number) => {
    return Math.min(Math.round((count / maxValue) * 100), 100);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative overflow-hidden">
       <Head>
        <title>Home Page</title>
      </Head>
      {/* Animated gradient blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 opacity-30 rounded-full animate-blob blur-3xl mix-blend-multiply"></div>
      <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 opacity-30 rounded-full animate-blob animation-delay-2000 blur-3xl mix-blend-multiply"></div>

      {/* Main content */}
      <div className="flex-1 p-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Pharmacist Dashboard
          </h1>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={fetchItems}
              className="p-2 rounded-lg bg-cyan-400 hover:bg-cyan-500 text-white shadow-lg transition-transform hover:scale-110"
            >
              <RefreshCw size={20} />
            </button>

            <button
              onClick={() => router.push("/dash-pharmaciet/items")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white shadow-lg font-semibold transition"
            >
              <Plus size={18} /> Add Item
            </button>

            <button
              onClick={() => router.push("/dash-pharmaciet/billing")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-lg font-semibold transition"
            >
              <Printer size={18} /> Print Billing
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Items */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Items</h2>
            <p className="text-3xl font-bold text-cyan-500">{totalItems}</p>
            <div className="h-2 w-full bg-gray-200 rounded-full mt-4">
              <div
                className="h-2 bg-cyan-500 rounded-full transition-all"
                style={{ width: `${progress(totalItems)}%` }}
              />
            </div>
          </div>

          {/* Expired Medicines */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Expired Medicines</h2>
            <p className="text-3xl font-bold text-red-500">{expiredMedicines}</p>
            <div className="h-2 w-full bg-gray-200 rounded-full mt-4">
              <div
                className="h-2 bg-red-500 rounded-full transition-all"
                style={{ width: `${progress(expiredMedicines)}%` }}
              />
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white/50 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Low Stock Alerts</h2>
            <p className="text-3xl font-bold text-orange-400">{lowStockAlerts}</p>
            <div className="h-2 w-full bg-gray-200 rounded-full mt-4">
              <div
                className="h-2 bg-orange-400 rounded-full transition-all"
                style={{ width: `${progress(lowStockAlerts)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Recent Activities
          </h2>
          <p className="text-gray-500">
            Recent sales, additions, or stock updates will appear here.
          </p>
        </div>
      </div>

      {/* Blob Animation */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
