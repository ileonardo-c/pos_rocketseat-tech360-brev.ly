import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/lib/http";
import { linkRepository } from "@/repositories/links.repository";

vi.mock("@/lib/http", async () => {
  const actual = await vi.importActual<typeof import("@/lib/http")>("@/lib/http");

  return {
    ...actual,
    http: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("linkRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a link using /urls endpoint", async () => {
    vi.mocked(http.post).mockResolvedValue({ data: undefined } as never);

    await linkRepository.create({
      originalUrl: "https://example.com",
      slug: "example-slug",
    });

    expect(http.post).toHaveBeenCalledWith("/urls", {
      originalUrl: "https://example.com",
      slug: "example-slug",
    });
  });

  it("maps listAll response to domain model", async () => {
    vi.mocked(http.get).mockResolvedValue({
      data: [
        {
          id: "1",
          originalUrl: "https://example.com",
          slug: "example-slug",
          accessCount: 10,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    } as never);

    const links = await linkRepository.listAll();

    expect(links).toEqual([
      {
        id: "1",
        originalUrl: "https://example.com",
        slug: "example-slug",
        accessCount: 10,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("propagates http failures from repository methods", async () => {
    const networkError = new Error("Network failed");
    vi.mocked(http.delete).mockRejectedValue(networkError);

    await expect(linkRepository.deleteBySlug("broken")).rejects.toThrow("Network failed");
  });
});
