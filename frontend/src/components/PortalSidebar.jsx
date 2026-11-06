import {
  Activity,
  ArrowUpRight,
  FileText,
  GitCompareArrows,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Upload,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/api";

const navigation = {
  patient: [
    { label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard, path: "/patient/dashboard" },
    { label: "My Documents", mobileLabel: "Documents", icon: FileText, path: "/patient/documents" },
    { label: "Upload Document", mobileLabel: "Upload", icon: Upload, path: "/patient/documents/upload" },
    { label: "AI Assistant (RAG)", mobileLabel: "Assistant", icon: MessageCircle, path: "/patient/assistant" },
    { label: "Compare Reports", mobileLabel: "Compare", icon: GitCompareArrows, path: "/patient/compare" },
    { label: "Profile", mobileLabel: "Profile", icon: UserRound, path: "/patient/profile" },
  ],
  doctor: [
    { label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard, path: "/doctor/dashboard" },
    { label: "My Patients", mobileLabel: "Patients", icon: UsersRound, path: "/doctor/patients" },
    { label: "Patient Documents", mobileLabel: "Documents", icon: FileText, path: "/doctor/documents" },
    { label: "AI Assistant (RAG)", mobileLabel: "Assistant", icon: MessageCircle, path: "/doctor/assistant" },
    { label: "Report Comparison", mobileLabel: "Compare", icon: GitCompareArrows, path: "/doctor/compare" },
    { label: "Profile", mobileLabel: "Profile", icon: UserRound, path: "/doctor/profile" },
  ],
};

export default function PortalSidebar({ role, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = navigation[role] ?? navigation.patient;
  const shortName = user?.full_name?.trim().split(/\s+/)[0] || (role === "doctor" ? "Doctor" : "Patient");
  const initials = user?.full_name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || (role === "doctor" ? "DR" : "PT");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const renderLink = (item, mobile = false) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;

    return (
      <button
        key={item.path}
        type="button"
        onClick={() => navigate(item.path)}
        aria-current={active ? "page" : undefined}
        aria-label={mobile ? item.mobileLabel : undefined}
        className={`flex w-full items-center rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 ${
          mobile
            ? `min-h-12 flex-col justify-center gap-1 px-1 text-[10px] font-medium ${active ? "text-teal-700" : "text-slate-500"}`
            : `gap-3 px-3 py-2.5 text-sm font-medium ${active ? "bg-teal-700 text-white shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`
        }`}
      >
        <Icon size={mobile ? 19 : 18} strokeWidth={1.9} />
        <span className={mobile ? "truncate" : "text-left"}>{mobile ? item.mobileLabel : item.label}</span>
      </button>
    );
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto overscroll-contain bg-[#10263E] p-5 text-white md:flex">
        <button
          type="button"
          onClick={() => navigate(`/${role}/dashboard`)}
          className="mb-9 flex items-center gap-3 rounded-lg text-left"
          aria-label="MedSeg-RAG dashboard"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-950/20">
            <Activity size={21} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            MedSeg<span className="text-teal-400">-RAG</span>
          </span>
        </button>

        <div className="mb-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700/70 text-sm font-bold text-teal-50">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{shortName}</span>
            <span className="mt-0.5 block text-xs capitalize text-slate-400">{role} workspace</span>
          </span>
          <button
            type="button"
            onClick={() => navigate(`/${role}/profile`)}
            aria-label="View profile"
            className="rounded-md p-1 text-slate-400 hover:text-white"
          >
            <ArrowUpRight size={15} />
          </button>
        </div>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Workspace
        </p>
        <nav className="flex-1 space-y-1" aria-label={`${role} navigation`}>
          {items.map((item) => renderLink(item))}
        </nav>

        <div className="mb-4 rounded-xl border border-teal-900/70 bg-teal-950/40 p-3.5">
          <ShieldCheck className="mb-2 text-teal-400" size={19} />
          <p className="text-xs font-semibold text-slate-100">Privacy first</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Access is limited to your authenticated workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-rose-500/15 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <nav className="portal-mobile-nav md:hidden" aria-label={`${role} navigation`}>
        {items.map((item) => renderLink(item, true))}
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium text-slate-500 transition hover:text-rose-600"
        >
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </nav>
    </>
  );
}
