import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  FileCheck2,
  FileText,
  GitCompareArrows,
  HeartPulse,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { apiRequest } from "../services/api";

const pageDetails = {
  documents: {
    title: "My documents",
    description: "Your uploaded medical reports and their processing status.",
  },
  assistant: {
    title: "AI Assistant (RAG)",
    description: "Ask questions grounded in your own medical documents.",
  },
  compare: {
    title: "Compare reports",
    description: "Review changes between two medical reports.",
  },
  profile: {
    title: "Profile",
    description: "Your account identity and role.",
  },
};

const featureMessages = {
  documents:
    "A patient document-list API is not implemented yet. Your account is verified, but no records are returned by the current backend.",
  assistant:
    "The backend does not currently expose a RAG question or summary endpoint. No question has been sent and no answer has been generated.",
  compare:
    "The backend does not currently expose a report-comparison endpoint or document history.",
};

export default function PatientDashboard() {
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
    apiRequest("/patient/dashboard")
      .then(() => {
        if (active) setRequestResult({ attempt, error: "" });
      })
      .catch((requestError) => {
        if (active) {
          setRequestResult({
            attempt,
            error: requestError.message || "Unable to load the patient dashboard.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const firstName = user?.full_name?.trim().split(/\s+/)[0] || "there";

  if (loading) {
    return <LoadingState title="Preparing your dashboard" />;
  }

  if (section !== "dashboard" && section !== "documents" && section !== "assistant" && section !== "compare" && section !== "profile") {
    return <LoadingState title="Opening your workspace" />;
  }

  if (section !== "dashboard") {
    return (
      <>
        <PageHeader title={pageDetails[section]?.title || "Patient workspace"} subtitle={pageDetails[section]?.description || ""} />
        <div className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-8">
          {error && <ErrorBanner message={error} onRetry={() => setAttempt((value) => value + 1)} />}
          {section === "profile" ? (
            <ProfileCard user={user} />
          ) : section === "assistant" ? (
            <AssistantUnavailable />
          ) : section === "compare" ? (
            <CompareUnavailable />
          ) : (
            <DocumentsUnavailable />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Patient dashboard" subtitle="Your secure medical workspace" />
      <div className="mx-auto max-w-7xl space-y-7 px-5 py-7 sm:px-8">
        {error && <ErrorBanner message={error} onRetry={() => setAttempt((value) => value + 1)} />}

        <section className="relative overflow-hidden rounded-3xl bg-[#10263E] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[36px] border-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-teal-100">
                <HeartPulse size={14} />
                Your care, organized
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Hello, {firstName}!
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Keep your medical information in one secure place and explore your records when the connected services are available.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/patient/documents/upload")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-[#082236] shadow-sm transition hover:bg-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Upload size={17} />
              Upload document
            </button>
          </div>
        </section>

        <section aria-label="Account statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={FileText} title="Total documents" value="—" detail="Document API unavailable" />
          <MetricCard icon={FileCheck2} title="Reports analyzed" value="—" detail="Analysis data unavailable" />
          <MetricCard icon={Sparkles} title="AI summaries" value="—" detail="RAG service unavailable" />
          <MetricCard icon={GitCompareArrows} title="Comparisons" value="—" detail="Comparison data unavailable" />
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#142B45]">Recent documents</h2>
                <p className="mt-1 text-sm text-slate-500">Your latest uploaded medical reports</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/patient/documents")}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                View all <ArrowRight size={15} />
              </button>
            </div>
            <EmptyState
              icon={FileText}
              title="No documents to display"
              description="The current backend does not provide a patient document list. Your records will appear here when that API is available."
              action={() => navigate("/patient/documents/upload")}
              actionLabel="Select a document"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Bot size={20} />
              </span>
              <div>
                <h2 className="font-bold text-[#142B45]">AI Assistant</h2>
                <p className="mt-1 text-xs text-slate-500">Document-grounded answers</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              Ask about your medical reports and get answers linked to their source pages.
            </p>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-900">
              The RAG API is not configured in the current backend. Questions cannot be sent yet.
            </div>
            <button
              type="button"
              onClick={() => navigate("/patient/assistant")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
            >
              Open assistant <ArrowRight size={15} />
            </button>
          </section>
        </div>

        <section>
          <div className="mb-4">
            <h2 className="font-bold text-[#142B45]">Quick actions</h2>
            <p className="mt-1 text-sm text-slate-500">Shortcuts to your care workspace</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ActionCard icon={Upload} title="Upload document" description="Choose a medical PDF to add." onClick={() => navigate("/patient/documents/upload")} />
            <ActionCard icon={MessageCircle} title="Ask the assistant" description="RAG questions require a backend endpoint." onClick={() => navigate("/patient/assistant")} />
            <ActionCard icon={ChartNoAxesColumnIncreasing} title="Compare reports" description="Compare reports when document history is available." onClick={() => navigate("/patient/compare")} />
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4 text-sm leading-6 text-teal-950">
          <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={19} />
          <p>
            Your identity is verified by the authenticated backend session. Medical documents and analytics are not exposed by the current API.
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
        Secure patient workspace
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

function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-9 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        <Icon size={21} />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-slate-700">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-lg text-xs leading-5 text-slate-500">{description}</p>
      {action && (
        <button type="button" onClick={action} className="mt-4 text-sm font-semibold text-teal-700 hover:text-teal-900">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function FeatureUnavailable({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Icon size={21} />
        </span>
        <div>
          <h2 className="font-bold text-[#142B45]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function DocumentsUnavailable() {
  return (
    <FeatureUnavailable icon={FileText} title="Your medical documents" description="Only your account profile is currently returned by the backend; document list and processing statuses are not yet available.">
      <EmptyState icon={CalendarClock} title="No document records returned" description={featureMessages.documents} />
    </FeatureUnavailable>
  );
}

function AssistantUnavailable() {
  return (
    <FeatureUnavailable icon={Bot} title="Ask about your records" description="Answers should be grounded in your medical PDFs and include document/page citations.">
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <div className="flex items-start gap-2">
          <CircleHelp className="mt-0.5 shrink-0" size={18} />
          <p>{featureMessages.assistant}</p>
        </div>
      </div>
      <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
        <input
          disabled
          aria-label="Ask the AI assistant"
          placeholder="Ask a question about your reports"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 disabled:cursor-not-allowed"
        />
        <button disabled type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-300 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed">
          <MessageCircle size={16} />
          Send
        </button>
      </form>
    </FeatureUnavailable>
  );
}

function CompareUnavailable() {
  return (
    <FeatureUnavailable icon={GitCompareArrows} title="Compare medical reports" description="Choose two reports to review changes over time once the document library is connected.">
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {["Earlier report", "Recent report"].map((label) => (
          <div key={label} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-400">
            {label} <span className="ml-1 text-xs">(unavailable)</span>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{featureMessages.compare}</p>
    </FeatureUnavailable>
  );
}

function ProfileCard({ user }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-lg font-bold text-teal-800">
          {user?.full_name?.trim().slice(0, 1).toUpperCase() || "P"}
        </span>
        <div>
          <h2 className="font-bold text-[#142B45]">{user?.full_name}</h2>
          <p className="mt-1 text-sm text-slate-500">Patient account</p>
        </div>
      </div>
      <dl className="grid gap-5 pt-5 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email address</dt><dd className="mt-1 text-sm font-medium text-slate-700">{user?.email || "Not provided"}</dd></div>
        <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Patient ID</dt><dd className="mt-1 text-sm font-medium text-slate-700">{user?.id ?? "Not provided"}</dd></div>
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

function LoadingState({ title }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm font-semibold text-teal-800">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-700/25 border-t-teal-700" />
      {title}…
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
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-100">
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[#142B45]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
      </span>
      <ArrowRight className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700" size={17} />
    </button>
  );
}
