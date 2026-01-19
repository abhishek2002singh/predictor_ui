import API_ROUTES from "../config/routes";

// Create a proper API client with file upload support
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL || "http://localhost:5000";
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // For FormData requests, let the browser set the content-type
    let headers = { ...options.headers };
    
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle empty responses
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/admin/login";
        }
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: data,
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: data,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // Special method for file uploads with progress tracking
  upload(endpoint, formData, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Setup progress tracking BEFORE opening connection
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(Math.round(percentComplete));
          }
        });
      }
      
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            // Try to parse as text if not JSON
            resolve(xhr.responseText);
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || `Upload failed: ${xhr.statusText}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        }
      });
      
      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred"));
      });
      
      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was cancelled"));
      });
      
      // Open the connection FIRST
      xhr.open("POST", `${this.baseURL}${endpoint}`);
      
      // THEN set headers
      const token = localStorage.getItem("token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
      
      // Don't set Content-Type for FormData - let browser set it with boundary
      
      xhr.send(formData);
    });
  }

  // Alternative upload using fetch with progress (if XHR doesn't work)
  uploadWithFetch(endpoint, formData, onProgress) {
    return new Promise(async (resolve, reject) => {
      try {
        const token = localStorage.getItem("token");
        const headers = {};
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: 'POST',
          headers: headers,
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || 'Upload failed');
        }
        
        const data = await response.json();
        resolve(data);
        
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Create instance with base URL
export const apiClient = new ApiClient("http://localhost:7777");
export default apiClient;