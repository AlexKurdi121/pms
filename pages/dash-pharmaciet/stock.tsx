import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pencil, Trash2, X } from "lucide-react";

interface Item {
  id: number;
  name: string;
  stock: number;
}

export default function StockPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchItems();
  }, []);

  // ---------------- FETCH ITEMS ----------------
  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/route/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error("Error loading stock:", err);
    }
  };

  const getColor = (stock: number) => {
    if (stock === 0) return "text-red-600 font-bold";
    if (stock < 10) return "text-orange-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  // ---------------- OPEN EDIT MODAL ----------------
  const openEditModal = (item: Item) => {
    setEditItem(item);
    setIsEditOpen(true);
  };

  // ---------------- UPDATE ITEM ----------------
  const updateItem = async () => {
    if (!editItem) return;
    try {
      await axios.put(
        `/api/route/items/${editItem.id}`,
        { name: editItem.name, stock: editItem.stock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditOpen(false);
      fetchItems();
    } catch (err: any) {
      console.error("Update error:", err);
      alert(err.response?.data?.error || "Failed to update item");
    }
  };

  // ---------------- DELETE ITEM ----------------
  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`/api/route/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems(); // refresh
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.response?.data?.error || "Failed to delete item");
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
        📦 Stock Overview
      </h1>

      {/* Low Stock Warning */}
      {items.filter((i) => i.stock < 10).length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-2xl p-5 shadow">
          <h2 className="text-xl font-semibold text-orange-700 mb-2 flex items-center gap-2">
            ⚠ Low Stock Items
          </h2>
          <ul className="ml-4 space-y-1">
            {items
              .filter((i) => i.stock < 10)
              .map((i) => (
                <li key={i.id} className={getColor(i.stock)}>
                  {i.name} — {i.stock}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Stock Table */}
      <div className="rounded-2xl shadow-xl bg-white p-6 border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm tracking-wide">
              <th className="p-3">ID</th>
              <th className="p-3">Item Name</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 font-medium text-gray-700">{item.id}</td>
                <td className="p-3 font-medium text-gray-800">{item.name}</td>
                <td className={`p-3 text-lg ${getColor(item.stock)}`}>{item.stock}</td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      className="flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-xl hover:bg-blue-200 transition shadow-sm"
                      onClick={() => openEditModal(item)}
                    >
                      <Pencil size={16} />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                      className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-200 transition shadow-sm"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 size={16} />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Edit Item</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            <label className="block mb-3">
              <span className="text-gray-700 font-medium">Item Name</span>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                value={editItem.name}
                onChange={(e) =>
                  setEditItem({ ...editItem, name: e.target.value })
                }
              />
            </label>

            <label className="block mb-3">
              <span className="text-gray-700 font-medium">Stock</span>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
                value={editItem.stock}
                onChange={(e) =>
                  setEditItem({ ...editItem, stock: Number(e.target.value) })
                }
              />
            </label>

            <button
              onClick={updateItem}
              className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition mt-3"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
