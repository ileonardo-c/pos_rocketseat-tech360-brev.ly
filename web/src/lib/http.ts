import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333",
  headers: {
    "Content-Type": "application/json",
  },
});

export type AppErrorKind =
  | "validation"
  | "conflict"
  | "notFound"
  | "network"
  | "server"
  | "unknown";

export interface AppError {
  kind: AppErrorKind;
  message: string;
  field?: string;
  status?: number;
}

interface FallbackError {
  kind: AppErrorKind;
  message: string;
}

function resolveKind(status: number | undefined, fallbackKind: AppErrorKind): AppErrorKind {
  if (status === 400) {
    return "validation";
  }
  if (status === 409) {
    return "conflict";
  }
  if (status === 404) {
    return "notFound";
  }
  if (status === 0 || status === undefined) {
    return "network";
  }
  if (status >= 500) {
    return "server";
  }
  return fallbackKind;
}

export function toAppError(error: unknown, fallback: FallbackError): AppError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const response =
      typeof data === "object" && data !== null ? (data as Record<string, unknown>) : undefined;

    return {
      kind: resolveKind(status, fallback.kind),
      message:
        typeof response?.message === "string"
          ? response.message
          : error.message || fallback.message,
      field: typeof response?.field === "string" ? response.field : undefined,
      status,
    };
  }

  if (error instanceof Error) {
    return {
      kind: fallback.kind,
      message: error.message || fallback.message,
    };
  }

  return {
    kind: fallback.kind,
    message: fallback.message,
  };
}
