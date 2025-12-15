import React, { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function AnalisisGrafik() {
  const [rows1, setRows1] = useState([]);
  const [rows2, setRows2] = useState([]);

  const correlation = (arr1, arr2) => {
    const n = arr1.length;
    if (n === 0) return 0;
    const mean1 = arr1.reduce((a, b) => a + b, 0) / n;
    const mean2 = arr2.reduce((a, b) => a + b, 0) / n;
    let num = 0, den1 = 0, den2 = 0;
    for (let i = 0; i < n; i++) {
      num += (arr1[i] - mean1) * (arr2[i] - mean2);
      den1 += (arr1[i] - mean1) ** 2;
      den2 += (arr2[i] - mean2) ** 2;
    }
    return den1 && den2 ? num / Math.sqrt(den1 * den2) : 0;
  };

  const getHeatColor = (value) => {
    const v = Math.min(Math.max(value, -1), 1);
    const red = v > 0 ? Math.floor(255 * v) : 0;
    const blue = v < 0 ? Math.floor(255 * -v) : 0;
    return `rgb(${red},0,${blue})`;
  };

  useEffect(() => {
    fetch("http://localhost:5000/Tabel")
      .then(res => res.json())
      .then(data => {
        const cleaned = data.filter(d => d.timestamp && !isNaN(new Date(d.timestamp)))
          .map(d => ({
            time: new Date(d.timestamp),
            no2: Number(d.no2) || 0,
            pm25: Number(d.pm25) || 0,
            pm10: Number(d.pm10) || 0,
            ispu: Number(d.ispu_overall) || 0,
            temperature: Number(d.temperature) || 0,
            humidity: Number(d.humidity) || 0,
            kategori: d.prediction?.trim().toUpperCase() || "UNKNOWN",
          }));
        setRows1(cleaned);
      }).catch(console.error);
  }, []);

useEffect(() => {
  fetch("http://localhost:5001/TabelPekanbaru")
    .then(res => res.json())
    .then(data => {
      const cleaned = data.map(d => ({
        time: d.timestamp && !isNaN(new Date(d.timestamp)) ? new Date(d.timestamp) : null,
        no2: Number(d.no2) || 0,
        pm25: Number(d.pm25) || 0,
        pm10: Number(d.pm10) || 0,
        ispu: Number(d.ispu_overall) || 0,
        temperature: Number(d.temperature) || 0,
        humidity: Number(d.humidity) || 0,
        kategori: d.prediction?.trim().toUpperCase() || "UNKNOWN",
      }));
      setRows2(cleaned);
    })
    .catch(console.error);
}, []);


  const safeAvg = (arr, key) => {
    const filtered = arr.map(r => r[key]).filter(v => !isNaN(v));
    return filtered.length ? (filtered.reduce((a, b) => a + b, 0) / filtered.length).toFixed(2) : 0;
  };

  const countKategori = rows => {
    const result = { GOOD: 0, MODERATE: 0 };
    rows.forEach(r => {
      if (r.kategori === "GOOD") result.GOOD++;
      if (r.kategori === "MODERATE") result.MODERATE++;
    });
    return result;
  };

  const makeHourlyGrouped = rows => {
    const groups = Array(8).fill().map(() => []);
    rows.forEach(r => {
      if (!(r.time instanceof Date) || isNaN(r.time.getTime())) return;
      const hour = r.time.getHours();
      groups[Math.floor(hour / 3)].push(r.ispu);
    });
    const labels = ["00-02","03-05","06-08","09-11","12-14","15-17","18-20","21-23"];
    return groups.map((g, i) => ({ period: labels[i], ispu: g.length ? Number((g.reduce((a,b)=>a+b,0)/g.length).toFixed(2)) : 0 }));
  };

  const hourlyCompareData = makeHourlyGrouped(rows1).map((batam, i) => ({
    period: batam.period,
    Batam: batam.ispu,
    Pekanbaru: makeHourlyGrouped(rows2)[i]?.ispu || 0
  }));

  const avgISPU_Batam = safeAvg(rows1, "ispu");
  const avgISPU_Pekanbaru = safeAvg(rows2, "ispu");

  const pollutantCompareData = [
    { polutan:"NO₂", Batam: safeAvg(rows1,"no2"), Pekanbaru: safeAvg(rows2,"no2") },
    { polutan:"PM2.5", Batam: safeAvg(rows1,"pm25"), Pekanbaru: safeAvg(rows2,"pm25") },
    { polutan:"PM10", Batam: safeAvg(rows1,"pm10"), Pekanbaru: safeAvg(rows2,"pm10") }
  ];

  const pieDataBatam = Object.entries(countKategori(rows1)).map(([k,v])=>({name:k,value:v}));
  const pieDataPekanbaru = Object.entries(countKategori(rows2)).map(([k,v])=>({name:k,value:v}));

  const COLORS = ["#22c55e","#f59e0b"];

  const radarData = [
    { item:"ISPU", Batam: Number(avgISPU_Batam), Pekanbaru: Number(avgISPU_Pekanbaru) },
    { item:"NO₂", Batam: Number(safeAvg(rows1,"no2")), Pekanbaru: Number(safeAvg(rows2,"no2")) },
    { item:"PM2.5", Batam: Number(safeAvg(rows1,"pm25")), Pekanbaru: Number(safeAvg(rows2,"pm25")) },
    { item:"PM10", Batam: Number(safeAvg(rows1,"pm10")), Pekanbaru: Number(safeAvg(rows2,"pm10")) }
  ];

  const pollutants = ["no2","pm25","pm10","ispu","temperature","humidity"];
  const correlationMatrix = {};
  const validRows1 = rows1.filter(r=>pollutants.every(p=>!isNaN(r[p])));
  pollutants.forEach(p1=>{
    correlationMatrix[p1]={};
    pollutants.forEach(p2=>{
      const arr1 = validRows1.map(r=>r[p1]);
      const arr2 = validRows1.map(r=>r[p2]);
      correlationMatrix[p1][p2] = correlation(arr1,arr2);
    });
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Dashboard Analisis Perbandingan Kualitas Udara Batam vs Pekanbaru
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-600">Rata-rata ISPU Batam</h3>
          <p className="text-4xl font-bold text-green-600 mt-4">{avgISPU_Batam}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-600">Rata-rata ISPU Pekanbaru</h3>
          <p className="text-4xl font-bold text-red-600 mt-4">{avgISPU_Pekanbaru}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-600">Selisih ISPU</h3>
          <p className="text-4xl font-bold text-indigo-600 mt-4">
            {Math.abs(avgISPU_Batam-avgISPU_Pekanbaru).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
        <h2 className="text-xl font-semibold mb-6">ISPU Rata-rata per Rentang 3 Jam</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={hourlyCompareData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period"/>
            <YAxis/>
            <Tooltip/>
            <Legend/>
            <Line type="monotone" dataKey="Batam" stroke="#22c55e" strokeWidth={3} dot={{r:5}}/>
            <Line type="monotone" dataKey="Pekanbaru" stroke="#ef4444" strokeWidth={3} dot={{r:5}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Rata-rata Konsentrasi Polutan (µg/m³)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={pollutantCompareData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="polutan"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Bar dataKey="Batam" fill="#3b82f6"/>
              <Bar dataKey="Pekanbaru" fill="#f97316"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Profil Polusi Keseluruhan (Radar)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid/>
              <PolarAngleAxis dataKey="item"/>
              <PolarRadiusAxis angle={90} domain={[0,"dataMax"]}/>
              <Radar name="Batam" dataKey="Batam" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4}/>
              <Radar name="Pekanbaru" dataKey="Pekanbaru" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4}/>
              <Legend/>
              <Tooltip/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Proporsi Kategori Kualitas Udara</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-center mb-4">Batam</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieDataBatam} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                    {pieDataBatam.map((entry,index)=>(
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg font-medium text-center mb-4">Pekanbaru</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieDataPekanbaru} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                    {pieDataPekanbaru.map((entry,index)=>(
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 overflow-auto">
          <h2 className="text-xl font-semibold mb-6">Correlation Matrix (Batam)</h2>
          <div className="grid grid-cols-7 gap-1 text-center">
            <div className="font-bold"></div>
            {pollutants.map(p=><div key={p} className="font-bold">{p.toUpperCase()}</div>)}
            {pollutants.map(p1=>(
              <React.Fragment key={p1}>
                <div className="font-bold">{p1.toUpperCase()}</div>
                {pollutants.map(p2=>(
                  <div key={p2} className="p-2 text-white rounded" style={{backgroundColor:getHeatColor(correlationMatrix[p1][p2])}}>
                    {correlationMatrix[p1][p2]?.toFixed(2) || 0}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
