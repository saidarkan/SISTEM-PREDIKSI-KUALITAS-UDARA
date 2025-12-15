import React, { useEffect, useState } from "react";
import { Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  CategoryScale,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement
);

// ======================
// HELPERS
// ======================
function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getAqiGradient(aqi) {
  if (aqi <= 50) return "from-green-400 to-green-600";
  if (aqi <= 100) return "from-yellow-400 to-yellow-600";
  if (aqi <= 200) return "from-orange-400 to-orange-600";
  return "from-red-500 to-red-700";
}

// ======================
// MAIN COMPONENT
// ======================
export default function RealtimeDashboard() {
  const [dataPoints, setDataPoints] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // ======================
  // AVG ISPU OVERALL
  // ======================
  const avgISPU =
    dataPoints.length > 0
      ? Number(
          (
            dataPoints.reduce(
              (sum, d) => sum + (d.ispu_overall || 0),
              0
            ) / dataPoints.length
          ).toFixed(2)
        )
      : 0;

  const latest = dataPoints[dataPoints.length - 1] || {};

  // ======================
  // WEBSOCKET
  // ======================
  useEffect(() => {
    let ws;

    const connect = () => {
      ws = new WebSocket("ws://localhost:8081");

      ws.onmessage = (ev) => {
        try {
          const raw = JSON.parse(ev.data);

          if (raw.type === "history") {
            setDataPoints(
              raw.data.map((d) => ({
                t: formatTime(d.timestamp),
                no2: d.no2 ?? null,
                pm25: d.pm25 ?? null,
                pm10: d.pm10 ?? null,
                temp: d.temperature ?? null,
                hum: d.humidity ?? null,
                ispu_overall: d.ispu_overall ?? 0,
              }))
            );
            return;
          }

          if (raw.type === "sensor") {
            const d = raw.data;
            setDataPoints((prev) =>
              [
                ...prev,
                {
                  t: formatTime(d.timestamp),
                  no2: d.no2 ?? null,
                  pm25: d.pm25 ?? null,
                  pm10: d.pm10 ?? null,
                  temp: d.temperature ?? null,
                  hum: d.humidity ?? null,
                  ispu_overall: d.ispu_overall ?? 0,
                },
              ].slice(-120)
            );
          }
        } catch (err) {
          console.error(err);
        }
      };

      ws.onclose = () => setTimeout(connect, 2000);
    };

    connect();
    return () => ws?.close();
  }, []);

  // ======================
  // CHART OPTIONS
  // ======================
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: darkMode ? "#fff" : "#000" } },
    },
    scales: {
      x: { ticks: { color: darkMode ? "#fff" : "#000" } },
      y: { ticks: { color: darkMode ? "#fff" : "#000" } },
    },
  };

  const makeChart = (label, field, color) => ({
    labels: dataPoints.map((p) => p.t),
    datasets: [
      {
        label,
        data: dataPoints.map((p) => p[field]),
        borderColor: color,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  });

  // ======================
  // PIE & GAUGE
  // ======================
  const pollutantPieData = {
    labels: ["NO₂", "PM2.5", "PM10"],
    datasets: [
      {
        data: [latest.no2 ?? 0, latest.pm25 ?? 0, latest.pm10 ?? 0],
        backgroundColor: ["#ff4d4f", "#40a9ff", "#faad14"],
      },
    ],
  };

  const aqiGaugeData = {
    datasets: [
      {
        data: [avgISPU, 500 - avgISPU],
        backgroundColor: ["#ff4d4f", "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  };

  const aqiGaugeOptions = {
    circumference: 180,
    rotation: -90,
    cutout: "75%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="min-h-screen p-8 bg-slate-100">
      <h1 className="text-3xl font-bold mb-10">Realtime ISPU Dashboard</h1>

      {/* BIG CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <BigCard label="NO₂" value={latest.no2} unit="µg/m³" />
        <BigCard label="PM2.5" value={latest.pm25} unit="µg/m³" />
        <BigCard label="PM10" value={latest.pm10} unit="µg/m³" />
        <BigCard
          label="ISPU"
          value={avgISPU}
          highlight={`bg-gradient-to-r ${getAqiGradient(avgISPU)} text-white`}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <ChartCard title="Pollutant Composition">
          <Pie data={pollutantPieData} />
        </ChartCard>

        <ChartCard title="ISPU Meter">
          <Doughnut data={aqiGaugeData} options={aqiGaugeOptions} />
        </ChartCard>

        <ChartCard title="Temperature & Humidity">
          <Line
            data={{
              labels: dataPoints.map((p) => p.t),
              datasets: [
                {
                  label: "Temp (°C)",
                  data: dataPoints.map((p) => p.temp),
                  borderColor: "#73d13d",
                  pointRadius: 0,
                },
                {
                  label: "Humidity (%)",
                  data: dataPoints.map((p) => p.hum),
                  borderColor: "#9254de",
                  pointRadius: 0,
                },
              ],
            }}
            options={baseOptions}
          />
        </ChartCard>

        <ChartCard title="ISPU Trend">
          <Line
            data={makeChart("ISPU", "ispu_overall", "#ff4d4f")}
            options={baseOptions}
          />
        </ChartCard>
      </div>

      {/* POLUTANT TRENDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="NO₂ Trend">
          <Line data={makeChart("NO₂", "no2", "#ff4d4f")} options={baseOptions} />
        </ChartCard>

        <ChartCard title="PM2.5 Trend">
          <Line data={makeChart("PM2.5", "pm25", "#40a9ff")} options={baseOptions} />
        </ChartCard>

        <ChartCard title="PM10 Trend">
          <Line data={makeChart("PM10", "pm10", "#faad14")} options={baseOptions} />
        </ChartCard>
      </div>
    </div>
  );
}

// ======================
// COMPONENTS
// ======================
function ChartCard({ title, children }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow">
      <h3 className="mb-4 font-semibold">{title}</h3>
      <div className="h-[260px]">{children}</div>
    </div>
  );
}

function BigCard({ label, value, unit, highlight }) {
  return (
    <div className={`p-6 rounded-2xl shadow ${highlight ?? "bg-white"}`}>
      <h3 className="text-sm opacity-70 mb-2">{label}</h3>
      <p className="text-4xl font-extrabold">
        {value ?? "-"} <span className="text-lg">{unit}</span>
      </p>
    </div>
  );
}
