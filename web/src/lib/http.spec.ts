import { describe, expect, it } from "vitest";
import { toAppError } from "@/lib/http";

describe("toAppError", () => {
  it("maps 400 to validation", () => {
    const result = toAppError(
      {
        isAxiosError: true,
        message: "Request failed",
        response: {
          status: 400,
          data: { message: "Invalid slug format", field: "slug" },
        },
      },
      { kind: "unknown", message: "fallback" },
    );

    expect(result).toMatchObject({
      kind: "validation",
      status: 400,
      field: "slug",
      message: "Invalid slug format",
    });
  });

  it("maps 409 to conflict", () => {
    const result = toAppError(
      {
        isAxiosError: true,
        message: "Request failed",
        response: {
          status: 409,
          data: { message: "Slug already exists", field: "slug" },
        },
      },
      { kind: "unknown", message: "fallback" },
    );

    expect(result).toMatchObject({
      kind: "conflict",
      status: 409,
      field: "slug",
    });
  });

  it("maps 404 to notFound", () => {
    const result = toAppError(
      {
        isAxiosError: true,
        message: "Request failed",
        response: {
          status: 404,
          data: { message: "Short URL not found" },
        },
      },
      { kind: "unknown", message: "fallback" },
    );

    expect(result).toMatchObject({
      kind: "notFound",
      status: 404,
    });
  });

  it("maps 5xx to server", () => {
    const result = toAppError(
      {
        isAxiosError: true,
        message: "Request failed",
        response: {
          status: 503,
          data: { message: "Internal server error" },
        },
      },
      { kind: "unknown", message: "fallback" },
    );

    expect(result).toMatchObject({
      kind: "server",
      status: 503,
    });
  });

  it("maps missing response to network", () => {
    const result = toAppError(
      {
        isAxiosError: true,
        message: "Network Error",
      },
      { kind: "unknown", message: "fallback" },
    );

    expect(result).toMatchObject({
      kind: "network",
      status: undefined,
      message: "Network Error",
    });
  });

  it("uses fallback for non-axios errors", () => {
    const result = toAppError(new Error("boom"), {
      kind: "unknown",
      message: "fallback",
    });

    expect(result).toEqual({
      kind: "unknown",
      message: "boom",
    });
  });
});
