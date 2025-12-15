import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

// src/layouts/AdminLayout.jsx
export default function AdminLayout() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <div className="flex flex-1 min-h-0"> {/* <-- CONTAINER DUA KOLOM */}
        {/* Kolom Kiri */}
        <Sidebar />

        {/* Kolom Kanan (Konten Dashboard) */}
        <main className="flex-1 overflow-auto p-4 bg-white">
          <Outlet /> {/* <-- DASHBOARD DI RENDER DI SINI */}
        </main>
      </div>
    </div>
  );
}
