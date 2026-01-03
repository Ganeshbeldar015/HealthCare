
import React from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center text-center cursor-pointer"
      onClick={() => navigate("/login")}
    >
      <span className="text-xl font-semibold">Hi team, let’s start building together</span>
      <span className="text-gray-600 mt-2">Click anywhere to continue</span>
    </div>

  );
}

export default Welcome;



