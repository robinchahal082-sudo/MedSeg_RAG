
const API_BASE_URL = "http://127.0.0.1:8000";

// Check backend connection
export async function checkBackend() {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
        throw new Error("Backend unavailable");
    }

    return response.json();
}

// Common API request function
export async function apiRequest(endpoint, method = "GET", data = null) {
    const token = sessionStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.detail || "Something went wrong");
    }

    return result;
}

// Logout function
export function logout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
}
