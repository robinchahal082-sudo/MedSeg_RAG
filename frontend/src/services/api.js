
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

// --------------------------------------------------
// RESPONSE HANDLING
// --------------------------------------------------

async function readResponse(response) {
  const responseText = await response.text();

  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    if (response.ok) {
      throw new Error(
        `Backend returned an invalid response (HTTP ${response.status}).`
      );
    }

    return { detail: responseText };
  }
}

function getErrorMessage(result, status) {
  const detail = result?.detail;

  const message = Array.isArray(detail)
    ? detail.map((item) => item.msg || JSON.stringify(item)).join(", ")
    : detail || result?.message;

  return message || `Request failed (HTTP ${status}).`;
}

// --------------------------------------------------
// AUTHENTICATION HEADERS
// --------------------------------------------------

function getAuthHeaders() {
  const token = sessionStorage.getItem("access_token");
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// --------------------------------------------------
// BACKEND HEALTH CHECK
// --------------------------------------------------

export async function checkBackend() {
  const response = await fetch(`${API_BASE_URL}/health`);

  const result = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      `Backend health check failed (HTTP ${response.status}).`
    );
  }

  return result;
}

// --------------------------------------------------
// COMMON API REQUEST
// --------------------------------------------------

export async function apiRequest(
  endpoint,
  method = "GET",
  data = null
) {
  const isFormData =
    typeof FormData !== "undefined" && data instanceof FormData;

  const headers = getAuthHeaders();

  if (data !== null && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body:
      data === null
        ? null
        : isFormData
          ? data
          : JSON.stringify(data),
  });

  const result = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(result, response.status));
  }

  return result;
}

// --------------------------------------------------
// AUTHENTICATED DOCUMENT DOWNLOAD
// --------------------------------------------------

export async function downloadDocument(documentId, filename) {
  const response = await fetch(
    `${API_BASE_URL}/api/documents/${documentId}/download`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const result = await readResponse(response);
    throw new Error(getErrorMessage(result, response.status));
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = objectUrl;
  link.download =
    filename || `medical-document-${documentId}.pdf`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(objectUrl);
}

// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

export function logout() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("user");
}
