import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from "lucide-react"; // icons

function TopPanel() {
  const navigate = useNavigate();

  return (
    <div className="bg-white/80 backdrop-blur-md fixed top-0 inset-x-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          
          {/* Left: Logo / Brand */}
          <div 
            className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition"
            onClick={() => navigate("/dashboard")}
          >
            🚀 MyDashboard
          </div>
          
          {/* Right: User Actions */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm hidden sm:block">
              Hi, here is top panel
            </span>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopPanel;
