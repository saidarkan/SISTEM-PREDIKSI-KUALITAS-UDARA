import React from "react";
import {
  FaHome,
  FaUser,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: FaHome, path: "/" },
  { name: "Tabel", icon: FaUser, path: "/Tabel" },
  { name: "Analytics", icon: FaChartBar, path: "/Analisis" },
 
];

const Sidebar = React.memo(() => {
  return (
    <div className="h-full w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      <div className="text-3xl font-bold p-6 border-b border-gray-700">
        MyApp
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="flex flex-col gap-2">
   {menuItems.map((item) => {
  const Icon = item.icon;

  return (
    <li key={item.name}>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 p-3 rounded-lg transition-colors ${
            isActive ? "bg-blue-600" : "hover:bg-gray-700"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon className={`text-xl ${isActive ? "text-white" : "text-gray-400"}`} />
            <span className={`${isActive ? "text-white" : "text-gray-400"}`}>
              {item.name}
            </span>
          </>
        )}
      </NavLink>
    </li>
  );
})}


        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        &copy; 2025 MyApp
      </div>
    </div>
  );
});

export default Sidebar;
