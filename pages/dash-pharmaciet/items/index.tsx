"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

interface Item {
  id: number;
  name: string;
  description: string;
  priceBuy: number;
  priceSell: number;
  stock: number;
  expireDate: string;
  status?: "Valid" | "Expired" | "Low Stock";
  category?: string;
  supplier?: string;
  barcode?: string;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [form, setForm] = useState({
    id: 0,
    name: "",
    description: "",
    priceBuy: "",
    priceSell: "",
    stock: "",
    expireDate: "",
    category: "",
    supplier: "",
    barcode: "",
    barcodeType: "generate" as "generate" | "scan",
  });

  const categories = ["all", "Medicine", "OTC", "Supplements", "Personal Care", "Equipment", "Other"];
  const statusOptions = ["all", "Valid", "Expired", "Low Stock"];

  const getItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/route/items");
      const itemsWithStatus = res.data.map((item: Item) => ({
        ...item,
        status: getItemStatus(item)
      }));
      setItems(itemsWithStatus);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const getItemStatus = (item: Item): "Valid" | "Expired" | "Low Stock" => {
    const today = new Date();
    const expireDate = new Date(item.expireDate);
    if (expireDate < today) return "Expired";
    if (item.stock <= 5) return "Low Stock";
    return "Valid";
  };

  useEffect(() => { getItems(); }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.barcode?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "stock": return a.stock - b.stock;
      case "price": return b.priceSell - a.priceSell;
      case "expiry": return new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime();
      default: return 0;
    }
  });

  const stats = {
    totalItems: items.length,
    lowStock: items.filter(i => i.stock <= 5).length,
    expired: items.filter(i => getItemStatus(i) === "Expired").length,
    totalValue: items.reduce((acc, item) => acc + (item.priceBuy * item.stock), 0),
  };

  const openAdd = () => {
    setEditMode(false);
    setForm({ 
      id: 0,
      name: "", 
      description: "", 
      priceBuy: "", 
      priceSell: "", 
      stock: "", 
      expireDate: "", 
      category: "", 
      supplier: "", 
      barcode: Math.floor(1000000000 + Math.random()*9000000000).toString(),
      barcodeType: "generate" 
    });
    setModalOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditMode(true);
    setForm({
      id: item.id,
      name: item.name,
      description: item.description || "",
      priceBuy: String(item.priceBuy),
      priceSell: String(item.priceSell),
      stock: String(item.stock),
      expireDate: item.expireDate.slice(0, 10),
      category: item.category || "",
      supplier: item.supplier || "",
       barcode: item.barcode || "",
       barcodeType: "scan"
    });
    setModalOpen(true);
  };

  const openDetails = (item: Item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };
