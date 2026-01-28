import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ShieldIcon from "@mui/icons-material/Shield";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import MedicationIcon from "@mui/icons-material/Medication";
import CategoryIcon from "@mui/icons-material/Category";
import StorageIcon from "@mui/icons-material/Storage";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface EditUser extends User {
  password?: string;
  showPass: boolean;
}

interface Item {
  id: number;
  name: string;
  description?: string;
  priceBuy: number;
  priceSell: number;
  stock: number;
  expireDate: string;
  category?: string;
  barcode?: string;
  status?: string;
}

interface EditItem {
  id: number;
  name: string;
  description: string;
  priceBuy: string;
  priceSell: string;
  stock: string;
  expireDate: string;
  category: string;
  barcode: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "admin" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("all");
  const [itemStatusFilter, setItemStatusFilter] = useState("all");
  const [itemSortBy, setItemSortBy] = useState("name");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    pharmacists: 0,
    totalItems: 0,
    lowStock: 0,
    expired: 0,
    totalValue: 0,
  });

  const [editUser, setEditUser] = useState<EditUser>({
    id: 0,
    name: "",
    email: "",
    role: "admin",
    password: "",
    showPass: false,
  });

  const [editItem, setEditItem] = useState<EditItem>({
    id: 0,
    name: "",
    description: "",
    priceBuy: "",
    priceSell: "",
    stock: "",
    expireDate: "",
    category: "",
    barcode: "",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Available categories
  const categories = ["all", "Medicine", "OTC", "Supplements", "Personal Care", "Equipment", "Other"];
 useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUsers();
    fetchItems();
  }, [token, router]);

  useEffect(() => {
    calculateStats();
  }, [users, items]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/route/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.filter((u: User) => u.role !== "superadmin"));
    } catch (err: any) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/route/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const itemsWithStatus = (res.data || []).map((item: Item) => ({
        ...item,
        status: getItemStatus(item)
      }));
      setItems(itemsWithStatus);
    } catch (err: any) {
      console.error("Error fetching items:", err);
    }
  };

  const calculateStats = () => {
    const today = new Date();
    const filteredItems = items || [];
    
    const lowStockCount = filteredItems.filter(item => item.stock <= 5).length;
    const expiredCount = filteredItems.filter(item => {
      const expireDate = new Date(item.expireDate);
      return expireDate < today;
    }).length;
    
    setStats({
      totalUsers: users.length,
      admins: users.filter(u => u.role === "admin").length,
      pharmacists: users.filter(u => u.role === "pharmaciet").length,
      totalItems: filteredItems.length,
      lowStock: lowStockCount,
      expired: expiredCount,
      totalValue: filteredItems.reduce((sum, item) => sum + (item.stock * item.priceBuy), 0),
    });
  };

  const getItemStatus = (item: Item): string => {
    const today = new Date();
    const expireDate = new Date(item.expireDate);
    
    if (expireDate < today) return "Expired";
    if (item.stock <= 5) return "Low Stock";
    return "Valid";
  };

  const getItemStatusColor = (status: string): string => {
    switch (status) {
      case "Valid": return "bg-emerald-500/20 text-emerald-300";
      case "Low Stock": return "bg-amber-500/20 text-amber-300";
      case "Expired": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case "Valid": return <MedicationIcon className="w-4 h-4" />;
      case "Low Stock": return <WarningIcon className="w-4 h-4" />;
      case "Expired": return <CalendarTodayIcon className="w-4 h-4" />;
      default: return <InventoryIcon className="w-4 h-4" />;
    }
  };

  // Filter and sort items
  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(itemSearch.toLowerCase()) || 
                         item.description?.toLowerCase().includes(itemSearch.toLowerCase()) ||
                         item.barcode?.includes(itemSearch);
    
    const matchesCategory = itemCategoryFilter === "all" || item.category === itemCategoryFilter;
    const matchesStatus = itemStatusFilter === "all" || item.status === itemStatusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    switch (itemSortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "stock": return a.stock - b.stock;
      case "expiry": return new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime();
      case "category": return (a.category || "").localeCompare(b.category || "");
      default: return 0;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
     localStorage.removeItem("role");
    router.push("/login");
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "showUsers") fetchUsers();
    if (tabId === "items") fetchItems();
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post("/api/route/create-user", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      setNewUser({ name: "", email: "", password: "", role: "admin" });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add user");
    }
  };

  const openEditUserModal = (user: User) => {
    setEditUser({ ...user, password: "", showPass: false });
    setIsUserModalOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`/api/route/update-user/${editUser.id}`, editUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await axios.delete(`/api/route/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const openEditItemModal = (item: Item) => {
    setEditItem({
      id: item.id,
      name: item.name,
      description: item.description || "",
      priceBuy: item.priceBuy.toString(),
      priceSell: item.priceSell.toString(),
      stock: item.stock.toString(),
      expireDate: item.expireDate.slice(0, 10),
      category: item.category || "",
      barcode: item.barcode || "",
    });
    setIsEditItemModalOpen(true);
  };

  const handleUpdateItem = async () => {
    try {
      const payload = {
        ...editItem,
        priceBuy: parseFloat(editItem.priceBuy),
        priceSell: parseFloat(editItem.priceSell),
        stock: parseInt(editItem.stock),
      };

      await axios.put(`/api/route/items/${editItem.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditItemModalOpen(false);
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update item");
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

    try {
      await axios.delete(`/api/route/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete item");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...editItem,
        priceBuy: parseFloat(editItem.priceBuy),
        priceSell: parseFloat(editItem.priceSell),
        stock: parseInt(editItem.stock),
        status: "Valid"
      };

      await axios.post("/api/route/items", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsItemModalOpen(false);
      setEditItem({
        id: 0,
        name: "",
        description: "",
        priceBuy: "",
        priceSell: "",
        stock: "",
        expireDate: "",
        category: "",
        barcode: "",
      });
      fetchItems();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add item");
    }
  };

  const openAddItemModal = () => {
    setEditItem({
      id: 0,
      name: "",
      description: "",
      priceBuy: "",
      priceSell: "",
      stock: "",
      expireDate: "",
      category: "",
      barcode: Math.random().toString(36).substring(2, 10).toUpperCase(),
    });
    setIsItemModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-200">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg z-50"
        >
          <MenuIcon className="text-white" />
        </button>
      )}

      {/* SIDEBAR - Responsive */}
      <aside className={`
        ${isMobile ? 'fixed inset-0 z-40 transform transition-transform duration-300' : 'relative'}
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        w-72 md:w-64 lg:w-72 bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 flex flex-col shadow-2xl h-screen overflow-y-auto
      `}>
        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
          >
            <CloseIcon />
          </button>
        )}

      {/* FIXED SIDEBAR - Stays in place during scroll */}
      <div className="p-4 md:p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <ShieldIcon className="text-white text-xl md:text-2xl" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PharmaAdmin
              </h1>
              <p className="text-xs text-gray-400 mt-1">Super Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation - Fixed height with scroll if needed */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
              { id: "addUser", label: "Add User", icon: <PersonAddIcon /> },
              { id: "showUsers", label: "Manage Users", icon: <PeopleIcon /> },
              { id: "items", label: "Items Management", icon: <InventoryIcon /> },
            ].map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === "showUsers") fetchUsers();
                    if (tab.id === "items") fetchItems();
                  }}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300
                    ${activeTab === tab.id 
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 shadow-lg" 
                      : "hover:bg-gray-800/50 text-gray-400 hover:text-gray-200"
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-all duration-300
                    ${activeTab === tab.id 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                      : "bg-gray-800 text-gray-400"
                    }
                  `}>
                    {tab.icon}
                  </div>
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button - Stays at bottom */}
        <div className="p-4 mt-auto border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-500/20 to-red-600/10 hover:from-red-600/30 hover:to-red-700/20 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 group"
          >
            <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-500/30">
              <LogoutIcon className="text-red-300 group-hover:text-red-200" />
            </div>
            <span className="font-medium text-red-200 group-hover:text-white">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT with left margin for fixed sidebar */}
      <main className={`
        flex-1 p-3 md:p-4 lg:p-6 relative z-10
        
        transition-all duration-300
      `}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {activeTab === "dashboard" && "Super Admin Dashboard"}
                {activeTab === "addUser" && "Add New User"}
                {activeTab === "showUsers" && "User Management"}
                {activeTab === "items" && "Items Management"}
              </h1>
              <p className="text-gray-400 mt-1">
                {activeTab === "dashboard" && "Monitor system statistics and performance"}
                {activeTab === "addUser" && "Create new admin or pharmacist accounts"}
                {activeTab === "showUsers" && "Manage user accounts and permissions"}
                {activeTab === "items" && "Manage pharmacy inventory and stock"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {(activeTab === "items" || activeTab === "showUsers") && (
                <button
                  onClick={() => {
                    if (activeTab === "items") fetchItems();
                    if (activeTab === "showUsers") fetchUsers();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
                >
                  <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              )}
              {activeTab === "items" && (
                <button
                  onClick={openAddItemModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <InventoryIcon className="w-5 h-5" />
                  <span>Add New Item</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- DASHBOARD ---------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                    <PeopleIcon className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm">
                    <TrendingUpIcon className="w-4 h-4" />
                    +12%
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Users</h3>
                <p className="text-4xl font-bold text-white mb-2">{stats.totalUsers}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{stats.admins} Admins</span>
                  <span>•</span>
                  <span>{stats.pharmacists} Pharmacists</span>
                </div>
              </div>

              {/* Total Items */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600">
                    <InventoryIcon className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">
                    <TrendingUpIcon className="w-4 h-4" />
                    +8%
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Items</h3>
                <p className="text-4xl font-bold text-white mb-2">{stats.totalItems}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Value: ${stats.totalValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600">
                    <WarningIcon className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm">
                    <TrendingDownIcon className="w-4 h-4" />
                    Attention
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Low Stock Items</h3>
                <p className="text-4xl font-bold text-amber-500 mb-2">{stats.lowStock}</p>
                <div className="text-sm text-gray-400">Items with stock ≤ 5 units</div>
              </div>

              {/* Expired Items */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600">
                    <CalendarTodayIcon className="text-white text-2xl" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-sm">
                    <WarningIcon className="w-4 h-4" />
                    Urgent
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Expired Items</h3>
                <p className="text-4xl font-bold text-red-500 mb-2">{stats.expired}</p>
                <div className="text-sm text-gray-400">Requires immediate action</div>
              </div>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Users</h3>
                  <span className="text-sm text-gray-400">Last 5 added</span>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          user.role === 'admin' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {user.role === 'admin' ? <ShieldIcon /> : <LocalPharmacyIcon />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Status */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Inventory Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-gray-400">Valid</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-xs text-gray-400">Low Stock</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-gray-400">Expired</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Valid Items</span>
                      <span>{items.filter(item => getItemStatus(item) === "Valid").length}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(items.filter(item => getItemStatus(item) === "Valid").length / Math.max(items.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Low Stock Items</span>
                      <span>{stats.lowStock}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(stats.lowStock / Math.max(items.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Expired Items</span>
                      <span>{stats.expired}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(stats.expired / Math.max(items.length, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- ADD USER ---------------- */}
        {activeTab === "addUser" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                  <PersonAddIcon className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add New User</h2>
                  <p className="text-gray-400">Create new admin or pharmacist accounts</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <CloseIcon className="text-red-400" />
                    </div>
                    <p className="text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <SaveIcon className="text-emerald-400" />
                    </div>
                    <p className="text-emerald-300">{message}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddUser} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewUser({ ...newUser, role: "admin" })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        newUser.role === "admin"
                          ? "border-blue-500 bg-blue-500/10 text-blue-300"
                          : "border-gray-700 bg-gray-900 hover:border-gray-600 text-gray-400"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ShieldIcon className="text-xl" />
                        <span className="font-medium">Admin</span>
                        <span className="text-xs">Full system access</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setNewUser({ ...newUser, role: "pharmaciet" })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        newUser.role === "pharmaciet"
                          ? "border-purple-500 bg-purple-500/10 text-purple-300"
                          : "border-gray-700 bg-gray-900 hover:border-gray-600 text-gray-400"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <LocalPharmacyIcon className="text-xl" />
                        <span className="font-medium">Pharmacist</span>
                        <span className="text-xs">Pharmacy operations</span>
                      </div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create User Account
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- SHOW USERS ---------------- */}
        {activeTab === "showUsers" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <p className="text-gray-400">Manage admin and pharmacist accounts</p>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">All Users ({users.length})</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      {users.filter(u => u.role === "admin").length} Admins
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-400">
                      {users.filter(u => u.role === "pharmaciet").length} Pharmacists
                    </span>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-900/30">
                      <th className="py-4 px-6 text-left font-medium text-gray-400">User</th>
                      <th className="py-4 px-6 text-left font-medium text-gray-400">Email</th>
                      <th className="py-4 px-6 text-left font-medium text-gray-400">Role</th>
                      <th className="py-4 px-6 text-left font-medium text-gray-400">Status</th>
                      <th className="py-4 px-6 text-left font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              user.role === 'admin' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                            }`}>
                              {user.role === 'admin' ? 
                                <ShieldIcon className="text-blue-400" /> : 
                                <LocalPharmacyIcon className="text-purple-400" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-white">{user.name}</p>
                              <p className="text-sm text-gray-400">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-gray-300">{user.email}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'admin' 
                              ? 'bg-blue-500/20 text-blue-300' 
                              : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {user.role === 'admin' ? <ShieldIcon className="w-4 h-4" /> : <LocalPharmacyIcon className="w-4 h-4" />}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditUserModal(user)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <EditIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <DeleteIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {users.length === 0 && (
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                    <PeopleIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No users found</h3>
                  <p className="text-gray-500">Create your first user account</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- ITEMS MANAGEMENT ---------------- */}
        {activeTab === "items" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Items Management</h2>
              <p className="text-gray-400">Manage pharmacy inventory and stock</p>
            </div>

            {/* Filters and Search */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={itemCategoryFilter}
                    onChange={(e) => setItemCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.filter(c => c !== "all").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={itemStatusFilter}
                    onChange={(e) => setItemStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="Valid">Valid</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <select
                    value={itemSortBy}
                    onChange={(e) => setItemSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white appearance-none"
                  >
                    <option value="name">Sort by: Name</option>
                    <option value="stock">Sort by: Stock</option>
                    <option value="expiry">Sort by: Expiry</option>
                    <option value="category">Sort by: Category</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <FilterListIcon className="text-gray-500" />
                  <span className="text-sm text-gray-400">
                    Showing {filteredItems.length} of {items.length} items
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Valid</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Low Stock</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Expired</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  {/* Item Header */}
                  <div className={`p-4 ${getItemStatusColor(item.status || "")} border-b border-gray-700`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/10">
                          {getItemStatusIcon(item.status || "")}
                        </div>
                        <div>
                          <h3 className="font-bold text-white truncate">{item.name}</h3>
                          {item.category && (
                            <p className="text-xs text-gray-300">{item.category}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getItemStatusColor(item.status || "")}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Stock</p>
                        <p className={`text-lg font-bold ${item.stock <= 5 ? 'text-amber-500' : 'text-white'}`}>
                          {item.stock} units
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Expiry Date</p>
                        <p className={`text-sm font-medium ${item.status === 'Expired' ? 'text-red-500' : 'text-gray-300'}`}>
                          {new Date(item.expireDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Buy Price</p>
                        <p className="text-sm text-blue-400">${item.priceBuy.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Sell Price</p>
                        <p className="text-sm text-emerald-400">${item.priceSell.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Stock Level</span>
                        <span>{Math.min(100, (item.stock / 50) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            item.stock > 20 ? 'bg-emerald-500' :
                            item.stock > 5 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.stock / 50) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditItemModal(item)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                      >
                        <EditIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                      >
                        <DeleteIcon className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-gray-700">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
                  <InventoryIcon className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No items found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={openAddItemModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
                >
                  <InventoryIcon />
                  Add Your First Item
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ---------------- EDIT USER MODAL ---------------- */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <EditIcon className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit User</h2>
                  <p className="text-sm text-gray-400">Update user information</p>
                </div>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <CloseIcon className="text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password (Optional)</label>
                  <div className="relative">
                    <input
                      type={editUser.showPass ? "text" : "password"}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      value={editUser.password || ""}
                      onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                      placeholder="Leave blank to keep current"
                    />
                    <button
                      onClick={() => setEditUser({ ...editUser, showPass: !editUser.showPass })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300"
                    >
                      {editUser.showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <select
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white appearance-none"
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="pharmaciet">Pharmacist</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex justify-end gap-3">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="px-6 py-2 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- ADD ITEM MODAL ---------------- */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <InventoryIcon className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Add New Item</h2>
                  <p className="text-sm text-gray-400">Add new item to inventory</p>
                </div>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <CloseIcon className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Barcode</label>
                  <input
                    type="text"
                    value={editItem.barcode}
                    onChange={(e) => setEditItem({ ...editItem, barcode: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editItem.description}
                    onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={editItem.category}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c !== "all").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Buy Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editItem.priceBuy}
                    onChange={(e) => setEditItem({ ...editItem, priceBuy: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sell Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editItem.priceSell}
                    onChange={(e) => setEditItem({ ...editItem, priceSell: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={editItem.stock}
                    onChange={(e) => setEditItem({ ...editItem, stock: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={editItem.expireDate}
                    onChange={(e) => setEditItem({ ...editItem, expireDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex justify-end gap-3">
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="px-6 py-2 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- EDIT ITEM MODAL ---------------- */}
      {isEditItemModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <EditIcon className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Item</h2>
                  <p className="text-sm text-gray-400">Update item information</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditItemModalOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <CloseIcon className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={editItem.name}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Barcode</label>
                  <input
                    type="text"
                    value={editItem.barcode}
                    onChange={(e) => setEditItem({ ...editItem, barcode: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editItem.description}
                    onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={editItem.category}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c !== "all").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Buy Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editItem.priceBuy}
                    onChange={(e) => setEditItem({ ...editItem, priceBuy: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sell Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editItem.priceSell}
                    onChange={(e) => setEditItem({ ...editItem, priceSell: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={editItem.stock}
                    onChange={(e) => setEditItem({ ...editItem, stock: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={editItem.expireDate}
                    onChange={(e) => setEditItem({ ...editItem, expireDate: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 bg-gray-900/50 flex justify-end gap-3">
              <button
                onClick={() => setIsEditItemModalOpen(false)}
                className="px-6 py-2 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateItem}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;