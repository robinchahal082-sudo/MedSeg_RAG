
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  FileText,
  FileUp,
  FolderOpen,
  ShieldCheck,
  Trash2,
  Upload,
  Info,
  X,
  ChevronDown,
} from "lucide-react";

import { apiRequest } from "../services/api";

const DOCUMENT_TYPES = [
  "Lab Report",
  "Prescription",
  "Discharge Summary",
  "Medical History",
  "Other",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function MedicalDocumentUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [documentType, setDocumentType] = useState("Other");
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ------------------------------------------------
  // 1. HANDLE FILE SELECTION
  // ------------------------------------------------

  const handleFiles = (selectedFiles) => {
    if (isUploading || !selectedFiles?.length) return;

    const selected = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    selected.forEach((file) => {
      const isPdf =
        file.type === "application/pdf" ||
        (file.type === "" && /\.pdf$/i.test(file.name));

      if (!isPdf || !/\.pdf$/i.test(file.name)) {
        errors.push(`${file.name}: Only PDF files are allowed.`);
        return;
      }

      if (file.size === 0) {
        errors.push(`${file.name}: Empty files are not allowed.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Maximum file size is 10 MB.`);
        return;
      }

      validFiles.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
        date: new Date().toLocaleDateString(),
      });
    });

    setFiles((previous) => {
      const newFiles = validFiles.filter(
        (newFile) =>
          !previous.some(
            (existingFile) => existingFile.id === newFile.id
          )
      );

      return [...previous, ...newFiles];
    });

    if (errors.length > 0) {
      setMessage({
        type: "error",
        text: errors.join(" "),
      });
    } else if (validFiles.length > 0) {
      setMessage({
        type: "success",
        text: "PDF files selected successfully.",
      });
    } else {
      setMessage({
        type: "error",
        text: "Please select a valid PDF file.",
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ------------------------------------------------
  // 2. DRAG AND DROP
  // ------------------------------------------------

  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    if (isUploading) return;

    handleFiles(event.dataTransfer.files);
  };

  // ------------------------------------------------
  // 3. REMOVE INDIVIDUAL FILE
  // ------------------------------------------------

  const removeFile = (id) => {
    if (isUploading) return;

    setFiles((previous) =>
      previous.filter((file) => file.id !== id)
    );
  };

  // ------------------------------------------------
  // 4. CLEAR ALL FILES
  // ------------------------------------------------

  const clearFiles = () => {
    if (isUploading) return;

    setFiles([]);
    setMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ------------------------------------------------
  // 5. UPLOAD FILES TO FASTAPI
  // ------------------------------------------------

  const handleUpload = async () => {
    if (isUploading) return;

    if (files.length === 0) {
      setMessage({
        type: "error",
        text: "Please select at least one PDF file.",
      });
      return;
    }

    if (!DOCUMENT_TYPES.includes(documentType)) {
      setMessage({
        type: "error",
        text: "Please select a valid document category.",
      });
      return;
    }

    setIsUploading(true);

    setMessage({
      type: "info",
      text: "Uploading your medical documents. Please wait...",
    });

    try {
      const formData = new FormData();

      files.forEach((item) => {
        formData.append("files", item.file);
      });

      // Send selected category with the PDF files.
      formData.append("document_type", documentType);

      const result = await apiRequest(
        "/api/documents/upload",
        "POST",
        formData
      );

      const uploadedCount =
        result.total_uploaded ??
        result.documents?.length ??
        files.length;

      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage({
        type: "success",
        text:
          result.message ||
          `${uploadedCount} document(s) uploaded successfully!`,
      });

    } catch (error) {
      console.error("Document upload error:", error);

      setMessage({
        type: "error",
        text:
          error.message ||
          "Document upload failed. Please try again.",
      });

    } finally {
      setIsUploading(false);
    }
  };

  // ------------------------------------------------
  // 6. MESSAGE STYLES
  // ------------------------------------------------

  const MessageIcon =
    message?.type === "error"
      ? AlertCircle
      : message?.type === "info"
        ? Info
        : CheckCircle2;

  const messageStyle = {
    error: "border border-rose-200 bg-rose-50 text-rose-800",
    info: "border border-blue-200 bg-blue-50 text-blue-800",
    success: "border border-teal-100 bg-teal-50 text-teal-800",
  };

  // ------------------------------------------------
  // 7. UI
  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      <div className="w-full min-w-0">

        {/* TOPBAR */}

        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Upload Reports
            </h2>

            <p className="text-xs text-slate-500">
              Upload and manage your medical records
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 sm:flex">
            <ShieldCheck size={16} />
            Private &amp; secure
          </div>

        </header>

        <div className="mx-auto max-w-none p-5 sm:p-8">

          {/* BACK BUTTON */}

          <button
            type="button"
            onClick={() => navigate("/patient/dashboard")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          {/* PAGE HEADING */}

          <div className="mb-8">

            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              MEDICAL RECORDS
            </span>

            <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Upload Medical Documents
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Upload your medical reports, prescriptions, laboratory
              reports and other medical documents in PDF format.
            </p>

          </div>

          {/* UPLOAD SECTION */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            {/* DOCUMENT CATEGORY */}

            <div className="mb-7 max-w-xl">

              <label
                htmlFor="documentType"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Document Category
                <span className="ml-1 text-rose-500">*</span>
              </label>

              <div className="relative">

                <select
                  id="documentType"
                  value={documentType}
                  onChange={(event) => {
                    setDocumentType(event.target.value);
                    setMessage(null);
                  }}
                  disabled={isUploading}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

              <p className="mt-2 text-xs text-slate-400">
                This category will be assigned to all files in this upload.
              </p>

            </div>

            {/* DROP AREA */}

            <div
              onDragOver={(event) => {
                event.preventDefault();

                if (!isUploading) {
                  setDragActive(true);
                }
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (!isUploading) {
                  fileInputRef.current?.click();
                }
              }}
              className={`rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-12 ${
                dragActive
                  ? "border-teal-600 bg-teal-50"
                  : "border-slate-300 bg-slate-50 hover:border-teal-500 hover:bg-teal-50/50"
              } ${
                isUploading
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <CloudUpload size={34} />
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                Drag and drop your files here
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Or click below to browse your device
              </p>

              <button
                type="button"
                disabled={isUploading}
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={17} />
                Browse Files
              </button>

              <p className="mt-4 text-xs text-slate-400">
                Supported format: PDF · Maximum size: 10 MB per file
              </p>

            </div>

            {/* FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              disabled={isUploading}
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />

            {/* NOTIFICATION */}

            {message && (
              <div
                role={message.type === "error" ? "alert" : "status"}
                aria-live="polite"
                className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${messageStyle[message.type]}`}
              >

                <MessageIcon size={18} className="mt-0.5 shrink-0" />

                <p className="flex-1">
                  {message.text}
                </p>

                <button
                  type="button"
                  onClick={() => setMessage(null)}
                  className="ml-auto"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>

              </div>
            )}

            {/* SELECTED DOCUMENTS */}

            <div className="mt-8">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="font-bold text-slate-800">
                  Selected Documents
                </h3>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {files.length} files
                </span>

              </div>

              {files.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">

                  <FolderOpen
                    size={30}
                    className="mx-auto mb-2 text-slate-300"
                  />

                  <p className="text-sm text-slate-500">
                    No documents selected yet.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {files.map((item) => (

                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
                    >

                      <div className="rounded-lg bg-red-50 p-3 text-red-600">
                        <FileText size={22} />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.size} MB · {item.date}
                        </p>

                      </div>

                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => removeFile(item.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* ACTION BUTTONS */}

            <div className="mt-7 flex flex-col justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">

              <button
                type="button"
                onClick={clearFiles}
                disabled={isUploading || files.length === 0}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isUploading ? (

                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Uploading...
                  </>

                ) : (

                  <>
                    <FileUp size={18} />
                    Upload Documents
                  </>

                )}

              </button>

            </div>

          </section>

          {/* PRIVACY INFORMATION */}

          <div className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <ShieldCheck
              size={22}
              className="shrink-0 text-blue-700"
            />

            <div>

              <h4 className="text-sm font-bold text-blue-900">
                Important Privacy Information
              </h4>

              <p className="mt-1 text-xs leading-5 text-blue-800">
                Your uploaded medical documents are stored securely
                on the MedSeg-RAG server and associated with your
                patient account. Only upload documents you own or
                are authorized to share. AI document analysis is
                not yet enabled.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
