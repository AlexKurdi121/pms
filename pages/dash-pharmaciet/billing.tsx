import { useEffect, useState } from "react";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ShareIcon from "@mui/icons-material/Share";
import EmailIcon from "@mui/icons-material/Email";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import PaymentIcon from "@mui/icons-material/Payment";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface Item {
  id: number;
  name: string;
  priceSell: number;
  category?: string;
}

interface SaleItem {
  id: number;
  item: Item;
  quantity: number;
  price: number;
}

interface Sale {
  id: number;
  createdAt: string;
  total: number;
  saleItems: SaleItem[];
  paymentMethod?: string;
  customerName?: string;
  receiptNumber?: string;
}

const Billing = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Date filters
  const dateFilters = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "quarter", label: "This Quarter" },
  ];

  // Fetch all sales with error handling
  useEffect(() => {
    fetchSales();
  }, [token]);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError("Unauthorized. Please login again.");
        return;
      }
      const res = await axios.get("/api/route/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Check if response data exists
      if (res.data && Array.isArray(res.data)) {
        setSales(res.data);
      } else {
        setSales([]);
        setError("No sales data found");
      }
    } catch (err: any) {
      console.error("Error fetching sales:", err);
      setError(err.response?.data?.message || "Failed to fetch sales data");
      setSales([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // View a single sale with error handling
  const viewSale = async (id: number) => {
    try {
      if (!token) {
        setError("Unauthorized. Please login again.");
        return;
      }
      const res = await axios.get(`/api/route/sale/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedSale(res.data);
    } catch (err: any) {
      console.error("Error fetching sale details:", err);
      setError(err.response?.data?.message || "Failed to fetch sale details");
    }
  };

  // Filter sales based on search and date
  const filteredSales = (sales || []).filter(sale => {
    if (!sale) return false;
    
    const matchesSearch = 
      sale.id?.toString().includes(searchTerm) ||
      (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sale.receiptNumber && sale.receiptNumber.includes(searchTerm));

    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);

    switch (dateFilter) {
      case "today":
        return matchesSearch && saleDate.toDateString() === new Date().toDateString();
      case "week":
        return matchesSearch && saleDate >= startOfWeek;
      case "month":
        return matchesSearch && saleDate >= startOfMonth;
      case "quarter":
        return matchesSearch && saleDate >= startOfQuarter;
      default:
        return matchesSearch;
    }
  }).sort((a, b) => {
    if (!a || !b) return 0;
    
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "high":
        return (b.total || 0) - (a.total || 0);
      case "low":
        return (a.total || 0) - (b.total || 0);
      default:
        return 0;
    }
  });

  // Calculate statistics with safe access
  const stats = {
    totalSales: (sales || []).length,
    totalRevenue: (sales || []).reduce((sum, sale) => sum + (sale?.total || 0), 0),
    todayRevenue: (sales || []).filter(s => s && new Date(s.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, sale) => sum + (sale?.total || 0), 0),
    avgTransaction: (sales || []).length > 0 ? 
      (sales || []).reduce((sum, sale) => sum + (sale?.total || 0), 0) / (sales || []).length : 0,
  };

  // Generate receipt number safely
  const generateReceiptNo = (sale: Sale | null) => {
    if (!sale) return "N/A";
    if (sale.receiptNumber) return sale.receiptNumber;
    const date = new Date(sale.createdAt);
    return `REC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${sale.id.toString().padStart(4, '0')}`;
  };

  // Export to CSV with safe data access
  const exportToCSV = () => {
    const data = sales || [];
    const csv = [
      ["Sale ID", "Date", "Customer", "Items", "Total", "Payment Method", "Receipt No"],
      ...data.map(sale => [
        sale?.id || "N/A",
        sale ? new Date(sale.createdAt).toLocaleString() : "N/A",
        sale?.customerName || "N/A",
        (sale?.saleItems?.length || 0).toString(),
        (sale?.total || 0).toFixed(2),
        sale?.paymentMethod || "N/A",
        generateReceiptNo(sale || null)
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  // Print receipt using browser's print functionality
  const printReceipt = () => {
    const receiptContent = document.getElementById('receipt-content');
    if (!receiptContent) return;
    
    const originalContent = document.body.innerHTML;
    const printContent = receiptContent.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore functionality
  };

  // Handle print for a specific sale
  const handlePrintSale = (sale: Sale) => {
    setSelectedSale(sale);
    setTimeout(() => {
      printReceipt();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                  <ReceiptIcon className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Billing & Transactions</h1>
                  <p className="text-gray-600 mt-1">View and manage all sales transactions</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm hover:shadow"
              >
                <DownloadIcon className="w-5 h-5" />
                <span className="hidden md:inline">Export CSV</span>
              </button>
              <button
                onClick={fetchSales}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm hover:shadow"
              >
                <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalSales}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <ReceiptIcon />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
                  <AttachMoneyIcon />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${stats.todayRevenue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <TrendingUpIcon />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Transaction</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.avgTransaction.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                  <ShoppingCartIcon />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <CloseIcon className="text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, customer, or receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
              />
            </div>

            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none hover:border-gray-400 transition-colors"
              >
                {dateFilters.map(filter => (
                  <option key={filter.id} value={filter.id}>{filter.label}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none hover:border-gray-400 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="high">Highest Amount</option>
                <option value="low">Lowest Amount</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors w-full justify-center">
                <FilterListIcon className="text-gray-500" />
                <span className="text-gray-700">Filters</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DescriptionIcon className="text-gray-500" />
              <span className="text-sm text-gray-600">
                Showing {filteredSales.length} of {stats.totalSales} transactions
              </span>
            </div>
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && filteredSales.length === 0 && (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        )}

        {/* Transactions Grid */}
        {!loading && filteredSales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Sale Header */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <ReceiptIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">Sale #{sale.id}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <CalendarTodayIcon className="w-4 h-4" />
                          <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      new Date(sale.createdAt).toDateString() === new Date().toDateString()
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {new Date(sale.createdAt).toDateString() === new Date().toDateString() ? "Today" : "Past"}
                    </span>
                  </div>
                </div>

                {/* Sale Details */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Items</p>
                      <p className="text-lg font-bold text-gray-800">
                        {(sale.saleItems || []).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment</p>
                      <p className="text-sm font-medium text-blue-600 flex items-center gap-1">
                        <PaymentIcon className="w-4 h-4" />
                        {sale.paymentMethod || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="text-sm font-medium text-gray-800 truncate flex items-center gap-1">
                        <PersonIcon className="w-4 h-4" />
                        {sale.customerName || "Walk-in"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Receipt</p>
                      <p className="text-sm font-medium text-gray-800 font-mono truncate">
                        {generateReceiptNo(sale)}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Total Amount</span>
                      <span className="text-2xl font-bold text-emerald-600">${sale.total?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewSale(sale.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all hover:shadow-sm"
                    >
                      <VisibilityIcon className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handlePrintSale(sale)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-md"
                    >
                      <PrintIcon className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Empty State */}
        {!loading && filteredSales.length === 0 && (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full mb-4">
              <ReceiptIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or date filters</p>
            <button
              onClick={fetchSales}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
            >
              <RefreshIcon />
              Refresh Data
            </button>
          </div>
        )}

        {/* Selected Sale Details Modal */}
        {selectedSale && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Sale Details</h2>
                  <p className="text-gray-600 mt-1">Transaction #{selectedSale.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={printReceipt}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <PrintIcon />
                    Print
                  </button>
                  <button
                    onClick={() => setSelectedSale(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Printable Receipt Content (Hidden by default) */}
                <div id="receipt-content" className="hidden">
                  <div style={{ 
                    maxWidth: '80mm', 
                    margin: '0 auto',
                    fontFamily: "'Courier New', monospace",
                    fontSize: '12px',
                    padding: '20px'
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>MEDICARE PHARMACY</h2>
                      <p style={{ fontSize: '11px', marginBottom: '2px' }}>123 Health Street, Medical City</p>
                      <p style={{ fontSize: '11px', marginBottom: '8px' }}>Tel: (555) 123-4567</p>
                      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '8px 0', margin: '12px 0' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>OFFICIAL RECEIPT</div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span>Receipt:</span>
                        <span style={{ fontWeight: 'bold' }}>{generateReceiptNo(selectedSale)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span>Date:</span>
                        <span>{new Date(selectedSale.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Time:</span>
                        <span>{new Date(selectedSale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {selectedSale.customerName && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>Customer:</span>
                          <span>{selectedSale.customerName}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px', marginBottom: '8px', borderBottom: '1px solid #000', paddingBottom: '4px' }}>
                        <div style={{ fontWeight: 'bold' }}>ITEM</div>
                        <div style={{ fontWeight: 'bold', textAlign: 'right' }}>QTY</div>
                        <div style={{ fontWeight: 'bold', textAlign: 'right' }}>AMOUNT</div>
                      </div>
                      
                      {(selectedSale.saleItems || []).map((si, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '4px', marginBottom: '6px' }}>
                          <div>{si.item?.name || "Unknown Item"}</div>
                          <div style={{ textAlign: 'right' }}>{si.quantity}</div>
                          <div style={{ textAlign: 'right' }}>${((si.price || 0) * (si.quantity || 0)).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px dashed #000', paddingTop: '10px', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #000' }}>
                        <span>TOTAL:</span>
                        <span>${selectedSale.total?.toFixed(2) || "0.00"}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', borderTop: '1px dashed #000', paddingTop: '15px', marginTop: '20px' }}>
                      <div style={{ fontSize: '10px', marginBottom: '6px' }}>Thank you for your purchase!</div>
                      <div style={{ fontSize: '9px', marginBottom: '4px' }}>** TAX INVOICE **</div>
                    </div>
                  </div>
                </div>

                {/* Visible Sale Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <ReceiptIcon className="text-blue-600" />
                        Transaction Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Transaction ID</span>
                          <span className="font-medium text-gray-800">#{selectedSale.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Date & Time</span>
                          <span className="font-medium text-gray-800">
                            {new Date(selectedSale.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Method</span>
                          <span className="font-medium text-blue-600">{selectedSale.paymentMethod || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Receipt Number</span>
                          <span className="font-medium text-gray-800 font-mono">{generateReceiptNo(selectedSale)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Customer</span>
                          <span className="font-medium text-gray-800">{selectedSale.customerName || "Walk-in Customer"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl p-6 border border-emerald-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <AttachMoneyIcon className="text-emerald-600" />
                        Payment Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">${selectedSale.total?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax (8%)</span>
                          <span>${(selectedSale.total * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t border-emerald-200">
                          <div className="flex justify-between text-xl font-bold">
                            <span>Grand Total</span>
                            <span className="text-emerald-600">
                              ${((selectedSale.total || 0) * 1.08).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-full">
                      <div className="px-6 py-4 border-b bg-gray-50">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <ShoppingCartIcon className="text-gray-600" />
                          Items Purchased ({(selectedSale.saleItems || []).length})
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {(selectedSale.saleItems || []).map((si) => (
                            <div key={si.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div>
                                <div className="font-medium text-gray-800">{si.item?.name || "Unknown Item"}</div>
                                {si.item?.category && (
                                  <div className="text-xs text-gray-500 mt-1">{si.item.category}</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-800">
                                  {si.quantity} × ${si.price?.toFixed(2) || "0.00"}
                                </div>
                                <div className="text-sm font-bold text-emerald-600">
                                  ${((si.price || 0) * (si.quantity || 0)).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;