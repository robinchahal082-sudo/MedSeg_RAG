
import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bot,
  BriefcaseMedical,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  GitCompareArrows,
  IdCard,
  LoaderCircle,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";

import {
  apiRequest,
  downloadDocument,
} from "../services/api";


const pageDetails = {
  patients: {
    title: "My patients",
    description: "Search patients and manage your access requests.",
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
    description: "Compare previous and recent reports.",
  },
  profile: {
    title: "Profile",
    description: "Your authenticated doctor account.",
  },
};


export default function DoctorDashboard() {
  const { user, updateAuthenticatedUser } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(0);
  const [dashboardError, setDashboardError] = useState("");
  const [requests, setRequests] = useState([]);
  const [requestsError, setRequestsError] = useState("");
  const [requestsLoading, setRequestsLoading] = useState(true);

  const section = location.pathname.split("/")[2] || "dashboard";

  useEffect(() => {
    let active = true;

    setDashboardError("");
    setRequestsLoading(true);
    setRequestsError("");

    apiRequest("/doctor/dashboard")
      .catch((error) => {
        if (active) {
          setDashboardError(
            error.message || "Unable to load doctor dashboard."
          );
        }
      });

    apiRequest("/api/access/my-requests")
      .then((data) => {
        if (active) {
          setRequests(data?.requests || []);
          setRequestsError("");
        }
      })
      .catch((error) => {
        if (active) {
          setRequests([]);
          setRequestsError(
            error.message || "Unable to load access requests."
          );
        }
      })
      .finally(() => {
        if (active) setRequestsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const refresh = () => {
    setAttempt((value) => value + 1);
  };

  const fullName = user?.full_name?.trim() || "Doctor";

  if (
    ![
      "dashboard",
      "patients",
      "documents",
      "assistant",
      "compare",
      "profile",
    ].includes(section)
  ) {
    return <LoadingState />;
  }

  if (section !== "dashboard") {
    return (
      <>
        <PageHeader
          title={pageDetails[section].title}
          subtitle={pageDetails[section].description}
        />

        <div className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-8">
          {dashboardError && (
            <ErrorBanner
              message={dashboardError}
              onRetry={refresh}
            />
          )}

          {section === "profile" ? (
            <ProfileCard
              user={user}
              onProfileUpdated={updateAuthenticatedUser}
            />
          ) : section === "patients" ? (
            <PatientsSection
              requests={requests}
              requestsError={requestsError}
              requestsLoading={requestsLoading}
              onRefresh={refresh}
            />
          ) : section === "documents" ? (
            <PatientDocumentsSection
              requests={requests}
              requestsError={requestsError}
              requestsLoading={requestsLoading}
            />
          ) : section === "assistant" ? (
            <AssistantUnavailable />
          ) : (
            <CompareUnavailable />
          )}
        </div>
      </>
    );
  }

  const approvedPatients = requests.filter(
    (request) => request.status === "approved"
  );

  const pendingRequests = requests.filter(
    (request) => request.status === "pending"
  );

  return (
    <>
      <PageHeader
        title="Doctor dashboard"
        subtitle="Your professional healthcare workspace"
      />

      <div className="mx-auto max-w-7xl space-y-7 px-5 py-7 sm:px-8">
        {dashboardError && (
          <ErrorBanner
            message={dashboardError}
            onRetry={refresh}
          />
        )}

        {requestsError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <div className="flex items-start gap-2">
              <CircleHelp size={18} className="mt-0.5 shrink-0" />
              <p>{requestsError}</p>
            </div>
            {requestsError.toLowerCase().includes("verified") && (
              <p className="mt-2 text-xs">
                Your doctor account is awaiting verification. You can
                access these features after verification.
              </p>
            )}
          </div>
        )}

        {/* HERO */}
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
                Manage patient access requests and securely review
                medical documents shared with you.
              </p>
            </div>

            <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100">
              <ShieldCheck size={17} className="text-teal-300" />
              Doctor Portal
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section
          aria-label="Account statistics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            icon={UsersRound}
            title="My patients"
            value={requestsLoading ? "..." : approvedPatients.length}
            detail="Patients who approved access"
          />

          <MetricCard
            icon={Clock3}
            title="Pending requests"
            value={requestsLoading ? "..." : pendingRequests.length}
            detail="Awaiting patient approval"
          />

          <MetricCard
            icon={FileText}
            title="Documents"
            value="—"
            detail="Available inside patient records"
          />

          <MetricCard
            icon={Sparkles}
            title="AI summaries"
            value="—"
            detail="RAG service not connected"
          />
        </section>

        {/* RECENT PATIENTS AND REQUESTS */}
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#142B45]">
                  My patients
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Patients who have granted you access
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/doctor/patients")}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                View all <ArrowRight size={15} />
              </button>
            </div>

            {requestsLoading ? (
              <LoadingInline />
            ) : approvedPatients.length === 0 ? (
              <EmptyState
                icon={UsersRound}
                title="No approved patients yet"
                description="Search for a patient and send an access request. Their records will appear here after approval."
              />
            ) : (
              <div className="mt-5 divide-y divide-slate-100">
                {approvedPatients.slice(0, 5).map((patient) => (
                  <div
                    key={patient.request_id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 font-semibold text-teal-800">
                        {patient.patient_name?.charAt(0)?.toUpperCase() || "P"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#142B45]">
                          {patient.patient_name || "Patient"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Patient ID: {patient.patient_id}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/doctor/documents")}
                      className="shrink-0 text-xs font-semibold text-teal-700 hover:text-teal-900"
                    >
                      View records
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <Bot size={20} />
              </span>
              <div>
                <h2 className="font-bold text-[#142B45]">
                  Clinical AI assistant
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Patient-specific, cited answers
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Summarize records, ask document-grounded questions,
              and compare reports.
            </p>

            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-950">
              The RAG service is not connected yet. AI clinical
              requests remain disabled.
            </p>
          </section>
        </div>

        {/* CLINICAL TOOLS */}
        <section>
          <div className="mb-4">
            <h2 className="font-bold text-[#142B45]">
              Clinical tools
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Open your authorized workspace
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ActionCard
              icon={UsersRound}
              title="My patients"
              description="Search patients and manage access requests."
              onClick={() => navigate("/doctor/patients")}
            />

            <ActionCard
              icon={FileText}
              title="Patient documents"
              description="Review documents shared by approved patients."
              onClick={() => navigate("/doctor/documents")}
            />

            <ActionCard
              icon={MessageCircle}
              title="AI Assistant (RAG)"
              description="Generate sourced answers when the RAG service is ready."
              onClick={() => navigate("/doctor/assistant")}
            />
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4 text-sm leading-6 text-teal-950">
          <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={19} />
          <p>
            Patient documents are available only after the patient
            approves your access. Patients can revoke access at any time.
          </p>
        </div>
      </div>
    </>
  );
}


// --------------------------------------------------
// PATIENT SEARCH AND ACCESS REQUESTS
// --------------------------------------------------

function PatientsSection({
  requests,
  requestsError,
  requestsLoading,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();

    if (query.length < 2) {
      setSearchError("Enter at least 2 characters to search.");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    setActionMessage("");
    setSearched(true);

    try {
      const data = await apiRequest(
        `/api/access/search-patients?q=${encodeURIComponent(query)}`
      );

      setResults(data?.patients || []);
    } catch (error) {
      setResults([]);
      setSearchError(error.message || "Patient search failed.");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleRequest(patientId) {
    setSendingId(patientId);
    setActionMessage("");
    setSearchError("");

    try {
      const data = await apiRequest(
        `/api/access/request/${patientId}`,
        "POST"
      );

      setActionMessage(data?.message || "Access request sent.");
      await onRefresh();
    } catch (error) {
      setSearchError(error.message || "Unable to send request.");
    } finally {
      setSendingId(null);
    }
  }

  function getExistingRequest(patientId) {
    return requests.find(
      (request) => request.patient_id === patientId
    );
  }

  return (
    <div className="space-y-6">
      {/* SEARCH */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Search size={21} />
          </span>
          <div>
            <h2 className="font-bold text-[#142B45]">
              Find a patient
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Search registered patients by their name to request
              access to their medical records.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Enter patient name..."
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />

          <button
            type="submit"
            disabled={searchLoading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#10263E] px-5 text-sm font-semibold text-white transition hover:bg-[#193b5b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={16} />
            {searchLoading ? "Searching..." : "Search patients"}
          </button>
        </form>

        {searchError && (
          <p role="alert" className="mt-3 text-sm text-rose-700">
            {searchError}
          </p>
        )}

        {actionMessage && (
          <p className="mt-3 text-sm text-emerald-700">
            {actionMessage}
          </p>
        )}

        {searched && !searchLoading && !searchError && (
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Search results ({results.length})
            </p>

            {results.length === 0 ? (
              <EmptyState
                icon={UsersRound}
                title="No patients found"
                description="Try checking the spelling or searching with another name."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {results.map((patient) => {
                  const existing = getExistingRequest(patient.id);

                  const alreadyHandled =
                    existing?.status === "pending" ||
                    existing?.status === "approved";

                  return (
                    <div
                      key={patient.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-semibold text-blue-700">
                          {patient.full_name?.charAt(0)?.toUpperCase() || "P"}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#142B45]">
                            {patient.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Patient ID: {patient.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {existing && (
                          <StatusBadge status={existing.status} />
                        )}

                        <button
                          type="button"
                          disabled={
                            alreadyHandled || sendingId === patient.id
                          }
                          onClick={() => handleRequest(patient.id)}
                          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <Send size={14} />
                          {sendingId === patient.id
                            ? "Sending..."
                            : existing?.status === "approved"
                              ? "Access granted"
                              : existing?.status === "pending"
                                ? "Request pending"
                                : "Request access"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ACCESS REQUEST HISTORY */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#142B45]">
              My access requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Track patient authorization status.
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={requestsLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={requestsLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {requestsError && (
          <p role="alert" className="mt-4 text-sm text-rose-700">
            {requestsError}
          </p>
        )}

        {requestsLoading ? (
          <LoadingInline />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Clock3}
            title="No access requests yet"
            description="Search for a patient above to send your first access request."
          />
        ) : (
          <div className="mt-5 divide-y divide-slate-100">
            {requests.map((request) => (
              <div
                key={request.request_id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#142B45]">
                    {request.patient_name || "Patient"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Patient ID: {request.patient_id}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Requested: {formatDate(request.requested_at)}
                  </p>
                </div>

                <StatusBadge status={request.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


// --------------------------------------------------
// APPROVED PATIENT DOCUMENTS
// --------------------------------------------------

function PatientDocumentsSection({
  requests,
  requestsError,
  requestsLoading,
}) {
  const approvedPatients = requests.filter(
    (request) => request.status === "approved"
  );

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [documentResult, setDocumentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    if (
      selectedPatientId &&
      !approvedPatients.some(
        (patient) => String(patient.patient_id) === selectedPatientId
      )
    ) {
      setSelectedPatientId("");
      setDocumentResult(null);
    }
  }, [selectedPatientId, requests]);

  async function loadPatientDocuments(patientId) {
    setSelectedPatientId(patientId);
    setDocumentResult(null);
    setError("");
    setDownloadError("");

    if (!patientId) return;

    setLoading(true);

    try {
      const data = await apiRequest(
        `/api/documents/patient/${patientId}`
      );

      setDocumentResult(data);
    } catch (requestError) {
      setError(
        requestError.message || "Unable to load patient documents."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(document) {
    setDownloadingId(document.id);
    setDownloadError("");

    try {
      await downloadDocument(document.id, document.filename);
    } catch (downloadRequestError) {
      setDownloadError(
        downloadRequestError.message || "Document download failed."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  if (requestsLoading) {
    return <LoadingInline />;
  }

  if (requestsError) {
    return (
      <ErrorBanner
        message={requestsError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (approvedPatients.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <EmptyState
          icon={FileCheck2}
          title="No authorized patients"
          description="Once a patient approves your access request, you can select them here to view their shared documents."
        />
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label
          htmlFor="patient-document-select"
          className="block text-sm font-semibold text-[#142B45]"
        >
          Select an authorized patient
        </label>

        <select
          id="patient-document-select"
          value={selectedPatientId}
          onChange={(event) =>
            loadPatientDocuments(event.target.value)
          }
          className="mt-3 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:max-w-lg"
        >
          <option value="">Choose a patient</option>

          {approvedPatients.map((patient) => (
            <option
              key={patient.request_id}
              value={patient.patient_id}
            >
              {patient.patient_name} (ID: {patient.patient_id})
            </option>
          ))}
        </select>
      </section>

      {loading && <LoadingInline />}

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => loadPatientDocuments(selectedPatientId)}
        />
      )}

      {downloadError && (
        <p role="alert" className="text-sm text-rose-700">
          {downloadError}
        </p>
      )}

      {documentResult && !loading && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#142B45]">
                {documentResult.patient?.full_name || "Patient"}'s documents
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {documentResult.total_documents} documents shared with you
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck size={14} />
              Access approved
            </span>
          </div>

          {documentResult.documents?.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents uploaded"
              description="This patient has not uploaded any medical documents yet."
            />
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {documentResult.documents.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <FileText size={19} />
                    </span>

                    <div className="min-w-0">
                      <p className="break-all text-sm font-semibold text-[#142B45]">
                        {document.filename}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {document.document_type || "Other"} ·{" "}
                        {formatFileSize(document.file_size)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Uploaded: {formatDate(document.uploaded_at)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={downloadingId === document.id}
                    onClick={() => handleDownload(document)}
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-teal-200 px-4 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50 disabled:opacity-50"
                  >
                    <Download size={15} />
                    {downloadingId === document.id
                      ? "Downloading..."
                      : "Download PDF"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}


// --------------------------------------------------
// REUSABLE COMPONENTS
// --------------------------------------------------

function PageHeader({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
      <div>
        <h1 className="text-lg font-bold text-[#142B45] sm:text-xl">
          {title}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          {subtitle}
        </p>
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

      <p className="mt-4 text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-[#142B45]">
        {value}
      </p>

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

      <h3 className="mt-3 text-sm font-semibold text-slate-700">
        {title}
      </h3>

      <p className="mx-auto mt-1.5 max-w-lg text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}


function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    revoked: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    revoked: "Revoked",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] || styles.revoked
      }`}
    >
      {status === "approved" ? (
        <ShieldCheck size={13} />
      ) : status === "rejected" || status === "revoked" ? (
        <XCircle size={13} />
      ) : (
        <Clock3 size={13} />
      )}
      {labels[status] || status}
    </span>
  );
}


function ProfileCard({ user, onProfileUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState({});
  const initials = user?.full_name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "D";
  const verificationStatus = user?.verification_status;
  const verificationLabel = verificationStatus === "verified"
    ? "Verified"
    : verificationStatus === "pending"
      ? "Pending verification"
      : "Verification unavailable";
  const verificationStyle = verificationStatus === "verified"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : verificationStatus === "pending"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-50 text-slate-600";

  const openEditor = () => {
    setForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
      contact_number: user?.contact_number || "",
      specialization: user?.specialization || "",
      qualification: user?.qualification || "",
    });
    setNotice(null);
    setIsEditing(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const result = await apiRequest("/auth/profile", "PATCH", form);
      onProfileUpdated(result.profile);
      setIsEditing(false);
      setNotice({
        type: "success",
        message: result.message || "Profile updated successfully.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Unable to update your profile.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {notice && !isEditing && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.message}
        </div>
      )}

      <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-white to-teal-50/80 p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[30px] border-teal-700/[0.04]" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-40 w-40 rounded-full bg-teal-500/[0.06] blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 text-2xl font-bold tracking-wide text-white shadow-lg shadow-teal-900/15 ring-4 ring-white">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-teal-700">Doctor profile</p>
            <h2 className="mt-1 break-words text-2xl font-bold tracking-tight text-[#142B45] sm:text-3xl">
              {user?.full_name || "Name not available"}
            </h2>
            <p className="mt-1 break-all text-sm text-slate-500">
              {user?.email || "Email not available"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold capitalize text-teal-800">
                <UserRound size={14} />
                {user?.role || "Doctor"}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${verificationStyle}`}>
                {verificationStatus === "verified" ? (
                  <BadgeCheck size={14} />
                ) : (
                  <ShieldCheck size={14} />
                )}
                {verificationLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openEditor}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <Pencil size={16} />
            Edit profile
          </button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <BriefcaseMedical size={19} />
            </span>
            <div>
              <h3 className="font-bold text-[#142B45]">Professional information</h3>
              <p className="mt-0.5 text-xs text-slate-500">Your registered medical credentials</p>
            </div>
          </div>

          <dl className="mt-2 divide-y divide-slate-100">
            <DoctorProfileField
              icon={BriefcaseMedical}
              label="Specialization"
              value={user?.specialization || "Not available"}
              hint={!user?.specialization ? "Not provided by the profile API" : undefined}
            />
            <DoctorProfileField
              icon={GraduationCap}
              label="Qualification"
              value={user?.qualification || "Not available"}
              hint={!user?.qualification ? "Not provided by the profile API" : undefined}
            />
            <DoctorProfileField
              icon={IdCard}
              label="Medical registration number"
              value={user?.registration_number || "Not available"}
              hint={!user?.registration_number ? "Not provided by the profile API" : undefined}
            />
            <DoctorProfileField
              icon={IdCard}
              label="Doctor ID"
              value={user?.id ?? "Not available"}
            />
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck size={19} />
            </span>
            <div>
              <h3 className="font-bold text-[#142B45]">Account information</h3>
              <p className="mt-0.5 text-xs text-slate-500">Your secure workspace account</p>
            </div>
          </div>

          <dl className="mt-2 divide-y divide-slate-100">
            <DoctorProfileField
              icon={Mail}
              label="Email address"
              value={user?.email || "Not available"}
            />
            <DoctorProfileField
              icon={Phone}
              label="Contact number"
              value={user?.contact_number || "Not available"}
              hint={!user?.contact_number ? "Not provided by the profile API" : undefined}
            />
            <DoctorProfileField
              icon={CalendarDays}
              label="Account created"
              value={formatDoctorProfileDate(user?.created_at)}
              hint={!user?.created_at ? "Creation date is not provided by the profile API" : undefined}
            />
            <DoctorProfileField
              icon={BadgeCheck}
              label="Account status"
              value={user?.is_active === true ? "Active" : "Not available"}
              hint={user?.is_active !== true ? "Not provided by the profile API" : undefined}
            />
          </dl>
        </section>
      </div>

      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSaving) {
              setIsEditing(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-profile-edit-title"
            className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <h2 id="doctor-profile-edit-title" className="text-lg font-bold text-[#142B45]">
                  Edit profile
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update your contact details and professional information.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close profile editor"
                disabled={isSaving}
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 px-5 py-5 sm:px-7">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
                <input
                  required
                  minLength={2}
                  maxLength={150}
                  autoComplete="name"
                  value={form.full_name}
                  onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#142B45] outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Email address</span>
                <input
                  required
                  type="email"
                  maxLength={255}
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#142B45] outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Contact number</span>
                <input
                  required
                  type="tel"
                  minLength={10}
                  maxLength={15}
                  autoComplete="tel"
                  value={form.contact_number}
                  onChange={(event) => setForm({ ...form, contact_number: event.target.value })}
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#142B45] outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Specialization</span>
                <input
                  required
                  minLength={1}
                  maxLength={150}
                  value={form.specialization}
                  onChange={(event) => setForm({ ...form, specialization: event.target.value })}
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#142B45] outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Qualification</span>
                <input
                  required
                  minLength={1}
                  maxLength={150}
                  value={form.qualification}
                  onChange={(event) => setForm({ ...form, qualification: event.target.value })}
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-[#142B45] outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              {isEditing && notice?.type === "error" && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">
                  {notice.message}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsEditing(false)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function formatDoctorProfileDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

function DoctorProfileField({ icon: Icon, label, value, hint }) {
  return (
    <div className="flex items-start gap-3 py-4">
      <Icon className="mt-0.5 shrink-0 text-slate-400" size={17} strokeWidth={1.8} />
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-[#142B45]">
          {value}
        </dd>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}


function AssistantUnavailable() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <Bot size={21} />
        </span>

        <div>
          <h2 className="font-bold text-[#142B45]">
            Ask about an authorized patient's records
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Questions and summaries should cite their source document and page.
          </p>
        </div>
      </div>

      <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        The RAG query, summary and patient-selection services have not
        been connected yet. AI requests remain disabled.
      </p>
    </section>
  );
}


function CompareUnavailable() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <GitCompareArrows size={21} />
        </span>

        <div>
          <h2 className="font-bold text-[#142B45]">
            Compare patient reports
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Select an authorized patient and two reports to compare.
          </p>
        </div>
      </div>

      <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Report comparison is not connected yet. No comparison results
        are generated.
      </p>
    </section>
  );
}


function ErrorBanner({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 font-semibold underline underline-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}


function LoadingInline() {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-sm font-medium text-teal-800">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-700/25 border-t-teal-700" />
      Loading...
    </div>
  );
}


function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm font-semibold text-teal-800">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-700/25 border-t-teal-700" />
      Loading your doctor workspace...
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
        <span className="block text-sm font-bold text-[#142B45]">
          {title}
        </span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <ArrowRight
        className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700"
        size={17}
      />
    </button>
  );
}


// --------------------------------------------------
// FORMAT HELPERS
// --------------------------------------------------

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString();
}


function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined) return "Size unavailable";

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
