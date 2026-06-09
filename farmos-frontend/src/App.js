import React from 'react';
import FarmsPage from './pages/FarmsPage';

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* navbar */}
            <nav className="bg-green-700 text-white px-6 py-4">
                <h1 className="text-xl font-bold">🌱 Farm OS</h1>
            </nav>

            {/* main content */}
            <main className="max-w-6xl mx-auto mt-6">
                <FarmsPage />
            </main>
        </div>
    );
}

export default App;