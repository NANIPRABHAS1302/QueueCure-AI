// Frontend API Service Wrapper

const envUrl = import.meta.env.VITE_API_URL;
const BASE_URL = envUrl 
    ? (envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`)
    : "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem("queuecure_token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    if (options.body && typeof options.body === "object") {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;
    } catch (error) {
        console.error(`API Error in ${endpoint}:`, error.message);
        throw error;
    }
};

export const api = {
    get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
    post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "POST", body }),
    put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "PUT", body }),
    delete: (endpoint, options = {}) => request(endpoint, { ...options, method: "DELETE" }),
};
