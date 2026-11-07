import { useCallback, useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CircleHelp,
  Download,
  FileCheck2,
  FileText,
  GitCompareArrows,
  HeartPulse,
  IdCard,
  LoaderCircle,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  AlertCircle,
  UserRound,
  X,
} from "lucide-react";

import { apiRequest, downloadDocument } from "../services/api";

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
  connections: {
    title: "Doctor connections",
    description: "Review access requests and manage doctors who can view your records.",
  },
};

export default function PatientDashboard() {
  const { user, updateAuthenticatedUser } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();

  const section = location.pathname.split("/")[2] || "dashboard";

  const [attempt, setAttempt] = useState(0);
  const [requestResult, setRequestResult] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");
  const [documentsAttempt, setDocumentsAttempt] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // Doctor connections
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [connectedDoctors, setConnectedDoctors] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [connectionsError, setConnectionsError] = useState("");
  const [connectionsAttempt, setConnectionsAttempt] = useState(0);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  const loading = requestResult?.attempt !== attempt;
  const error = loading ? "" : requestResult?.error;

  const firstName =
    user?.full_name?.trim().split(/\s+/)[0] || "there";

  // Load dashboard
  useEffect(() => {
    let active = true;

    apiRequest("/patient/dashboard")
      .then(() => {
        if (active) {
          setRequestResult({ attempt, error: "" });
        }
      })
      .catch((err) => {
        if (active) {
          setRequestResult({
            attempt,
            error: err.message || "Unable to load the patient dashboard.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  // Load patient documents
  const fetchDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    setDocumentsError("");

    try {
      const response = await apiRequest("/api/documents/");

      setDocuments(
        Array.isArray(response)
          ? response
          : response?.documents || []
      );
    } catch (err) {
      setDocumentsError(err.message || "Unable to load your documents.");
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, documentsAttempt]);

  // Load doctor connections
  const fetchConnections = useCallback(async () => {
    setConnectionsLoading(true);
    setConnectionsError("");

    try {
      const [incomingResponse, connectedResponse] = await Promise.all([
        apiRequest("/api/access/incoming"),
        apiRequest("/api/access/connected-doctors"),
      ]);

      setIncomingRequests(incomingResponse?.requests || []);
      setConnectedDoctors(connectedResponse?.doctors || []);
    } catch (err) {
      setConnectionsError(
        err.message || "Unable to load doctor connections."
      );
    } finally {
      setConnectionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections, connectionsAttempt]);

  // Delete document
  const handleDeleteDocument = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(documentId);

    try {
      await apiRequest(`/api/documents/${documentId}`, "DELETE");

      setDocuments((current) =>
        current.filter((document) => document.id !== documentId)
      );
    } catch (err) {
      window.alert(err.message || "Unable to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  // Approve or reject doctor request
  const handleAccessRequest = async (requestId, action) => {
    setProcessingRequestId(requestId);
    setConnectionsError("");

    try {
      await apiRequest(`/api/access/${requestId}/${action}`, "POST");
      await fetchConnections();
    } catch (err) {
      setConnectionsError(
        err.message || `Unable to ${action} access request.`
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  
  // Revoke doctor access
  const handleRevokeAccess = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this doctor's access to your medical records?"
    );

    if (!confirmed) return;

    setProcessingRequestId(requestId);
    setConnectionsError("");

    try {
      // Send revoke request to backend
      const response = await apiRequest(
        `/api/access/${requestId}/revoke`,
        "POST"
      );

      // Immediately remove doctor from the connected list
      setConnectedDoctors((current) =>
        current.filter(
          (doctor) => doctor.request_id !== requestId
        )
      );

      // Refresh data from backend
      await fetchConnections();

      window.alert(
        response?.message || "Doctor access revoked successfully."
      );
    } catch (err) {
      setConnectionsError(
        err.message || "Unable to revoke doctor access."
      );

      // Restore latest server state if the operation fails
      await fetchConnections();
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Individual sections
  if (section !== "dashboard") {
    return (
      <>
        <PageHeader
          title={pageDetails[section].title}
          subtitle={pageDetails[section].description}
        />

        <div className="mx-auto max-w-7xl space-y-6 px-5 py-7 sm:px-8">
          {error && (
            <ErrorBanner
              message={error}
              onRetry={() => setAttempt((value) => value + 1)}
            />
          )}

          {section === "connections" ? (
            <ConnectionsPage
              incomingRequests={incomingRequests}
              connectedDoctors={connectedDoctors}
              loading={connectionsLoading}
              error={connectionsError}
              onRetry={() =>
                setConnectionsAttempt((value) => value + 1)
              }
              onApprove={(id) => handleAccessRequest(id, "approve")}
              onReject={(id) => handleAccessRequest(id, "reject")}
              onRevoke={handleRevokeAccess}
              processingRequestId={processingRequestId}
            />
          ) : section === "profile" ? (
            <ProfileCard
              user={user}
              onProfileUpdated={updateAuthenticatedUser}
            />
          ) : section === "assistant" ? (
            <AssistantUnavailable />
          ) : section === "compare" ? (
            <CompareUnavailable />
          ) : (
            <DocumentsList
              documents={documents}
              loading={documentsLoading}
              error={documentsError}
              onRetry={() =>
                setDocumentsAttempt((value) => value + 1)
              }
              onDelete={handleDeleteDocument}
              deletingId={deletingId}
              onUpload={() => navigate("/patient/documents/upload")}
            />
          )}
        </div>
      </>
    );
  }

  // Main dashboard
  return (
    <>
      <PageHeader
        title="Patient dashboard"
        subtitle="Your secure medical workspace"
      />

      <div className="mx-auto max-w-7xl space-y-7 px-5 py-7 sm:px-8">
        {error && (
          <ErrorBanner
            message={error}
            onRetry={() => setAttempt((value) => value + 1)}
          />
        )}

        {/* Welcome */}
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
                Keep your medical information in one secure place and explore
                your uploaded records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/patient/documents/upload")}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-[#082236] shadow-sm transition hover:bg-teal-400"
            >
              <Upload size={17} />
              Upload document
            </button>
          </div>
        </section>

        {/* Statistics */}
        <section
          aria-label="Account statistics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            icon={FileText}
            title="Total documents"
            value={documentsLoading ? "..." : documents.length}
            detail="Your uploaded medical records"
          />

          <MetricCard
            icon={FileCheck2}
            title="Reports analyzed"
            value="0"
            detail="AI processing not implemented"
          />

          <MetricCard
            icon={Sparkles}
            title="AI summaries"
            value="0"
            detail="RAG service not implemented"
          />

          <MetricCard
            icon={GitCompareArrows}
            title="Comparisons"
            value="0"
            detail="Report comparison not implemented"
          />
        </section>

        {/* Recent documents and assistant */}
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-[#142B45]">
                  Recent documents
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest uploaded medical reports
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/patient/documents")}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                View all <ArrowRight size={15} />
              </button>
            </div>

            {documentsLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">
                Loading your documents...
              </div>
            ) : documentsError ? (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <p>{documentsError}</p>
                <button
                  type="button"
                  onClick={() =>
                    setDocumentsAttempt((value) => value + 1)
                  }
                  className="mt-2 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            ) : documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents uploaded yet"
                description="Upload your first medical report to see it here."
                action={() => navigate("/patient/documents/upload")}
                actionLabel="Upload a document"
              />
            ) : (
              <div className="mt-5 space-y-3">
                {documents.slice(0, 4).map((document) => (
                  <DocumentRow
                    key={document.id}
                    document={document}
                    onDelete={handleDeleteDocument}
                    deletingId={deletingId}
                  />
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
                <h2 className="font-bold text-[#142B45]">AI Assistant</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Document-grounded answers
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Ask about your medical reports and get answers linked to their
              source pages.
            </p>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-900">
              The RAG API is not implemented yet. Questions cannot be sent
              currently.
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

        {/* Quick actions */}
        <section>
          <div className="mb-4">
            <h2 className="font-bold text-[#142B45]">Quick actions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Shortcuts to your care workspace
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ActionCard
              icon={Upload}
              title="Upload document"
              description="Choose a medical PDF to add."
              onClick={() => navigate("/patient/documents/upload")}
            />

            <ActionCard
              icon={ShieldCheck}
              title="Manage doctor access"
              description="Review requests and manage connected doctors."
              onClick={() => navigate("/patient/connections")}
            />

            <ActionCard
              icon={MessageCircle}
              title="Ask the assistant"
              description="Ask questions when the RAG service is ready."
              onClick={() => navigate("/patient/assistant")}
            />

            <ActionCard
              icon={ChartNoAxesColumnIncreasing}
              title="Compare reports"
              description="Compare reports when analysis is available."
              onClick={() => navigate("/patient/compare")}
            />
          </div>
        </section>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4 text-sm leading-6 text-teal-950">
          <ShieldCheck
            className="mt-0.5 shrink-0 text-teal-700"
            size={19}
          />
          <p>
            Your documents are associated with your authenticated patient
            account. AI analysis and medical diagnosis are not provided by
            this application.
          </p>
        </div>
      </div>
    </>
  );
}

// ---------------- PAGE HEADER ----------------

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
        Secure patient workspace
      </span>
    </header>
  );
}

// ---------------- METRIC CARD ----------------

function MetricCard({ icon: Icon, title, value, detail }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <p className="mt-4 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#142B45]">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

// ---------------- DOCUMENT LIST ----------------

function DocumentsList({
  documents,
  loading,
  error,
  onRetry,
  onDelete,
  deletingId,
  onUpload,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All",
    "Lab Report",
    "Prescription",
    "Discharge Summary",
    "Medical History",
    "Other",
  ];

  const filteredDocuments = documents.filter((document) => {
    const filename = (
      document.filename ||
      document.original_filename ||
      ""
    ).toLowerCase();

    const matchesSearch = filename.includes(
      searchTerm.toLowerCase().trim()
    );

    const matchesCategory =
      selectedCategory === "All" ||
      document.document_type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-[#142B45]">
            Your medical documents
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Search, filter and manage your uploaded medical PDFs.
          </p>
        </div>

        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <Upload size={16} />
          Upload document
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-14 text-sm text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-700/25 border-t-teal-700" />
          Loading documents...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 font-semibold underline"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded yet"
          description="Your uploaded medical reports will appear here."
          action={onUpload}
          actionLabel="Upload your first document"
        />
      ) : (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">
              {documents.length} document(s) uploaded
            </p>

            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          <div className="relative mt-5">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search documents by filename..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => {
              const active = selectedCategory === category;

              const count =
                category === "All"
                  ? documents.length
                  : documents.filter(
                      (doc) => doc.document_type === category
                    ).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-3">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  onDelete={onDelete}
                  deletingId={deletingId}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                <FileText
                  size={28}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm font-semibold text-slate-700">
                  No matching documents found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Try another search or category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className="mt-3 text-sm font-semibold text-teal-700 hover:text-teal-900"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

// ---------------- DOCUMENT ROW ----------------

function DocumentRow({ document, onDelete, deletingId }) {
  const [downloading, setDownloading] = useState(false);

  const uploadedDate = document.uploaded_at
    ? new Date(document.uploaded_at).toLocaleDateString()
    : "Date unavailable";

  const fileSize = Number(document.file_size || 0);

  const formattedSize =
    fileSize >= 1024 * 1024
      ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(fileSize / 1024).toFixed(1)} KB`;

  const status = document.processing_status || "uploaded";

  const filename =
    document.filename ||
    document.original_filename ||
    "medical-document.pdf";

  const category = document.document_type || "Other";

  const statusStyles = {
    uploaded: "bg-blue-50 text-blue-700",
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-violet-50 text-violet-700",
    processed: "bg-emerald-50 text-emerald-700",
    failed: "bg-rose-50 text-rose-700",
  };

  const handleDownload = async () => {
    setDownloading(true);

    try {
      await downloadDocument(document.id, filename);
    } catch (err) {
      window.alert(err.message || "Unable to download document.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <FileText size={21} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-[#142B45]">
            {filename}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {uploadedDate}
            <span className="mx-1">•</span>
            {formattedSize}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
              {category}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                statusStyles[status] || "bg-slate-100 text-slate-600"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          title="Download document"
          aria-label={`Download ${filename}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-teal-100 text-teal-700 transition hover:bg-teal-50 disabled:opacity-50"
        >
          {downloading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-300 border-t-teal-700" />
          ) : (
            <Download size={17} />
          )}
        </button>

        <button
          type="button"
          onClick={() => onDelete(document.id)}
          disabled={deletingId === document.id}
          title="Delete document"
          aria-label={`Delete ${filename}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
        >
          {deletingId === document.id ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-300 border-t-rose-600" />
          ) : (
            <Trash2 size={17} />
          )}
        </button>
      </div>
    </article>
  );
}

// ---------------- DOCTOR CONNECTIONS ----------------

function ConnectionsPage({
  incomingRequests,
  connectedDoctors,
  loading,
  error,
  onRetry,
  onApprove,
  onReject,
  onRevoke,
  processingRequestId,
}) {
  return (
    <div className="space-y-6">
      {error && <ErrorBanner message={error} onRetry={onRetry} />}

      {/* Incoming requests */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#142B45]">
              Incoming access requests
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review doctors requesting permission to view your records.
            </p>
          </div>

          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {incomingRequests.length} pending
          </span>
        </div>

        {loading ? (
          <LoadingState title="Loading access requests" />
        ) : incomingRequests.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No pending requests"
            description="New doctor access requests will appear here."
          />
        ) : (
          <div className="mt-5 space-y-3">
            {incomingRequests.map((request) => {
              const busy = processingRequestId === request.request_id;

              return (
                <article
                  key={request.request_id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        <HeartPulse size={21} />
                      </span>

                      <div>
                        <h3 className="font-semibold text-[#142B45]">
                          {request.doctor_name || "Doctor"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {request.specialization || "Specialization not provided"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {request.doctor_email || ""}
                        </p>

                        {request.qualification && (
                          <p className="mt-1 text-xs text-slate-500">
                            {request.qualification}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 sm:shrink-0">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onApprove(request.request_id)}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
                      >
                        {busy ? "Please wait..." : "Approve"}
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onReject(request.request_id)}
                        className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Connected doctors */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="font-bold text-[#142B45]">Connected doctors</h2>
        <p className="mt-1 text-sm text-slate-500">
          Doctors currently permitted to access your medical records.
        </p>

        {loading ? (
          <LoadingState title="Loading connected doctors" />
        ) : connectedDoctors.length === 0 ? (
          <EmptyState
            icon={HeartPulse}
            title="No connected doctors"
            description="Doctors you approve will appear here."
          />
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {connectedDoctors.map((doctor) => (
              <article
                key={doctor.request_id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <HeartPulse size={21} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#142B45]">
                      {doctor.doctor_name || "Doctor"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {doctor.specialization || "Specialization not provided"}
                    </p>

                    <p className="mt-1 break-all text-xs text-slate-500">
                      {doctor.doctor_email || ""}
                    </p>

                    {doctor.qualification && (
                      <p className="mt-1 text-xs text-slate-500">
                        {doctor.qualification}
                      </p>
                    )}

                    <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Access approved
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={processingRequestId === doctor.request_id}
                  onClick={() => onRevoke(doctor.request_id)}
                  className="mt-4 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  {processingRequestId === doctor.request_id
                    ? "Please wait..."
                    : "Revoke access"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 p-4 text-sm leading-6 text-teal-950">
        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-teal-700"
        />
        <p>
          Doctors can access your medical records only after you approve
          their request. You can revoke access at any time.
        </p>
      </div>
    </div>
  );
}

// ---------------- EMPTY STATE ----------------

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}) {
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

      {action && (
        <button
          type="button"
          onClick={action}
          className="mt-4 text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ---------------- FEATURE UNAVAILABLE ----------------

function FeatureUnavailable({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Icon size={21} />
        </span>

        <div>
          <h2 className="font-bold text-[#142B45]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

// ---------------- AI ASSISTANT ----------------

function AssistantUnavailable() {
  return (
    <FeatureUnavailable
      icon={Bot}
      title="Ask about your records"
      description="Answers will be grounded in your medical PDFs and include document and page references."
    >
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <div className="flex items-start gap-2">
          <CircleHelp className="mt-0.5 shrink-0" size={18} />
          <p>
            The RAG pipeline is not implemented yet. The assistant cannot
            answer questions currently.
          </p>
        </div>
      </div>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          disabled
          aria-label="Ask the AI assistant"
          placeholder="Ask a question about your reports"
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 disabled:cursor-not-allowed"
        />

        <button
          disabled
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-300 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed"
        >
          <MessageCircle size={16} />
          Send
        </button>
      </form>
    </FeatureUnavailable>
  );
}

// ---------------- COMPARE REPORTS ----------------

function CompareUnavailable() {
  return (
    <FeatureUnavailable
      icon={GitCompareArrows}
      title="Compare medical reports"
      description="Choose two reports to review changes over time once the comparison feature is implemented."
    >
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {["Earlier report", "Recent report"].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-400"
          >
            {label}
            <span className="ml-1 text-xs">(not available yet)</span>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Report comparison will be connected after the document processing
        pipeline is implemented.
      </p>
    </FeatureUnavailable>
  );
}

// ---------------- PROFILE ----------------

function ProfileCard({ user, onProfileUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState({});
  const [maxDateOfBirth, setMaxDateOfBirth] = useState("");
  const initials = user?.full_name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "P";

  const openEditor = () => {
    const today = new Date();
    setForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
      contact_number: user?.contact_number || "",
      date_of_birth: user?.date_of_birth?.slice(0, 10) || "",
    });
    setMaxDateOfBirth(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
    );
    setNotice(null);
    setIsEditing(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);

    try {
      const result = await apiRequest("/auth/profile", "PATCH", {
        ...form,
        date_of_birth: form.date_of_birth || null,
      });
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
            <p className="text-sm font-semibold text-teal-700">Patient profile</p>
            <h2 className="mt-1 break-words text-2xl font-bold tracking-tight text-[#142B45] sm:text-3xl">
              {user?.full_name || "Name not available"}
            </h2>
            <p className="mt-1 break-all text-sm text-slate-500">
              {user?.email || "Email not available"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold capitalize text-teal-800">
                <UserRound size={14} />
                {user?.role || "Patient"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <BadgeCheck size={14} />
                Authenticated
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
              <UserRound size={19} />
            </span>
            <div>
              <h3 className="font-bold text-[#142B45]">Personal information</h3>
              <p className="mt-0.5 text-xs text-slate-500">Your registered details</p>
            </div>
          </div>

          <dl className="mt-2 divide-y divide-slate-100">
            <ProfileField
              icon={UserRound}
              label="Full name"
              value={user?.full_name || "Not available"}
            />
            <ProfileField
              icon={Mail}
              label="Email address"
              value={user?.email || "Not available"}
            />
            <ProfileField
              icon={Phone}
              label="Contact number"
              value={user?.contact_number || "Not available"}
              hint={!user?.contact_number ? "Not provided by the profile API" : undefined}
            />
            <ProfileField
              icon={IdCard}
              label="Patient ID"
              value={user?.id ?? "Not available"}
            />
            <ProfileField
              icon={CalendarDays}
              label="Date of birth"
              value={formatProfileDate(user?.date_of_birth)}
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
            <ProfileField
              icon={UserRound}
              label="Account role"
              value={user?.role || "Not available"}
            />
            <ProfileField
              icon={IdCard}
              label="Account ID"
              value={user?.id ?? "Not available"}
            />
            <ProfileField
              icon={CalendarDays}
              label="Account created"
              value={formatProfileDate(user?.created_at)}
              hint={!user?.created_at ? "Creation date is not provided by the profile API" : undefined}
            />
            <ProfileField
              icon={BadgeCheck}
              label="Account status"
              value={user?.is_active === true ? "Active" : "Not available"}
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
            aria-labelledby="patient-profile-edit-title"
            className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <h2 id="patient-profile-edit-title" className="text-lg font-bold text-[#142B45]">
                  Edit profile
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update your personal and contact information.
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
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Date of birth</span>
                <input
                  type="date"
                  max={maxDateOfBirth}
                  value={form.date_of_birth}
                  onChange={(event) => setForm({ ...form, date_of_birth: event.target.value })}
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

function formatProfileDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

function ProfileField({ icon: Icon, label, value, hint }) {
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

// ---------------- ERROR BANNER ----------------

function ErrorBanner({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 font-semibold underline underline-offset-2"
      >
        Retry
      </button>
    </div>
  );
}

// ---------------- LOADING STATE ----------------

function LoadingState({ title }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm font-semibold text-teal-800">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-700/25 border-t-teal-700" />
      {title}…
    </div>
  );
}

// ---------------- ACTION CARD ----------------

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