import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiHome, HiChevronDown, HiOutlineLogout } from 'react-icons/hi'; // Importing icons
import { MdOutlineFastfood, MdCategory, MdLayers, MdDateRange, MdFastfood, MdReceipt, MdBook } from 'react-icons/md'; // Icons for dropdown
import { confirmDelete } from '../../../../frontend/components/alert';

const Topbar = () => {
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const isConfirmed = await confirmDelete(
      "Sign Out?",
      "Are you sure you want to log out of the admin panel?"
    );

    if (isConfirmed) {
      localStorage.removeItem('adminToken');
      toast.success('Logged Out Successfully');
      navigate('/');
    }
  };

  return (
    <nav className="bg-brand-primary text-brand-white shadow-lg w-full border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Left Section */}
          <div className="flex items-center gap-6">

            {/* Home Icon Link */}
            <Link
              to="/admin/dashboard"
              className="p-2 hover:bg-white/10 rounded-sm transition-colors cursor-pointer group"
              title="Dashboard Home"
            >
              <HiHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>

            <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em]">

              {/* Master Information Dropdown */}
              <div
                className="relative h-16 flex items-center"
                onMouseEnter={() => setIsMasterOpen(true)}
                onMouseLeave={() => setIsMasterOpen(false)}
              >
                <button className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-colors uppercase">
                  Master Information
                  <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMasterOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isMasterOpen && (
                  <div className="absolute top-16 left-0 w-60 bg-brand-white text-brand-primary shadow-2xl rounded-sm py-2 z-50 border-t-2 border-brand-primary animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link to="/admin/manage-food" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors font-bold text-[10px]">
                      <MdOutlineFastfood className="text-lg" /> Manage Food Items
                    </Link>
                    <Link to="/admin/manage-category" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors font-bold text-[10px]">
                      <MdCategory className="text-lg" /> Manage Category
                    </Link>
                    <Link to="/admin/manage-variety" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors font-bold text-[10px]">
                      <MdLayers className="text-lg" /> Manage Variety
                    </Link>
                  </div>
                )}
              </div>

              <button className="hover:text-gray-300 transition-colors cursor-pointer uppercase">Transactions</button>

              {/* Reports Dropdown */}
              <div
                className="relative h-16 flex items-center"
                onMouseEnter={() => setIsReportOpen(true)}
                onMouseLeave={() => setIsReportOpen(false)}
              >
                <button className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-colors uppercase">
                  Reports
                  <HiChevronDown className={`w-4 h-4 transition-transform duration-300 ${isReportOpen ? 'rotate-180' : ''}`} />
                </button>

                {isReportOpen && (
                  <div className="absolute top-16 left-0 w-64 bg-brand-white text-brand-primary shadow-2xl rounded-sm py-2 z-50 border-t-2 border-brand-primary animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link to="/admin/reports/datewise-collection" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors font-bold text-[10px]">
                      <MdDateRange className="text-lg" /> Date Wise Collection Summary
                    </Link>
                    <Link to="/admin/reports/foodwise-collection" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors font-bold text-[10px]">
                      <MdFastfood className="text-lg" /> Food Wise Collection Summary
                    </Link>
                    <Link to="/admin/reports/billwise-collection" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors font-bold text-[10px]">
                      <MdReceipt className="text-lg" /> Bill Wise Collection Summary
                    </Link>
                    <Link to="/admin/reports/daybook" className="flex items-center gap-3 px-5 py-3 hover:bg-gray-100 transition-colors font-bold text-[10px]">
                      <MdBook className="text-lg" /> Day Book
                    </Link>
                  </div>
                )}
              </div>

              <button className="hover:text-gray-300 transition-colors cursor-pointer uppercase">System</button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 cursor-pointer hover:bg-red-700 text-white text-[10px] font-black px-4 py-2 rounded-sm transition-all active:scale-95 uppercase tracking-wider"
            >
              <HiOutlineLogout className="text-sm" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;