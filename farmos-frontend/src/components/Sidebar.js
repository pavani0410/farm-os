import React from 'react';

const navSections = [
  {
    label: 'Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '⊞', live: true },
      { id: 'farms', label: 'Farms', icon: '◈', live: true },
      { id: 'plots', label: 'Plots', icon: '⬡', live: true },
    ]
  },
  {
    label: 'Agri',
    items: [
      { id: 'crops', label: 'Crops', icon: '❧', live: false },
      { id: 'inventory', label: 'Inventory', icon: '▦', live: false },
      { id: 'employees', label: 'Employees', icon: '◎', live: false },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'weather', label: 'Weather', icon: '◌', live: false },
      { id: 'leaf', label: 'Leaf AI', icon: '✦', live: false },
    ]
  }
];

function Sidebar({ currentPage, setCurrentPage }) {
  return (
    <aside className="w-52 bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="text-sm font-semibold text-gray-900 tracking-tight">🌱 Farm OS</div>
        <div className="text-xs text-gray-400 mt-0.5">v1.0 · MVP</div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.label}>
            <div className="text-xs text-gray-400 px-2 mb-1 uppercase tracking-widest">{section.label}</div>
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                  currentPage === item.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </span>
                {item.live
                  ? <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">Live</span>
                  : <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">Soon</span>
                }
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-semibold text-emerald-700">FM</div>
          <div>
            <div className="text-xs font-medium text-gray-800">Farm Manager</div>
            <div className="text-[10px] text-gray-400">Karnataka</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;