import React from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import { HiOutlineUser } from "react-icons/hi";


export default function Header() {
  function handleMenuChange(value) {
    if (value === "dashboard") {
      window.open("https://rent-car-virid-ten.vercel.app/", "_blank");
    } else if (value === "logout") {
      logout();
    }
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <header className="flex items-center justify-between bg-gray-900 text-white px-6 py-3 shadow-md sticky top-0 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <img src="/img/air.png" alt="Logo" className="w-30 h-12 object-contain" />
        <h1 className="text-xl font-bold">Air<span className="text-blue-400">Monitor</span></h1>
      </div>

      {/* Search bar */}
      <div className="flex-1 mx-6 relative max-w-md">
        <input
          type="text"
          placeholder="Search data..."
          className="w-full px-4 py-2 pr-10 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />
        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 bg-gray-700 rounded-full hover:bg-green-500/40 transition">
          <FaBell className="text-blue-400" />
        </button>

      
      </div>
    </header>
  );
}
