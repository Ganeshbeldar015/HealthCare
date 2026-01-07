import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  ClipboardDocumentIcon,
  CalendarDaysIcon,
  BellIcon,
} from "@heroicons/react/24/outline";

function DoctorSidebar() {
  const links = [
    { to: "/doctor-dashboard", label: "Dashboard", icon: HomeIcon },
    { to: "/doctor-appointments", label: "Appointments", icon: CalendarDaysIcon },
    { to: "/doctor/prescription/new", label: "Prescriptions", icon: ClipboardDocumentIcon },
    { to: "/notifications", label: "Notifications", icon: BellIcon },
    { to: "/doctor/prescriptions", label: "Past Prescriptions", icon: ClipboardDocumentIcon },

  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-5">
      <h2 className="text-xl font-bold text-emerald-600 mb-8">
        Doctor Panel
      </h2>

      <nav className="space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
              ${isActive
                ? "bg-emerald-100 text-emerald-700"
                : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default DoctorSidebar;