const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
const saveItem = async () => {
  try {
    const payload = { 
      ...form, 
      priceBuy: parseFloat(form.priceBuy), 
      priceSell: parseFloat(form.priceSell), 
      stock: parseInt(form.stock) 
    };

    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    if (editMode) await axios.put(`/api/route/items/${form.id}`, payload, config);
    else await axios.post("/api/route/items", payload, config);

    setModalOpen(false); 
    getItems();
  } catch (error) { 
    console.error("Failed to save item:", error); 
  }
};

 const deleteItem = async (id: number) => {
  if (!confirm("Are you sure you want to delete this item?")) return;
  try { 
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    await axios.delete(`/api/route/items/${id}`, config);
    getItems(); 
  }
  catch (error) { 
    console.error("Failed to delete item:", error); 
  }
};


  const exportData = () => {
    const csv = [
      ["Name","Description","Buy Price","Sell Price","Stock","Expiry","Status","Category","Barcode"],
      ...items.map(item => [item.name,item.description,item.priceBuy,item.priceSell,item.stock,item.expireDate,item.status,item.category,item.barcode])
    ].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inventory-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-72 md:w-96 h-72 md:h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 md:w-96 h-72 md:h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
              <InventoryIcon className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Inventory Management</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Manage pharmacy stock and items</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <DownloadIcon className="w-5 h-5" /><span className="hidden md:inline">Export</span>
            </button>
            <button onClick={getItems} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition shadow-sm">
              <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /><span className="hidden md:inline">Refresh</span>
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105">
              <AddIcon /><span className="font-semibold">Add Item</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Items" value={stats.totalItems} icon={<InventoryIcon />} color="blue" />
          <StatCard label="Low Stock" value={stats.lowStock} icon={<WarningIcon />} color="red" />
          <StatCard label="Expired Items" value={stats.expired} icon={<CalendarTodayIcon />} color="amber" />
          <StatCard label="Inventory Value" value={`$${stats.totalValue.toLocaleString()}`} icon={<AttachMoneyIcon />} color="emerald" />
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 md:p-6 flex flex-col lg:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[180px] relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt === "all" ? "All Status" : opt}</option>)}
          </select>

          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
            {categories.map(cat => <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>)}
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
            <option value="name">Sort by: Name</option>
            <option value="stock">Sort by: Stock</option>
            <option value="price">Sort by: Price</option>
            <option value="expiry">Sort by: Expiry Date</option>
          </select>

          <div className="flex gap-2 mt-2 lg:mt-0">
            <button onClick={() => setViewMode("grid")} className={`px-3 py-1 rounded-lg ${viewMode==="grid"?"bg-blue-500 text-white":"bg-gray-100 text-gray-600"}`}>Grid</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-1 rounded-lg ${viewMode==="list"?"bg-blue-500 text-white":"bg-gray-100 text-gray-600"}`}>List</button>
          </div>
        </div>

        {/* Items */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-transform hover:-translate-y-1">
                <ItemCard item={item} openEdit={openEdit} openDetails={openDetails} deleteItem={deleteItem}/>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left">Item</th>
                  <th className="py-2 px-3 text-left">Category</th>
                  <th className="py-2 px-3 text-left">Stock</th>
                  <th className="py-2 px-3 text-left">Buy</th>
                  <th className="py-2 px-3 text-left">Sell</th>
                  <th className="py-2 px-3 text-left">Expiry</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3">{item.name}</td>
                    <td className="py-2 px-3">{item.category || "Uncategorized"}</td>
                    <td className="py-2 px-3">{item.stock}</td>
                    <td className="py-2 px-3">{item.priceBuy}</td>
                    <td className="py-2 px-3">{item.priceSell}</td>
                    <td className="py-2 px-3">{new Date(item.expireDate).toLocaleDateString()}</td>
                    <td className="py-2 px-3">{item.status}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <button onClick={()=>openDetails(item)} className="text-gray-600 hover:text-blue-600"><VisibilityIcon fontSize="small"/></button>
                      <button onClick={()=>openEdit(item)} className="text-gray-600 hover:text-blue-600"><EditIcon fontSize="small"/></button>
                      <button onClick={()=>deleteItem(item.id)} className="text-gray-600 hover:text-red-600"><DeleteIcon fontSize="small"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
{detailModalOpen && selectedItem && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
      <button 
        onClick={() => setDetailModalOpen(false)} 
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
      >
        <CloseIcon />
      </button>
      <h2 className="text-xl font-bold mb-4">Item Details</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {selectedItem.name}</p>
        <p><strong>Description:</strong> {selectedItem.description || "N/A"}</p>
        <p><strong>Buy Price:</strong> ${selectedItem.priceBuy}</p>
        <p><strong>Sell Price:</strong> ${selectedItem.priceSell}</p>
        <p><strong>Stock:</strong> {selectedItem.stock}</p>
        <p><strong>Expiry:</strong> {new Date(selectedItem.expireDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {selectedItem.status}</p>
        <p><strong>Category:</strong> {selectedItem.category || "Uncategorized"}</p>
        <p><strong>Supplier:</strong> {selectedItem.supplier || "N/A"}</p>
        <p><strong>Barcode:</strong> {selectedItem.barcode || "N/A"}</p>
      </div>
    </div>
  </div>
)}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
              <button onClick={()=>setModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon /></button>
              <h2 className="text-xl font-bold mb-4">{editMode ? "Edit Item" : "Add Item"}</h2>
              <div className="flex flex-col gap-3">
                <input type="text" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="border p-2 rounded"/>
                <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="border p-2 rounded"/>
                <input type="number" placeholder="Buy Price" value={form.priceBuy} onChange={e=>setForm({...form,priceBuy:e.target.value})} className="border p-2 rounded"/>
                <input type="number" placeholder="Sell Price" value={form.priceSell} onChange={e=>setForm({...form,priceSell:e.target.value})} className="border p-2 rounded"/>
                <input type="number" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} className="border p-2 rounded"/>
                <input type="date" placeholder="Expiry Date" value={form.expireDate} onChange={e=>setForm({...form,expireDate:e.target.value})} className="border p-2 rounded"/>
                <input type="text" placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="border p-2 rounded"/>
                <input type="text" placeholder="Supplier" value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} className="border p-2 rounded"/>
                
                {/* Barcode */}
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-4">
                   <label>
  <input
    type="radio"
    checked={form.barcodeType === "generate"}
    onChange={()=>setForm({...form, barcodeType:"generate", barcode:Math.floor(1000000000+Math.random()*9000000000).toString()})}
  />
  Generate Numeric Barcode
</label>

<label>
  <input
    type="radio"
    checked={form.barcodeType === "scan"}
    onChange={()=>setForm({...form, barcodeType:"scan", barcode:""})}
  />
  Scan Barcode
</label>

                  </div>
                  <input
  type="text"
  placeholder={form.barcodeType==="scan"?"Scan barcode here...":"Auto-generated"}
  value={form.barcode}
  onChange={e=>setForm({...form,barcode:e.target.value})}
  autoFocus={form.barcodeType==="scan"}
  disabled={form.barcodeType==="generate"}
/>

                </div>

                <button onClick={saveItem} className="bg-blue-500 text-white p-2 rounded mt-2 flex items-center justify-center gap-2"><SaveIcon /> Save</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


// StatCard and ItemCard same as before
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string; }) {
  const bgMap: any = {
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600"
  };
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow border border-white/20 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${bgMap[color]}`}>{icon}</div>
    </div>
  );
}

