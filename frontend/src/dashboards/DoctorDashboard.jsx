
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  LayoutDashboard,
  Users,
  FileText,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Bell,
  HeartPulse,
  CalendarDays,
  ShieldCheck,
  Clock,
  FileCheck2,
} from "lucide-react";

import { apiRequest, logout } from "../services/api";

const demoPatients = [
  { name: "Jordan Lee", initials: "JL", access: "Records shared", records: 4 },
  { name: "Casey Morgan", initials: "CM", access: "Records shared", records: 3 },
  { name: "Taylor Brooks", initials: "TB", access: "Records shared", records: 5 },
];

const demoRecords = [
  { title: "Complete blood count", patient: "Jordan Lee", date: "Nov 04, 2026", type: "Lab report" },
  { title: "Annual check-up summary", patient: "Casey Morgan", date: "Oct 28, 2026", type: "Visit summary" },
  { title: "Metabolic panel", patient: "Taylor Brooks", date: "Oct 22, 2026", type: "Lab report" },
];

const demoAppointments = [
  { patient: "Jordan Lee", visit: "Follow-up consultation", date: "Nov 12", time: "10:30 AM" },
  { patient: "Casey Morgan", visit: "Routine check-up", date: "Nov 13", time: "2:00 PM" },
  { patient: "Taylor Brooks", visit: "Review visit", date: "Nov 16", time: "9:15 AM" },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] =
    useState("pending");

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    apiRequest("/doctor/dashboard")
      .then((result) => {
        const savedUser = sessionStorage.getItem("user");

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        if (result.verification_status) {
          setVerificationStatus(result.verification_status);
        }
      })
      .catch(() => {
        logout();
        navigate("/login", { replace: true });
      })
      .finally(() => {
        setLoading(false);
      });

  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <p className="text-teal-700 font-semibold">
          Loading Doctor Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-40 hidden md:flex h-screen w-64 overflow-y-auto overscroll-contain bg-[#142B45] text-white flex-col p-5">

        <div className="flex items-center gap-2 mb-10">
          <div className="bg-teal-600 p-2 rounded-xl">
            <Activity size={24}/>
          </div>

          <span className="font-bold text-xl">
            MedSeg<span className="text-teal-400">-RAG</span>
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider">
          Doctor Workspace
        </p>

        <nav className="space-y-2 flex-1">

          <a
            href="#overview"
            className="flex items-center gap-3 bg-teal-700 p-3 rounded-lg"
          >
            <LayoutDashboard size={19}/>
            Dashboard
          </a>

          <a
            href="#patients"
            className="flex items-center gap-3 hover:bg-slate-700 p-3 rounded-lg"
          >
            <Users size={19}/>
            My Patients
          </a>

          <a
            href="#records"
            className="flex items-center gap-3 hover:bg-slate-700 p-3 rounded-lg"
          >
            <FileText size={19}/>
            Medical Records
          </a>

          <a
            href="#assistant"
            className="flex items-center gap-3 hover:bg-slate-700 p-3 rounded-lg"
          >
            <MessageCircle size={19}/>
            AI Assistant
          </a>

          <a
            href="#profile"
            className="flex items-center gap-3 hover:bg-slate-700 p-3 rounded-lg"
          >
            <User size={19}/>
            My Profile
          </a>

          <a
            href="#settings"
            className="flex items-center gap-3 hover:bg-slate-700 p-3 rounded-lg"
          >
            <Settings size={19}/>
            Settings
          </a>

        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 hover:bg-red-600 rounded-lg text-slate-200"
        >
          <LogOut size={19}/>
          Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 pb-20 md:ml-64 md:pb-0">

        {/* TOP NAVBAR */}
        <header className="bg-white border-b px-5 md:px-8 py-4 flex justify-between items-center">

          <div>
            <h2 className="text-xl font-bold text-[#142B45]">
              Doctor Dashboard
            </h2>

            <p className="text-xs text-slate-500">
              Your professional healthcare workspace
            </p>
          </div>

          <div className="flex items-center gap-4">

            <button className="text-slate-500">
              <Bell size={21}/>
            </button>

            <div className="bg-teal-100 text-teal-800 w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() || "D"}
            </div>

          </div>

        </header>

        {/* DASHBOARD BODY */}
        <div className="p-5 md:p-8" id="overview">

          {/* WELCOME */}
          <div className="mb-7">
            <h1 className="text-2xl md:text-3xl font-bold text-[#142B45]">
              Welcome, Dr. {user?.full_name || "Doctor"}!
            </h1>

            <p className="text-slate-500 mt-2">
              Manage your authorized patients and review their medical information.
            </p>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
            <ShieldCheck className="mt-0.5 shrink-0 text-indigo-600" size={19} />
            <p>
              <span className="font-semibold">Demo data:</span> The sample patients,
              records, appointments, and counts below are fictional and are not
              connected to real patient accounts.
            </p>
          </div>

          {/* VERIFICATION STATUS */}
          <div className="bg-white border rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div className="flex items-start gap-3">

              <div className="bg-teal-50 p-3 rounded-xl">
                <ShieldCheck className="text-teal-700" size={25}/>
              </div>

              <div>
                <h3 className="font-bold text-[#142B45]">
                  Professional Verification
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Your medical registration details are subject to administrator verification.
                </p>
              </div>

            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize w-fit ${
                verificationStatus === "verified"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {verificationStatus}
            </span>

          </div>

          {/* STATISTICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

            <StatCard
              icon={<Users/>}
              title="Total Patients"
              value="3"
              description="Sample patients"
            />

            <StatCard
              icon={<FileText/>}
              title="Medical Records"
              value="12"
              description="Sample documents"
            />

            <StatCard
              icon={<MessageCircle/>}
              title="AI Conversations"
              value="8"
              description="Sample interactions"
            />

            <StatCard
              icon={<CalendarDays/>}
              title="Appointments"
              value="3"
              description="Sample appointments"
            />

          </div>

          {/* QUICK ACTIONS */}
          <div className="mb-8">

            <h2 className="text-lg font-bold text-[#142B45] mb-4">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

              <QuickAction
                icon={<Users/>}
                title="View Patients"
                description="View patients who have authorized access."
                target="patients"
              />

              <QuickAction
                icon={<FileText/>}
                title="Medical Records"
                description="Review permitted medical documents."
                target="records"
              />

              <QuickAction
                icon={<MessageCircle/>}
                title="AI Assistant"
                description="Explore document-based AI assistance."
                target="assistant"
              />

            </div>

          </div>

          {/* PATIENT SECTION */}
          <div
            id="patients"
            className="bg-white border rounded-2xl p-6 mb-8"
          >

            <div className="flex justify-between items-center mb-5">

              <div>
                <h2 className="text-lg font-bold text-[#142B45]">
                  My Patients
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Patients who have authorized you to access their records.
                </p>
              </div>

              <Users className="text-teal-700"/>

            </div>

            <div className="divide-y divide-slate-100">
              {demoPatients.map((patient) => (
                <div key={patient.name} className="flex items-center gap-3 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
                    {patient.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{patient.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{patient.access}</p>
                  </div>
                  <span className="text-xs text-slate-500">{patient.records} sample records</span>
                  <span className="hidden rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 sm:inline">Demo</span>
                </div>
              ))}
            </div>

          </div>

          {/* MEDICAL RECORDS */}
          <div
            id="records"
            className="bg-white border rounded-2xl p-6 mb-8"
          >

            <div className="flex justify-between items-center mb-5">

              <div>
                <h2 className="text-lg font-bold text-[#142B45]">
                  Recent Medical Records
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Review medical records shared with you.
                </p>
              </div>

              <FileText className="text-teal-700"/>

            </div>

            <div className="divide-y divide-slate-100">
              {demoRecords.map((record) => (
                <div key={record.title} className="flex items-center gap-3 py-4">
                  <div className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
                    <FileCheck2 size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{record.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{record.patient} · {record.type}</p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">{record.date}</span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">Demo</span>
                </div>
              ))}
            </div>

          </div>

          <section className="mb-8 rounded-2xl border bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#142B45]">Upcoming appointments</h2>
                <p className="mt-1 text-sm text-slate-500">Example schedule for dashboard preview</p>
              </div>
              <CalendarDays className="shrink-0 text-teal-700" />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {demoAppointments.map((appointment) => (
                <article key={`${appointment.patient}-${appointment.date}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">{appointment.patient}</span>
                    <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">Demo</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{appointment.visit}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-teal-800">
                    <Clock size={14} /> {appointment.date} · {appointment.time}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* AI ASSISTANT */}
          <div
            id="assistant"
            className="bg-teal-50 border border-teal-100 rounded-2xl p-6 mb-8"
          >

            <div className="flex gap-4 items-start">

              <div className="bg-white p-3 rounded-xl">
                <HeartPulse className="text-teal-700" size={28}/>
              </div>

              <div>
                <h3 className="font-bold text-[#142B45]">
                  MedSeg-RAG AI Assistant
                </h3>

                <p className="text-sm text-slate-600 mt-2">
                  Example interaction preview. The assistant is not connected to patient records yet.
                </p>
                <div className="mt-4 space-y-3">
                  <p className="ml-auto w-fit max-w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
                    Summarize the sample lab report.
                  </p>
                  <p className="w-fit max-w-full rounded-xl border border-teal-100 bg-white/70 px-4 py-3 text-sm leading-6 text-slate-600">
                    This example report contains routine measurements. A connected
                    assistant could provide a source reference for the relevant document.
                  </p>
                  <span className="inline-block rounded-lg bg-white px-3 py-2 text-xs font-semibold text-teal-700">
                    Fictional preview · Not medical advice
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* PRIVACY */}
          <div className="bg-white border rounded-2xl p-5 flex gap-4 items-start">

            <ShieldCheck className="text-teal-700 shrink-0" size={28}/>

            <div>
              <h3 className="font-bold text-[#142B45]">
                Patient Privacy and Security
              </h3>

              <p className="text-sm text-slate-600 mt-1">
                Patient medical information must only be accessed with appropriate authorization and legitimate permissions.
              </p>
            </div>

          </div>

        </div>

      </main>

      <nav className="portal-mobile-nav" aria-label="Doctor navigation">
        <button type="button" onClick={() => scrollToSection("overview")}>
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>
        <button type="button" onClick={() => scrollToSection("patients")}>
          <Users size={19} />
          <span>Patients</span>
        </button>
        <button type="button" onClick={() => scrollToSection("records")}>
          <FileText size={19} />
          <span>Records</span>
        </button>
        <button type="button" onClick={() => scrollToSection("assistant")}>
          <MessageCircle size={19} />
          <span>Assistant</span>
        </button>
        <button type="button" onClick={handleLogout}>
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </nav>

    </div>
  );
}


// STATISTICS CARD
function StatCard({ icon, title, value, description }) {
  return (
    <div className="bg-white p-5 rounded-2xl border hover:shadow-md transition">

      <div className="bg-teal-50 text-teal-700 w-11 h-11 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h3 className="text-2xl font-bold text-[#142B45] mt-1">
        {value}
      </h3>

      <p className="text-xs text-slate-400 mt-2">
        {description}
      </p>

    </div>
  );
}


// QUICK ACTION CARD
function QuickAction({ icon, title, description, target }) {
  return (
    <a
      href={`#${target}`}
      className="bg-white p-5 rounded-2xl border hover:border-teal-500 hover:shadow-md transition"
    >

      <div className="text-teal-700 mb-3">
        {icon}
      </div>

      <h3 className="font-bold text-[#142B45]">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2">
        {description}
      </p>

    </a>
  );
}
