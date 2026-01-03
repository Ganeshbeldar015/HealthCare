import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UpdatePassword from './pages/UpdatePassword';


import TopPanel from './components/TopPanel';

function App() {
  const location = useLocation();
  const isWelcomePage = location.pathname === '/';

  return (
    <div className="relative min-h-screen bg-cover bg-center">
      {!isWelcomePage && <TopPanel />}
      <main className={isWelcomePage ? "p-0" : "p-4 min-h-[calc(100vh-64px)]"}>
        <div className={isWelcomePage ? "w-full" : "w-full max-w-7xl mx-auto"}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/update-password" element={<UpdatePassword />} />
          </Routes>
        </div>
      </main>

    </div>
  );
}

export default App;


