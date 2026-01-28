"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PrintIcon from "@mui/icons-material/Print";

interface Item {
  id: number;
  name: string;
  priceSell: number;
  stock: number;
  status: string;
  barcode: string; // <-- barcode field
}

interface SaleItem {
  itemId: number;
  name: string;
  quantity: number;
  price: number;
}

export default function POS() {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState("");
  const [barcodeMode, setBarcodeMode] = useState<"scan" | "text">("scan"); // scan or manual
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/route/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.filter((i: Item) => i.status === "Valid"));
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  };

  const addToCart = (item: Item) => {
    const existing = cart.find(c => c.itemId === item.id);

    if (existing) {
      if (existing.quantity >= item.stock) {
        alert(`Only ${item.stock} stock available for "${item.name}"`);
        return;
      }
      setCart(cart.map(c => c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      if (item.stock < 1) {
        alert(`"${item.name}" is out of stock`);
        return;
      }
      setCart([...cart, { itemId: item.id, name: item.name, quantity: 1, price: item.priceSell }]);
    }
  };

  const removeFromCart = (itemId: number) => setCart(cart.filter(c => c.itemId !== itemId));

  const handleChangeQuantity = (itemId: number, qty: number) => {
    if (qty < 1) return;

    const stock = items.find(i => i.id === itemId)?.stock || 0;
    if (qty > stock) {
      const itemName = items.find(i => i.id === itemId)?.name;
      alert(`Only ${stock} stock available for "${itemName}"`);
      qty = stock;
    }

    setCart(cart.map(c => c.itemId === itemId ? { ...c, quantity: qty } : c));
  };

  const handleSale = async () => {
    if (!cart.length) return alert("Cart is empty");
    try {
      const res = await axios.post(
        "/api/route/sale",
        { items: cart },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Sale completed! Sale ID: " + res.data.sale.id);
      setCart([]);
    } catch (err) {
      console.error("Sale failed:", err);
    }
  };

  const total = cart.reduce((acc, c) => acc + c.quantity * c.price, 0);

  // Filter items by name or barcode
  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.barcode.includes(search)
  );

  const handlePrint = () => {
    if (!cart.length) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt </title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; }
            .receipt { max-width: 300px; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { margin-top: 20px; padding-top: 10px; border-top: 2px dashed #000; }
            .thank-you { text-align: center; margin-top: 20px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>MediCare Pharmacy</h2>
              <p>${new Date().toLocaleString()}</p>
            </div>
            ${cart.map(item => `
              <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="total">
              <div class="item"><strong>TOTAL: </strong> <strong>$${total}</strong></div>
              <div class="item"><strong> Payment: Cash</strong></div>
            </div>
            <div class="thank-you">
              <p>Thank you for your purchase!</p>
              <p>** Tax Invoice **</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Point of Sale</h1>

      {/* Search + Barcode Mode */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder={barcodeMode === "scan" ? "Scan barcode here..." : "Search items by name or barcode..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 w-full md:w-1/2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          autoFocus={barcodeMode === "scan"}
          onKeyDown={e => {
            if (barcodeMode === "scan" && e.key === "Enter") {
              const item = items.find(i => i.barcode === search);
              if (item) addToCart(item);
              setSearch("");
            }
          }}
        />
        <div className="flex gap-4 mt-2 md:mt-0">
          <label className="flex items-center gap-1">
            <input type="radio" checked={barcodeMode === "scan"} onChange={() => setBarcodeMode("scan")} />
            Scan
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" checked={barcodeMode === "text"} onChange={() => setBarcodeMode("text")} />
            Manual
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items List */}
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200">
          <h2 className="font-bold text-lg mb-4">Available Items</h2>
          {filteredItems.map(item => {
            const stockColor =
              item.stock === 0 ? "bg-red-500" :
              item.stock < 10 ? "bg-orange-400" : "bg-green-400";
            const stockWidth = Math.min((item.stock / 50) * 100, 100);

            return (
              <div key={item.id} className="flex justify-between items-center mb-3 p-2 rounded-lg hover:scale-105 transition-transform shadow-sm border border-gray-100">
                <div>
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-600">${item.priceSell}</div>
                  <div className="w-full bg-gray-200 h-2 rounded mt-1">
                    <div className={`${stockColor} h-2 rounded transition-all`} style={{ width: `${stockWidth}%` }}></div>
                  </div>
                  <div className="text-xs mt-1 text-gray-700">Stock: {item.stock}</div>
                  <div className="text-xs mt-1 text-gray-500">Barcode: {item.barcode}</div>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition shadow"
                >
                  Add
                </button>
              </div>
            );
          })}
        </div>

        {/* Cart */}
        <div className="bg-white/60 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200 flex flex-col">
          <h2 className="font-bold text-lg mb-4">Shopping Cart</h2>
          {cart.length === 0 && <div className="text-gray-500 text-center py-10">Cart is empty</div>}
          {cart.map(c => (
            <div key={c.itemId} className="flex justify-between items-center mb-3 p-2 rounded-lg hover:shadow-md transition border border-gray-100">
              <div className="flex-1">
                <div className="font-medium text-gray-800">{c.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => handleChangeQuantity(c.itemId, c.quantity - 1)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 rounded">-</button>
                  <input type="number" value={c.quantity} onChange={(e) => handleChangeQuantity(c.itemId, parseInt(e.target.value))} className="w-16 text-center border rounded px-1 py-0.5"/>
                  <button onClick={() => handleChangeQuantity(c.itemId, c.quantity + 1)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 rounded">+</button>
                  <span className="ml-2 font-semibold">${c.quantity * c.price}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(c.itemId)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition">Remove</button>
            </div>
          ))}

          {/* Total & Checkout */}
          {cart.length > 0 && (
            <div className="mt-auto pt-4 border-t border-gray-300 flex flex-col gap-2">
              <div className="text-lg font-bold">Total: ${total}</div>
              <button onClick={handleSale} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition shadow-lg">Complete</button>
              <button onClick={handlePrint} disabled={cart.length === 0} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                <PrintIcon />
                <span className="hidden md:inline">Print Preview</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
