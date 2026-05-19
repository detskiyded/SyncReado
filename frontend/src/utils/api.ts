export async function request(
  endpoint: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown>;
  },
) {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body =
    options?.body && options.method !== "GET"
      ? JSON.stringify(options.body)
      : undefined;

  const response = await fetch(`http://localhost:3000${endpoint}`, {
    method: options?.method,
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Error");
  }

  return await response.json();
}
