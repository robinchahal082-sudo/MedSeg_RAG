import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bot,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  FileCheck2,
  FileText,
  GitCompareArrows,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { apiRequest } from "../services/api";

const pageDetails = {
  patients: {
    title: "My patients",
    description: "Patients who have granted access to their records.",
  },
  documents: {
    title: "Patient documents",
    description: "Review records shared with your verified account.",
  },
  assistant: {
    title: "AI Assistant (RAG)",
    description: "Ask questions grounded in an authorized patient's documents.",
  },
  compare: {
    title: "Report comparison",
    description: "Compare previous and recent reports for an authorized patient.",
  },
  profile: {
    title: "Profile",
    description: "Your authenticated doctor account.",
  },
};

const unavailable = {
  patients: "The current backend does not expose a doctor-authorized patient list. No patient records are shown.",
  documents: "The current backend has no patient document endpoint or doctor-patient access model. No medical records can be displayed.",
  assistant: "There is no RAG query, summary, or patient-selection API in the current backend. No clinical content has been generated.",
  compare: "There is no report comparison endpoint or document history in the current backend.",
};

export default function DoctorDashboard() {
  const { user } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  const [requestResult, setRequestResult] = useState(null);
  const loading = requestResult?.attempt !== attempt;
  const error = loading ? "" : requestResult?.error;
  const section = location.pathname.split("/")[2] || "dashboard";

  useEffect(() => {
    let active = true;
    apiRequest("/doctor/dashboard")
      .then(() => {
        if (active) setRequestResult({ attempt, error: "" });
      })
      .catch((requestError) => {
        if (active) {
          setRequestResult({
            attempt,
            error: requestError.message || "Unable to load the doctor dashboard.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const fullName = user?.full_name?.trim() || "Doctor";

  if (loading) {
    return <LoadingState />;
  }

  if (!["dashboard", "patients", "documents", "assistant", "compare", "profile"].includes(section)) {
    return <LoadingState />;
  }

  if (section !== "dashboard") {
    return (
      <>
        <PageHeader title={pageDetails[section].title} subtitle={pageDetails[section].description} />
        <div className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-8">
          {error && <ErrorBanner message={error} onRetry={() => setAttempt((value) => value + 1)} />}
          {section === "profile" ? (
            <ProfileCard user={user} />
          ) : section === "assistant" ? (
            <AssistantUnavailable />
          ) : section === "compare" ? (
            <CompareUnavailable />
          ) : (
            <RecordsUnavailable section={section} />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Doctor dashboard" subtitle="Your professional healthcare workspace" />
      <div className="mx-auto max-w-7xl space-y-7 px-5 py-7 sm:px-8">
        {error && <ErrorBanner message={error} onRetry={() => setAttempt((value) => value + 1)} />}

        <section className="relative overflow-hidden rounded-3xl bg-[#10263E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[36px] border-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-teal-100">
                <Activity size={14} />
                Clinical workspace
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome, Dr. {fullName}!
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Your authorized patient records and document insights will appear here when the corresponding services are connected.
              </p>
            </div>
            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100">
              <ShieldCheck size={17} className="text-teal-300" />
              Role verified
            </div>
          </div>
        </section>

        <section aria-label="Account statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={UsersRound} title="Total patients" value="—" detail="Patient access API unavailable" />
          <MetricCard icon={FileText} title="Total documents" value="—" detail="Document API unavailable" />
          <MetricCard icon={Sparkles} title="AI summaries" value="—" detail="RAG service unavailable" />
          <MetricCard icon={GitCompareArrows} title="Comparisons" value="—" detail="Comparison data unavailable" />
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#142B45]">Recent patients</h2>
                <p className="mt-1 text-sm text-slate-500">Patients with active, authorized access</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/doctor/patients")}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                View all <ArrowRight size={15} />
              </button>
            </div>
            <EmptyState
              icon={UsersRound}
              title="No patient records available"
              description="Patient authorization and listing are not implemented by the current backend. No sample patients are shown."
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Bot size={20} />
              </span>
              <div>
                <h2 className="font-bold text-[#142B45]">Clinical AI assistant</h2>
                <p className="mt-1 text-xs text-slate-500">Patient-specific, cited answers</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              Summarize records, ask document-grounded questions, and compare reports.
            </p>
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-950">
              Patient access and RAG endpoints are not available. Clinical requests are disabled.
            </p>
          </section>
        </div>

        <section>
          <div className="mb-4">
            <h2 className="font-bold text-[#142B45]">Clinical tools</h2>
            <p className="mt-1 text-sm text-slate-500">Open your authorized workspace</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ActionCard icon={UsersRound} title="My patients" description="Review patient access and recent activity." onClick={() => navigate("/doctor/patients")} />
            <ActionCard icon={MessageCircle} title="AI Assistant (RAG)" description="Generate sourced answers and summaries." onClick={() => navigate("/doctor/assistant")} />
            <ActionCard icon={GitCompareArrows} title="Compare reports" description="Compare patient reports when history is available." onClick={() => navigate("/doctor/compare")} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <ChartNoAxesColumnIncreasing size={20} />
            </span>
            <div>
              <h2 className="font-bold text-[#142B45]">Document insights</h2>
              <p className="mt-1 text-sm text-slate-500">Breakdown by report category</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {["Lab reports", "Radiology", "Prescriptions", "Other documents"].map((category) => (
              <div key={category} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">{category}</p>
                <p className="mt-2 text-xl font-bold text-slate-400">—</p>
                <p className="mt-1 text-xs text-slate-400">No category data from API</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-xs leading-5 text-slate-500">
            The backend has no document records or category statistics, so a chart cannot be populated accurately.
          </p>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4 text-sm leading-6 text-teal-950">
          <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={19} />
          <p>
            Your doctor role is verified against the authenticated session. The current backend does not define patient authorization; patient data is never exposed by this dashboard.
          </p>
        </div>
      </div>
    </>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
      <div>
        <h1 className="text-lg font-bold text-[#142B45] sm:text-xl">{title}</h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{subtitle}</p>
      </div>
      <span className="hidden items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 sm:inline-flex">
        <ShieldCheck size={15} />
        Secure doctor workspace
      </span>
    </header>
  );
}

function MetricCard({ icon: Icon, title, value, detail }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#142B45]">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-9 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        <Icon size={21} />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-lg text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function RecordsUnavailable({ section }) {
  const patients = section === "patients";
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          {patients ? <UsersRound size={21} /> : <FileText size={21} />}
        </span>
        <div>
          <h2 className="font-bold text-[#142B45]">{patients ? "Authorized patients" : "Shared patient documents"}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{patients ? "Patient identity, access status, and recent activity." : "Documents shared by your authorized patients."}</p>
        </div>
      </div>
      <EmptyState
        icon={patients ? UsersRound : FileCheck2}
        title={patients ? "Patient list unavailable" : "No shared documents available"}
        description={unavailable[section]}
      />
    </section>
  );
}

function AssistantUnavailable() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><Bot size={21} /></span>
        <div>
          <h2 className="font-bold text-[#142B45]">Ask about an authorized patient's records</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Questions and summaries should cite their source document and page.</p>
        </div>
      </div>
      <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <CircleHelp className="mt-0.5 shrink-0" size={18} />
        <p>{unavailable.assistant}</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <select disabled aria-label="Select a patient" className="min-h-11 rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500">
          <option>No authorized patients available</option>
        </select>
        <button disabled className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-300 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed">
          <Sparkles size={16} /> Generate summary
        </button>
      </div>
      <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
        <input disabled aria-label="Ask the AI assistant" placeholder="Ask a question about a patient's reports" className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 disabled:cursor-not-allowed" />
        <button disabled type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-300 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed">
          <MessageCircle size={16} /> Send
        </button>
      </form>
    </section>
  );
}

function CompareUnavailable() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><GitCompareArrows size={21} /></span>
        <div>
          <h2 className="font-bold text-[#142B45]">Compare patient reports</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Select an authorized patient and two reports to compare.</p>
        </div>
      </div>
      <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{unavailable.compare}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {["Previous report", "Recent report"].map((label) => (
          <div key={label} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-400">{label} <span className="ml-1 text-xs">(unavailable)</span></div>
        ))}
      </div>
      <button disabled className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-300 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed">
        <GitCompareArrows size={16} /> Compare reports
      </button>
    </section>
  );
}

function ProfileCard({ user }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-lg font-bold text-teal-800">
          {user?.full_name?.trim().slice(0, 1).toUpperCase() || "D"}
        </span>
        <div>
          <h2 className="font-bold text-[#142B45]">Dr. {user?.full_name}</h2>
          <p className="mt-1 text-sm capitalize text-slate-500">{user?.role} account</p>
        </div>
      </div>
      <dl className="grid gap-5 pt-5 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email address</dt><dd className="mt-1 text-sm font-medium text-slate-700">{user?.email || "Not provided"}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Doctor ID</dt><dd className="mt-1 text-sm font-medium text-slate-700">{user?.id ?? "Not provided"}</dd></div>
      </dl>
    </section>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between">
      <p>{message}</p>
      <button type="button" onClick={onRetry} className="shrink-0 font-semibold underline underline-offset-2">Retry</button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm font-semibold text-teal-800">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-700/25 border-t-teal-700" />
      Loading your doctor workspace…
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-100"><Icon size={20} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#142B45]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <ArrowRight className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700" size={17} />
    </button>
  );
}
