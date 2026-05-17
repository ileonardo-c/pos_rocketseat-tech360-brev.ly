import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/lib/http";
import { RedirectPage } from "@/pages/RedirectPage";
import { createTestQueryClient } from "@/test/query-wrapper";

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

describe("RedirectPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderRedirect(initialPath: string) {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/:slug" element={<RedirectPage />} />
            <Route path="/not-found" element={<div>Not Found Route</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  it("resolves slug, increments access and redirects", async () => {
    vi.mocked(http.get).mockResolvedValueOnce({
      data: { fullUrl: "https://example.com/target" },
    } as never);
    vi.mocked(http.post).mockResolvedValueOnce({ data: undefined } as never);

    renderRedirect("/my-slug");

    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith("/urls/my-slug");
    });

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith("/urls/my-slug/increment");
    });

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith("https://example.com/target", "_self");
    });
  });

  it("navigates to not-found when slug does not exist", async () => {
    vi.mocked(http.get).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404, data: { message: "Not found" } },
    });

    renderRedirect("/missing");

    expect(await screen.findByText("Not Found Route")).toBeInTheDocument();
  });
});
