import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import FarmsPage from './pages/FarmsPage';
import PlotsPage from './pages/PlotsPage';
import CropsPage from './pages/CropsPage';
import InventoryPage from './pages/InventoryPage';
import EmployeesPage from './pages/EmployeesPage';
import WeatherPage from './pages/WeatherPage';
import LeafDetectionPage from './pages/LeafDetectionPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':  return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'farms':      return <FarmsPage />;
      case 'plots':      return <PlotsPage />;
      case 'crops':      return <CropsPage />;
      case 'inventory':  return <InventoryPage />;
      case 'employees':  return <EmployeesPage />;
      case 'weather':    return <WeatherPage />;
      case 'leaf':       return <LeafDetectionPage />;
      default:           return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar currentPage={currentPage} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;