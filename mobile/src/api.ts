export const API_BASE_URL = "http://192.168.1.9:8000";

export async function checkBackend() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) throw new Error("Backend health check failed");
  return response.json();
}
