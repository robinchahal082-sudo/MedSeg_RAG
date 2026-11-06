
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  MessageCircle,
  Bell,
  HeartPulse,
  ShieldCheck,
  CalendarDays,
  Clock,
} from "lucide-react";

import { apiRequest, logout } from "../services/api";

const demoDocuments = [
  { name: "Complete blood count", category: "Lab report", date: "Nov 04, 2026" },
  { name: "Annual check-up summary", category: "Visit summary", date: "Oct 28, 2026" },
  { name: "Prescription — Sample", category: "Prescription", date: "Oct 19, 2026" },
];

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    apiRequest("/patient/dashboard")
      .then(() => {
        const savedUser = sessionStorage.getItem("user");

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      })
      .catch(() => {
        logout();
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]">
        <p className="text-teal-700 font-semibold">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB]">

    

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0">

        {/* TOP NAVBAR */}
        <header className="bg-white border-b px-5 md:px-8 py-4 flex justify-between items-center">

          <div>
            <h2 className="text-xl font-bold text-[#142B45]">
              Patient Dashboard
            </h2>

            <p className="text-xs text-slate-500">
              Your personal healthcare workspace
            </p>
          </div>

          <div className="flex items-center gap-4">

            <button className="text-slate-500">
              <Bell size={21} />
            </button>

            <div className="bg-teal-100 text-teal-800 w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() || "P"}
            </div>

          </div>

        </header>

        {/* DASHBOARD BODY */}
        <div className="p-5 md:p-8" id="overview">

          {/* WELCOME SECTION */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#142B45]">
              Welcome, {user?.full_name || "Patient"}!
            </h1>

            <p className="text-slate-500 mt-2">
              Manage your medical records and access your AI-powered healthcare assistant.
            </p>
          </div>

          <div className="mb-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
            <ShieldCheck className="mt-0.5 shrink-0 text-indigo-600" size={19} />
            <p>
              <span className="font-semibold">Demo data:</span> The sample documents
              and activity below are fictional and are not saved to your account.
            </p>
          </div>

          {/* STATISTICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            <StatCard
              icon={<FileText />}
              title="Total Documents"
              value="8"
              description="Sample documents"
            />

            <StatCard
              icon={<Upload />}
              title="Recent Uploads"
              value="2"
              description="Sample uploads this month"
            />

            <StatCard
              icon={<MessageCircle />}
              title="AI Conversations"
              value="6"
              description="Sample conversations"
            />

            <StatCard
              icon={<HeartPulse />}
              title="Health Records"
              value="4"
              description="Sample health categories"
            />

          </div>

          {/* QUICK ACTIONS */}
          <div className="mb-8">

            <h2 className="text-lg font-bold text-[#142B45] mb-4">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              <QuickAction
                icon={<Upload />}
                title="Upload Medical Report"
                description="Add prescriptions, lab reports and medical PDFs."
                onClick={() => navigate("/patient/documents/upload")}
              />

              <QuickAction
                icon={<MessageCircle />}
                title="Ask AI Assistant"
                description="Ask questions about your uploaded medical documents."
                onClick={() => document.getElementById("assistant")?.scrollIntoView({ behavior: "smooth" })}
              />

              <QuickAction
                icon={<FileText />}
                title="View My Documents"
                description="Access and organize your medical records."
                onClick={() => navigate("/patient/documents/upload")}
              />

            </div>

          </div>

          <section className="mb-8 rounded-2xl border bg-white p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#142B45]">Recent documents</h2>
                <p className="mt-1 text-sm text-slate-500">Example files in your sample library</p>
              </div>
              <FileText className="shrink-0 text-teal-700" size={21} />
            </div>

            <div className="divide-y divide-slate-100">
              {demoDocuments.map((document) => (
                <div key={document.name} className="flex items-center gap-3 py-3">
                  <div className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
                    <FileText size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{document.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{document.category}</p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">{document.date}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8 flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sample upcoming visit</p>
              <h2 className="mt-1 font-bold text-[#142B45]">General wellness check</h2>
              <p className="mt-1 text-sm text-slate-500">Thursday, November 12 · 10:30 AM</p>
            </div>
            <span className="ml-auto rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">Demo</span>
          </section>

          {/* AI ASSISTANT DEMO */}
          <div
            id="assistant"
            className="bg-white border rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="bg-teal-50 p-3 rounded-xl text-teal-700">
                <MessageCircle size={24} />
              </div>

              <div>
                <h2 className="font-bold text-[#142B45]">
                  AI Assistant preview
                </h2>
                <p className="text-sm text-slate-500">
                  Example of a document-grounded conversation
                </p>
              </div>
            </div>

            <div className="mt-5 max-w-2xl space-y-3">
              <div className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-teal-700 px-4 py-3 text-sm text-white">
                What does my sample blood test report include?
              </div>
              <div className="w-fit max-w-[95%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
                This demo report includes example blood count measurements.
                In a live experience, answers would reference the relevant
                document. This sample is not medical advice.
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1"><FileText size={14} /> Sample source: Complete blood count</span>
                <span className="inline-flex items-center gap-1"><Clock size={14} /> Example only</span>
              </div>
            </div>
          </div>

          {/* PRIVACY SECTION */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex gap-4 items-start">

            <ShieldCheck className="text-teal-700 shrink-0" size={28} />

            <div>
              <h3 className="font-bold text-[#142B45]">
                Your Privacy Matters
              </h3>

              <p className="text-sm text-slate-600 mt-1">
                Your medical documents are intended to remain private and accessible only to authorized users.
              </p>
            </div>

          </div>

        </div>

      </main>

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
function QuickAction({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white p-5 rounded-2xl border hover:border-teal-500 hover:shadow-md transition"
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

    </button>
  );
}
