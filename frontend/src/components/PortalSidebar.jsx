
import {
  Activity,
  LayoutDashboard,
  FileText,
  Upload,
  MessageCircle,
  User,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../services/api";

export default function PortalSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/patient/dashboard",
    },
    {
      label: "My Documents",
      icon: FileText,
      path: "/patient/documents",
    },
    {
      label: "Upload Reports",
      icon: Upload,
      path: "/patient/documents/upload",
    },
    {
      label: "AI Assistant",
      icon: MessageCircle,
      path: "/patient/assistant",
    },
    {
      label: "My Profile",
      icon: User,
      path: "/patient/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/patient/settings",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-64 bg-[#142B45] text-white flex-col p-5">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="bg-teal-600 p-2 rounded-xl">
          <Activity size={24} />
        </div>

        <span className="font-bold text-xl">
          MedSeg<span className="text-teal-400">-RAG</span>
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider">
        Patient Workspace
      </p>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-teal-700"
                  : "hover:bg-slate-700"
              }`}
            >
              <Icon size={19} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Privacy */}
      <div className="mt-auto">
        <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
          <ShieldCheck className="text-teal-400 mb-2" size={23} />

          <p className="text-sm font-semibold">
            Your Privacy Matters
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Your medical records are private.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 p-3 hover:bg-red-600 rounded-lg text-slate-200"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}
