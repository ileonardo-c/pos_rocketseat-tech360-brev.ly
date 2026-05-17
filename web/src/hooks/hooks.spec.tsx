import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCreateLink } from "@/hooks/useCreateLink";
import { useDeleteLink } from "@/hooks/useDeleteLink";
import { useExportLinksCsv } from "@/hooks/useExportLinksCsv";
import { useIncrementAccess } from "@/hooks/useIncrementAccess";
import { useListLinks } from "@/hooks/useListLinks";
import { useResolveLink } from "@/hooks/useResolveLink";
import type { LinkRepository } from "@/repositories/links.repository";
import { createQueryWrapper } from "@/test/query-wrapper";

function buildRepositoryMock(overrides?: Partial<LinkRepository>): LinkRepository {
  return {
    create: vi.fn().mockResolvedValue(undefined),
    deleteBySlug: vi.fn().mockResolvedValue(undefined),
    resolveBySlug: vi.fn().mockResolvedValue({ fullUrl: "https://example.com" }),
    listAll: vi.fn().mockResolvedValue([]),
    incrementAccess: vi.fn().mockResolvedValue(undefined),
    exportCsv: vi.fn().mockResolvedValue({
      reportUrl: "https://signed.example/report.csv",
      expiresIn: 3600,
    }),
    ...overrides,
  };
}

describe("link hooks", () => {
  it("loads links through repository", async () => {
    const repository = buildRepositoryMock({
      listAll: vi.fn().mockResolvedValue([
        {
          id: "1",
          originalUrl: "https://example.com",
          slug: "example-slug",
          accessCount: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    });
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useListLinks({ repository }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      {
        id: "1",
        originalUrl: "https://example.com",
        slug: "example-slug",
        accessCount: 1,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("normalizes mutation errors using status and field", async () => {
    const repository = buildRepositoryMock({
      create: vi.fn().mockRejectedValue({
        isAxiosError: true,
        message: "Request failed",
        response: {
          status: 409,
          data: {
            message: "Slug already exists",
            field: "slug",
          },
        },
      }),
    });
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useCreateLink({ repository }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          originalUrl: "https://example.com",
          slug: "existing-slug",
        }),
      ).rejects.toMatchObject({
        kind: "conflict",
        status: 409,
        field: "slug",
      });
    });

    await waitFor(() => {
      expect(result.current.error).toMatchObject({
        kind: "conflict",
        status: 409,
        field: "slug",
      });
    });
  });

  it("invalidates links cache on successful create and delete", async () => {
    const repository = buildRepositoryMock();
    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const createHook = renderHook(() => useCreateLink({ repository }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await createHook.result.current.mutateAsync({
        originalUrl: "https://example.com",
        slug: "new-slug",
      });
    });

    const deleteHook = renderHook(() => useDeleteLink({ repository }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await deleteHook.result.current.mutateAsync({ slug: "new-slug" });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["links"] });
  });

  it("maps resolve 404 as notFound", async () => {
    const repository = buildRepositoryMock({
      resolveBySlug: vi.fn().mockRejectedValue({
        isAxiosError: true,
        message: "Not found",
        response: {
          status: 404,
          data: {
            message: "Link not found",
          },
        },
      }),
    });
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useResolveLink({ repository }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(result.current.mutateAsync({ slug: "missing" })).rejects.toMatchObject({
        kind: "notFound",
        status: 404,
      });
    });
  });

  it("calls increment access through repository", async () => {
    const incrementAccess = vi.fn().mockResolvedValue(undefined);
    const repository = buildRepositoryMock({
      incrementAccess,
    });
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useIncrementAccess({ repository }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ slug: "my-slug" });
    });

    expect(incrementAccess).toHaveBeenCalledWith("my-slug");
  });

  it("returns signed report url on export", async () => {
    const exportCsv = vi.fn().mockResolvedValue({
      reportUrl: "https://signed.example/report.csv",
      expiresIn: 3600,
    });
    const repository = buildRepositoryMock({
      exportCsv,
    });
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useExportLinksCsv({ repository }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const response = await result.current.mutateAsync();

      expect(response).toEqual({
        reportUrl: "https://signed.example/report.csv",
        expiresIn: 3600,
      });
    });
  });
});
