import React, { useState, useEffect } from 'react';
import api from '../services/api';

function FarmsPage() {
    const [farms, setFarms] = useState([]);
    const [name, setName] = useState('');
    const [acres, setAcres] = useState('');
    const [location, setLocation] = useState('');
    const [showForm, setShowForm] = useState(false);

    // fetch farms when page loads
    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = () => {
        api.get('/farms')
            .then(response => setFarms(response.data))
            .catch(error => console.error('Error:', error));
    };

    // called when farmer clicks "Create Farm"
    const handleCreateFarm = () => {
        // basic validation
        if (!name || !acres || !location) {
            alert('Please fill all fields');
            return;
        }

        api.post('/farms', {
            name: name,
            acres: parseFloat(acres),
            location: location
        })
        .then(response => {
            fetchFarms();       // refresh the list
            setName('');        // clear the form
            setAcres('');
            setLocation('');
            setShowForm(false); // hide the form
        })
        .catch(error => console.error('Error:', error));
    };

    return (
        <div className="p-6">

            {/* header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-700">My Farms</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + Add Farm
                </button>
            </div>

            {/* add farm form - only shows when showForm is true */}
            {showForm && (
                <div className="bg-gray-50 border rounded p-4 mb-6">
                    <h3 className="font-semibold mb-3">New Farm</h3>
                    <input
                        type="text"
                        placeholder="Farm name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="border rounded px-3 py-2 w-full mb-2"
                    />
                    <input
                        type="number"
                        placeholder="Total acres"
                        value={acres}
                        onChange={e => setAcres(e.target.value)}
                        className="border rounded px-3 py-2 w-full mb-2"
                    />
                    <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="border rounded px-3 py-2 w-full mb-3"
                    />
                    <button
                        onClick={handleCreateFarm}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Create Farm
                    </button>
                </div>
            )}

            {/* farms list */}
            {farms.length === 0 ? (
                <p className="text-gray-500">No farms yet. Add your first farm!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {farms.map(farm => (
                        <div key={farm.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md">
                            <h3 className="text-lg font-semibold text-green-700">{farm.name}</h3>
                            <p className="text-gray-600 mt-1">📍 {farm.location}</p>
                            <p className="text-gray-600">🌾 {farm.acres} acres</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FarmsPage;