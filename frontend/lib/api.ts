const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    credentials: "include",

    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

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
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });

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