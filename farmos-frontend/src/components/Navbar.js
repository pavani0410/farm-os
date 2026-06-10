import React from 'react';

function Navbar({ currentPage }) {
  const labels = {
    dashboard: 'Dashboard', farms: 'Farms', plots: 'Plots',
    crops: 'Crops', inventory: 'Inventory', employees: 'Employees',
    weather: 'Weather', leaf: 'Leaf AI Detection'
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      <div>
        <span className="text-xs text-gray-400">Farm OS </span>
        <span className="text-xs text-gray-400">›</span>
        <span className="text-xs text-gray-700 font-medium ml-1">{labels[currentPage]}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
          System online
        </span>
        <button className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors">
          + New farm
        </button>
      </div>
    </header>
  );
}

export default Navbar;