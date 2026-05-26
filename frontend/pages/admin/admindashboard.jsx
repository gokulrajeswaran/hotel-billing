import React from 'react';
import Topbar from './components/topbar'; // adjust path as needed

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="p-10">
        <h2 className="text-3xl font-black text-brand-primary uppercase">Overview</h2>
        <p className="text-gray-400 font-medium">Welcome to the central management system.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;