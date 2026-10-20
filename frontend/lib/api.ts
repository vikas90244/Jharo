const API_URL = process.env.NEXT_PUBLIC_API_URL!;

let refreshRequest: Promise<boolean> | null = null;

function canRefreshFor(endpoint: string): boolean {
  return !/^\/auth\/(login|register|refresh|logout|verify)(\/|$)/.test(endpoint);
}

async function refreshSession(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_URL}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}

async function fetchWithAuthRetry(endpoint: string, options: RequestInit = {}) {
  const send = () => fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });

  const response = await send();
  if (response.status === 401 && canRefreshFor(endpoint)) {
    const refreshed = await refreshSession();
    if (refreshed) return send();
  }
  return response;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchWithAuthRetry(endpoint, { ...options, headers });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.error ||
      data?.detail ||
      "Something went wrong! Please try again ",
      response.status,
      data
    );
  }

  return data;
}


export async function apiBlob(
  endpoint: string,
  options: RequestInit = {},
): Promise<Blob> {
  const response = await fetchWithAuthRetry(endpoint, options);

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new ApiError(
      data?.error ||
        data?.detail ||
        "Something went wrong! Please try again",
      response.status,
      data
    );
  }

  return response.blob();
}