function ItemCard({item,openEdit,openDetails,deleteItem}:{item:Item,openEdit:(i:Item)=>void,openDetails:(i:Item)=>void,deleteItem:(id:number)=>void}) {
  return (
    <>
      <div className={`p-4 ${item.status==="Expired"?"bg-red-500":item.status==="Low Stock"?"bg-amber-500":"bg-emerald-500"} text-white`}>
        <div className="flex justify-between items-start">
          <div className="font-semibold truncate">{item.name}</div>
          <span className="text-xs px-2 py-1 rounded-full bg-white/20">{item.status}</span>
        </div>
        <p className="text-sm mt-1 truncate">{item.description}</p>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex justify-between text-sm"><span>Stock</span><span className={item.stock<=5?"text-red-600":"text-gray-800"}>{item.stock}</span></div>
        <div className="flex justify-between text-sm"><span>Buy</span><span>${item.priceBuy}</span></div>
        <div className="flex justify-between text-sm"><span>Sell</span><span>${item.priceSell}</span></div>
        <div className="flex justify-between text-sm"><span>Expires</span><span>{new Date(item.expireDate).toLocaleDateString()}</span></div>
        <div className="flex gap-2">
          <button onClick={()=>openDetails(item)} className="flex-1 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">View</button>
          <button onClick={()=>openEdit(item)} className="flex-1 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">Edit</button>
          <button onClick={()=>deleteItem(item.id)} className="flex-1 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm">Delete</button>
        </div>
      </div>
    </>
  );
}
