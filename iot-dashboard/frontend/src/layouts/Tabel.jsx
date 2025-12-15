import React, { useEffect, useState } from "react";

export default function Tabel() {
  const [rows, setRows] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    fetch("http://localhost:5000/Tabel")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // sort terbaru
          .map((d) => {
            const dateObj = new Date(d.timestamp);
            return {
              time: dateObj.toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
              no2: d.no2 ?? "-",
              pm25: d.pm25 ?? "-",
              pm10: d.pm10 ?? "-",
              temp: d.temperature ?? "-",
              hum: d.humidity ?? "-",
              ispu_overall: d.ispu_overall ?? "-",
              prediction: d.prediction ?? "-",
            };
          });

        setRows(formatted);
      })
      .catch((err) => console.log("Error fetch:", err));
  }, []);

  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = rows.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Pagination dinamis dengan window
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5; // jumlah tombol di sekitar current page
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);

    return pages;
  };

  return (
    <div className={`p-6 min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      <h2 className="text-2xl font-bold mb-4">MongoDB Atlas Data</h2>

      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setDarkMode(!darkMode)} className="btn btn-sm btn-outline">
          Toggle {darkMode ? "Light" : "Dark"} Mode
        </button>

        <div>
          <label className="mr-2 font-medium">Show:</label>
          <select
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="select select-bordered select-sm"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra table-hover w-full">
          <thead>
            <tr>
              <th>No</th>
              <th>Time</th>
              <th>NO₂</th>
              <th>PM2.5</th>
              <th>PM10</th>
              <th>Temperature</th>
              <th>Humidity</th>
              <th>ISPU Overall</th>
              <th>Prediction</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Loading data...
                </td>
              </tr>
            ) : (
              currentRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <td>{indexOfFirst + i + 1}</td>
                  <td>{row.time}</td>
                  <td>{row.no2}</td>
                  <td>{row.pm25}</td>
                  <td>{row.pm10}</td>
                  <td>{row.temp}</td>
                  <td>{row.hum}</td>
                  <td>{row.ispu_overall}</td>
                  <td>{row.prediction}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="join justify-center mt-4">
        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <button key={i} className="join-item btn btn-square btn-sm btn-disabled">
              ...
            </button>
          ) : (
            <input
              key={i}
              type="radio"
              name="page"
              aria-label={`${p}`}
              className="join-item btn btn-square btn-sm"
              checked={currentPage === p}
              onChange={() => handlePageChange(p)}
            />
          )
        )}
      </div>
    </div>
  );
}
