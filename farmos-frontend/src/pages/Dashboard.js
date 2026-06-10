import React, { useEffect, useState } from 'react';
import api from '../services/api';

const features = [
  { id: 'farms', name: 'Farm management', desc: 'Create and manage farms', live: true, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'plots', name: 'Plot management', desc: 'Divide farms into sections', live: true, color: 'bg-blue-50 text-blue-600' },
  { id: 'crops', name: 'Crop management', desc: 'Calendar, irrigation, fertigation', live: false, color: 'bg-gray-50 text-gray-400' },
  { id: 'inventory', name: 'Inventory', desc: 'Fertilizers, pesticides, equipment', live: false, color: 'bg-gray-50 text-gray-400' },
  { id: 'employees', name: 'Employees & payroll', desc: 'Attendance and wage tracking', live: false, color: 'bg-gray-50 text-gray-400' },
  { id: 'weather', name: 'Weather', desc: 'Hyperlocal forecasts and alerts', live: false, color: 'bg-gray-50 text-gray-400' },
  { id: 'leaf', name: 'Leaf AI detection', desc: 'Disease diagnosis via Hugging Face', live: false, color: 'bg-gray-50 text-gray-400' },
];

const progress = [
  { label: 'Farms', pct: 100, color: 'bg-emerald-400' },
  { label: 'Plots', pct: 60, color: 'bg-blue-400' },
  { label: 'Crops', pct: 0, color: 'bg-gray-200' },
  { label: 'Inventory', pct: 0, color: 'bg-gray-200' },
  { label: 'Employees', pct: 0, color: 'bg-gray-200' },
  { label: 'Leaf AI', pct: 0, color: 'bg-gray-200' },
];

function Dashboard({ setCurrentPage }) {
  const [farmCount, setFarmCount] = useState('—');

  useEffect(() => {
    api.get('/farms')
      .then(res => setFarmCount(res.data.length))
      .catch(() => setFarmCount('—'));
  }, []);

  return (
    <div className="max-w-5xl mx-auto">

      {/* header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Good morning</h1>
        <p className="text-sm text-gray-400 mt-0.5">Here's what's happening on your farm today.</p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Farms', value: farmCount, sub: 'Active', color: 'text-emerald-600' },
          { label: 'Plots', value: '—', sub: 'Add plots to track', color: 'text-gray-300' },
          { label: 'Active crops', value: '—', sub: 'No crops yet', color: 'text-gray-300' },
          { label: 'Employees', value: '—', sub: 'No records yet', color: 'text-gray-300' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
            <div className="text-xs text-gray-400 mb-2">{stat.label}</div>
            <div className={`text-2xl font-semibold tracking-tight ${stat.value === '—' ? 'text-gray-200' : 'text-gray-900'}`}>{stat.value}</div>
            <div className={`text-xs mt-1 ${stat.color}`}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* features */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">Modules</h2>
        <span className="text-xs text-gray-400">{features.filter(f => f.live).length} of {features.length} live</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {features.map(f => (
          <button
            key={f.id}
            onClick={() => setCurrentPage(f.id)}
            className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-gray-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`text-xs px-2 py-1 rounded-md font-medium ${f.color}`}>
                {f.live ? '● Live' : '○ Soon'}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-800 group-hover:text-gray-900">{f.name}</div>
            <div className="text-xs text-gray-400 mt-0.5">{f.desc}</div>
          </button>
        ))}
      </div>

      {/* bottom row */}
      <div className="grid grid-cols-2 gap-3">

        {/* activity */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Recent activity</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Today</span>
          </div>
          {[
            { text: 'Farm created — My Avocado Farm', sub: 'Karnataka · 40 acres', dot: 'bg-emerald-400' },
            { text: 'Backend connected to PostgreSQL', sub: 'Spring Boot · port 8081', dot: 'bg-blue-400' },
            { text: 'React frontend initialized', sub: 'Tailwind CSS · port 3000', dot: 'bg-amber-400' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${item.dot}`}></div>
              <div>
                <div className="text-xs text-gray-700">{item.text}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* progress */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Build progress</h3>
            <span className="text-xs text-gray-400">MVP phase</span>
          </div>
          {progress.map(p => (
            <div key={p.label} className="flex items-center gap-3 mb-2.5 last:mb-0">
              <div className="text-xs text-gray-500 w-20 flex-shrink-0">{p.label}</div>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${p.color} transition-all duration-700`} style={{ width: `${p.pct}%` }}></div>
              </div>
              <div className="text-xs text-gray-400 w-8 text-right">{p.pct > 0 ? `${p.pct}%` : '—'}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;