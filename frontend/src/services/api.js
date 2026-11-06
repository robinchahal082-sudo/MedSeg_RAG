const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

async function readResponse(response) {
  const responseText = await response.text();

  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    if (response.ok) {
      throw new Error(`Backend returned an invalid response (HTTP ${response.status}).`);
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

export async function checkBackend() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error(`Backend health check failed (HTTP ${response.status}).`);
  }

  return readResponse(response);
}

export async function apiRequest(endpoint, method = "GET", data = null) {
  const token = sessionStorage.getItem("access_token");
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
  const headers = {};

  if (data !== null && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: data === null ? null : isFormData ? data : JSON.stringify(data),
  });
  const result = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(result, response.status));
  }

  return result;
}

export function logout() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("user");
}
