import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';


function Dashboard() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-2xl font-bold text-gray-800">
        Welcome to dashboard
      </div>
    </div>

  );
}

export default Dashboard;
