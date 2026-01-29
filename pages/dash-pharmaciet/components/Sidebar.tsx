"use client";

import Link from "next/link";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import StorageIcon from "@mui/icons-material/Storage";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function PharmacistSidebar({ collapsed, setCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState("Loading...");
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /** Detect screen size for mobile view */
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (!mobile) {
        setIsSidebarOpen(false);
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, [setCollapsed]);

  /** Fetch logged-in user info */
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  axios
    .get("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      const user = res.data.user;
      if (user) setUserName(`${user.name} - ${user.role}`);
    })
    .catch(() => setUserName("Unknown User"));
}, []);


  /** Logout */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  const navLinks = [
    { href: "/dash-pharmaciet", label: "Dashboard", icon: <DashboardIcon /> },
    { href: "/dash-pharmaciet/pos", label: "POS", icon: <PointOfSaleIcon /> },
    { href: "/dash-pharmaciet/items", label: "Items", icon: <InventoryIcon /> },
    { href: "/dash-pharmaciet/billing", label: "Billing", icon: <ReceiptIcon /> },
    { href: "/dash-pharmaciet/stock", label: "Stock", icon: <StorageIcon /> },
  ];

  const handleLinkClick = (href: string) => {
    if (isMobile) setIsSidebarOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Mobile Open Menu */}
      {isMobile && !isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg"
        >
          <MenuIcon className="text-white" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen z-40 flex flex-col justify-between
          bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 
          text-white shadow-2xl transition-all duration-300
          ${isMobile ? "transform" : ""}
          ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
          ${collapsed && !isMobile ? "w-20" : "w-64"}
        `}
      >
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg"
          >
            <CloseIcon />
          </button>
        )}

        {/* Desktop Collapse Button */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute top-4 right-[-12px] w-6 h-6 bg-cyan-400 text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            {collapsed ? "»" : "«"}
          </button>
        )}

        {/* Logo + User Section */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
            <span className="text-xl font-bold text-cyan-300">💊</span>
          </div>

          {(!collapsed || isMobile) && (
            <>
              <h1 className="text-xl font-bold tracking-tight text-cyan-300 mb-1">
                Pharmacy
              </h1>

              {/* Username */}
              <div className="flex flex-col items-center gap-1 mt-2 bg-white/10 p-3 rounded-lg backdrop-blur-sm w-full">
                <div className="flex items-center gap-2 w-full justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
                    <span className="text-sm truncate font-medium">
                      {userName}
                    </span>
                  </div>
                  <NotificationsIcon className="text-white/80" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}

        <ul className={`flex flex-col gap-3 p-4 mt-4 flex-1 ${collapsed && !isMobile ? "items-center" : ""}`}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href} className="relative group">
                <button
                  onClick={() => handleLinkClick(link.href)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all w-full ${
                    collapsed && !isMobile ? "justify-center" : ""
                  } ${
                    isActive
                      ? "text-white font-semibold bg-white/20 backdrop-blur-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center rounded-full flex-shrink-0 ${
                      collapsed && !isMobile ? "w-8 h-8" : "w-10 h-10"
                    } ${isActive ? "bg-white/20" : "bg-white/10"}`}
                  >
                    {link.icon}
                  </div>

                  {(!collapsed || isMobile) && <span className="truncate">{link.label}</span>}
                </button>

                {/* Tooltip when collapsed */}
                {collapsed && !isMobile && (
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {link.label}
                  </span>
                )}
              </li>
            );
          })}

          {/* Logout */}
          <li className={`${collapsed && !isMobile ? "mt-auto" : ""}`}>
            <button
              onClick={logout}
              className={`flex items-center gap-3 w-full p-3 bg-red-500 hover:bg-red-600 rounded-lg transition font-semibold shadow-md ${
                collapsed && !isMobile ? "justify-center" : ""
              }`}
            >
              <LogoutIcon />
              {(!collapsed || isMobile) && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
