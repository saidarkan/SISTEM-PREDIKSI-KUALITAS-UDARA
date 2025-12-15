import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Loading from "./components/Loading.jsx";
import "./assets/tailwind.css";

// Lazy load komponen
const AdminLayout = React.lazy(() => import("./layouts/AdminLayout"));
const Dashboard = React.lazy(() => import("./components/RealtimeChart.jsx")); // pastikan path sesuai
const Tabel = React.lazy(() => import("./layouts/Tabel.jsx")); // pastikan path sesuai
const Analisis = React.lazy(() => import("./layouts/Analisis.jsx")); // pastikan path sesuai

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Semua route masuk AdminLayout */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} /> {/* "/" akan render Dashboard */}
          <Route path="/tabel" element={<Tabel />} /> 
           <Route path="/analisis" element={<Analisis />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
