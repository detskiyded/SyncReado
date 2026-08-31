export async function request(
  endpoint: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown> | FormData;
  },
) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};

  const isFormData = options?.body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const body =
    options?.body && options.method !== "GET"
      ? isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
      : undefined;

  const response = await fetch(`http://localhost:3000${endpoint}`, {
    method: options?.method,
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.err || "Error");
  }

  return await response.json();
}
