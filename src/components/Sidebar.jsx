import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UserIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  CreditCardIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

function Sidebar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
      isActive
        ? "bg-purple-100 text-purple-700 font-medium"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <aside className="w-64 bg-white border-r min-h-screen px-3 py-6">
      <h1 className="text-lg font-bold text-purple-600 mb-8 px-4">
        🚀 HealthCare
      </h1>

      {/* MENU */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 px-4 mb-2">MENU</p>
        <NavLink to="/dashboard" className={linkClass}>
          <HomeIcon className="w-5 h-5" />
          Dashboard
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <UserIcon className="w-5 h-5" />
          Profile
        </NavLink>
      </div>

      {/* MANAGE */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 px-4 mb-2">MANAGE</p>
        <NavLink to="/appointments" className={linkClass}>
          <CalendarDaysIcon className="w-5 h-5" />
          Appointments
        </NavLink>
        <NavLink to="/records" className={linkClass}>
          <ClipboardDocumentListIcon className="w-5 h-5" />
          Records
        </NavLink>
        <NavLink to="/prescription" className={linkClass}>
          <PencilSquareIcon className="w-5 h-5" />
          Prescription
        </NavLink>
        <NavLink to="/billing" className={linkClass}>
          <CreditCardIcon className="w-5 h-5" />
          Billing
        </NavLink>
      </div>

      {/* SYSTEM */}
      <div>
        <p className="text-xs text-gray-400 px-4 mb-2">SYSTEM</p>
        <NavLink to="/notifications" className={linkClass}>
          <BellIcon className="w-5 h-5" />
          Notifications
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
