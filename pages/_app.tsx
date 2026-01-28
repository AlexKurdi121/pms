'use client'
import Head from 'next/head'
import "../styles/globals.css";
import type { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";
import PharmacistSidebar from "./dash-pharmaciet/components/Sidebar";
import { useRouter } from "next/router";
import { useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Only show sidebar on /dash-pharmaciet routes
  const isDashboardRoute = router.pathname.startsWith("/dash-pharmaciet");

  // Sidebar collapsed state
  const [collapsed, setCollapsed] = useState(false);

  if (isDashboardRoute) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Head>
        <title>My Website</title>
      </Head>
        {/* Sidebar: fixed and responsive */}
        <PharmacistSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Main content: add margin-left based on sidebar width */}
        <main
          className={`flex-1 p-6 transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-64"
          }`}
        >
          <Component {...pageProps} />
        </main>
      </div>
    );
  }

  // Other routes (login, landing, etc.)
  return <Component {...pageProps} />;
}

export default MyApp;
