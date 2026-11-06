
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CloudUpload,
  FileText,
  FileUp,
  FolderOpen,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export default function MedicalDocumentUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState("");

  const handleFiles = (selectedFiles) => {
    const pdfFiles = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    pdfFiles.forEach((file) => {
      if (file.type !== "application/pdf") {
        errors.push(`${file.name}: Only PDF files are allowed.`);
      } else if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be below 10 MB.`);
      } else {
        validFiles.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2),
          date: new Date().toLocaleDateString(),
        });
      }
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

    setMessage(
      errors.length
        ? errors.join(" ")
        : validFiles.length
          ? "PDF files selected successfully!"
          : "Please select a PDF file."
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const removeFile = (id) => {
    setFiles((previous) =>
      previous.filter((file) => file.id !== id)
    );
  };

  const handleUpload = () => {
    if (files.length === 0) {
      setMessage("Please select at least one PDF file.");
      return;
    }

    setMessage(
      "Files are selected! Backend upload integration will be added in the next step."
    );
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Main Content */}
      <main className="w-full min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Upload Reports
            </h2>
            <p className="text-xs text-slate-500">
              Upload and manage your medical records
            </p>
          </div>

          <button className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
            <Bell size={20} />
          </button>
        </header>

        <div className="mx-auto max-w-none p-5 sm:p-8">
          <button
            onClick={() => navigate("/patient/dashboard")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700"
          > 
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

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

          {/* Upload Area */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-12 ${
                dragActive
                  ? "border-teal-600 bg-teal-50"
                  : "border-slate-300 bg-slate-50 hover:border-teal-500 hover:bg-teal-50/50"
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
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700"
              >
                <Upload size={17} />
                Browse Files
              </button>

              <p className="mt-4 text-xs text-slate-400">
                Supported format: PDF · Maximum size: 10 MB per file
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />

            {message && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-sm text-teal-800">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p>{message}</p>
                <button
                  onClick={() => setMessage("")}
                  className="ml-auto"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Selected Files */}
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
                        onClick={() => removeFile(item.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-col justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
              <button
                onClick={() => setFiles([])}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear All
              </button>

              <button
                onClick={handleUpload}
                disabled={files.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileUp size={18} />
                Upload Documents
              </button>
            </div>
          </section>

          {/* Information */}
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
                Upload only your own medical documents or records you are
                authorized to share. This screen currently provides a
                frontend preview; files are not yet stored on the server.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
