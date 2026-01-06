import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

function BackToWelcome({ className = "" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition ${className}`}
      title="Back to Welcome"
    >
      <ArrowLeftIcon className="h-5 w-5" />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
}

export default BackToWelcome;
