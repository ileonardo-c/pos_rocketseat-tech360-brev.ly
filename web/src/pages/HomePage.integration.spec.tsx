import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "@/lib/http";
import { HomePage } from "@/pages/HomePage";
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

describe("HomePage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(http.get).mockResolvedValue({ data: [] } as never);
    vi.mocked(http.post).mockResolvedValue({ data: undefined } as never);
    vi.mocked(http.delete).mockResolvedValue({ data: undefined } as never);

    vi.spyOn(window, "open").mockImplementation(() => null);
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderPage() {
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>,
    );
  }

  function submitCreateForm(originalUrl: string, slug: string) {
    fireEvent.change(screen.getByLabelText(/link original/i), {
      target: { value: originalUrl },
    });
    fireEvent.change(screen.getByLabelText(/link encurtado/i), {
      target: { value: slug },
    });

    const submitButton = screen.getByRole("button", { name: /salvar link/i });
    const form = submitButton.closest("form");

    if (!form) {
      throw new Error("Expected create form");
    }

    fireEvent.submit(form);
  }

  it("creates a valid link", async () => {
    renderPage();

    await screen.findByText(/n.*o existem links cadastrados/i);

    submitCreateForm("https://example.com", "my-slug");

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith("/urls", {
        originalUrl: "https://example.com",
        slug: "my-slug",
      });
    });
  });

  it("shows duplicate slug message from status/field mapping", async () => {
    vi.mocked(http.post).mockRejectedValue({
      isAxiosError: true,
      message: "Request failed",
      response: {
        status: 409,
        data: {
          message: "Slug already exists",
          field: "slug",
        },
      },
    });

    renderPage();

    submitCreateForm("https://example.com", "existing");

    expect(await screen.findByText(/encurtamento.*existe/i)).toBeInTheDocument();
  });

  it("blocks malformed slug before requesting API", async () => {
    renderPage();

    submitCreateForm("https://example.com", "bad slug");

    expect(await screen.findByText(/Use apenas letras/i)).toBeInTheDocument();
    expect(http.post).not.toHaveBeenCalledWith("/urls", expect.anything());
  });

  it("deletes a link and exports csv", async () => {
    vi.mocked(http.get).mockImplementation(async (url: string) => {
      if (url === "/urls") {
        return {
          data: [
            {
              id: "1",
              originalUrl: "https://example.com",
              slug: "my-slug",
              accessCount: 2,
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        } as never;
      }

      if (url === "/urls/report") {
        return {
          data: {
            reportUrl: "https://signed.example/report.csv",
            expiresIn: 3600,
          },
        } as never;
      }

      throw new Error(`Unhandled GET ${url}`);
    });

    renderPage();

    await screen.findByText("brev.ly/my-slug");

    fireEvent.click(screen.getByRole("button", { name: /excluir link/i }));

    await waitFor(() => {
      expect(http.delete).toHaveBeenCalledWith("/urls/my-slug");
    });

    fireEvent.click(screen.getByRole("button", { name: /baixar csv/i }));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        "https://signed.example/report.csv",
        "_blank",
        "noopener,noreferrer",
      );
    });
  });
});
