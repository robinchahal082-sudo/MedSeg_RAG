import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import PortalSidebar from "../components/PortalSidebar";
import { apiRequest, logout } from "../services/api";

export default function PatientPortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const requiredRole = location.pathname.startsWith("/doctor") ? "doctor" : "patient";
  const [requestNumber, setRequestNumber] = useState(0);
  const [profileResult, setProfileResult] = useState(null);
  const loading =
    profileResult?.attempt !== requestNumber ||
    profileResult?.requiredRole !== requiredRole;

  useEffect(() => {
    let active = true;

    if (!sessionStorage.getItem("access_token")) {
      navigate("/login", { replace: true });
      return () => {
        active = false;
      };
    }

    apiRequest("/me")
      .then((profile) => {
        if (!active) return;

        if (profile.role !== "patient" && profile.role !== "doctor") {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (profile.role !== requiredRole) {
          navigate(`/${profile.role}/dashboard`, { replace: true });
          return;
        }

        setProfileResult({ attempt: requestNumber, requiredRole, user: profile, error: "" });
      })
      .catch((requestError) => {
        if (!active) return;
        setProfileResult({
          attempt: requestNumber,
          requiredRole,
          user: null,
          error: requestError.message || "Unable to verify your session.",
        });
      })

    return () => {
      active = false;
    };
  }, [navigate, requiredRole, requestNumber]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F8FA]">
        <div className="flex items-center gap-3 text-sm font-semibold text-teal-800">
          <LoaderCircle className="animate-spin" size={20} />
          Verifying your secure workspace…
        </div>
      </div>
    );
  }

  if (profileResult?.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F8FA] p-5">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <AlertCircle className="mx-auto text-rose-600" size={28} />
          <h1 className="mt-4 text-lg font-bold text-[#142B45]">Workspace unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{profileResult.error}</p>
          <button
            type="button"
            onClick={() => setRequestNumber((previous) => previous + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <RefreshCw size={16} />
            Try again
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="ml-3 mt-5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Sign in again
          </button>
        </section>
      </div>
    );
  }

  const user = profileResult?.user;
  if (!user || user.role !== requiredRole) return null;

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      <PortalSidebar role={requiredRole} user={user} />
      <main className="min-w-0 pb-20 md:ml-64 md:pb-0">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
