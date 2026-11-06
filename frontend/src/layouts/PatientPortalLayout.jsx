
import { Outlet } from "react-router-dom";
import PortalSidebar from "../components/PortalSidebar";

export default function PatientPortalLayout() {
  return (
    <div className="min-h-screen bg-[#F7F9FB] flex">
      <PortalSidebar />

      <main className="flex-1 min-w-0 pb-20 md:ml-64 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
