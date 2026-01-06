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
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
    ${
      isActive
        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
    }`;

  return (
    <aside className="w-64 min-h-screen bg-white/70 backdrop-blur-xl border-r border-slate-200 px-4 py-6">

      {/* BRAND */}
      {/* <div className="mb-10 px-2">
        <h1 className="text-xl font-black text-emerald-700 tracking-tight">
          🏥 HealthCare
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Smart Management Platform
        </p>
      </div> */}

      {/* MENU */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-slate-400 px-2 mb-3">
          Menu
        </p>

        <nav className="space-y-2">
          <NavLink to="/dashboard" className={linkClass}>
            <HomeIcon className="w-5 h-5" />
            Dashboard
          </NavLink>

          <NavLink to="/profile" className={linkClass}>
            <UserIcon className="w-5 h-5" />
            Profile
          </NavLink>
        </nav>
      </div>

      {/* MANAGE */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-slate-400 px-2 mb-3">
          Manage
        </p>

        <nav className="space-y-2">
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
        </nav>
      </div>

      {/* SYSTEM */}
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400 px-2 mb-3">
          System
        </p>

        <NavLink to="/notifications" className={linkClass}>
          <BellIcon className="w-5 h-5" />
          Notifications
        </NavLink>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-6 left-4 right-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} HealthCare
      </div>
    </aside>
  );
}

export default Sidebar;
