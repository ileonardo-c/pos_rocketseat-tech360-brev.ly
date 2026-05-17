import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewLinkForm } from "./NewLinkForm";

describe("NewLinkForm", () => {
  it("validates slug format", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);

    render(<NewLinkForm onCreate={onCreate} isSubmitting={false} />);

    fireEvent.change(screen.getByPlaceholderText("https://www.exemplo.com"), {
      target: { value: "https://example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("meu-link"), {
      target: { value: "bad slug" },
    });

    fireEvent.click(screen.getByRole("button", { name: /salvar link/i }));

    expect(await screen.findByText(/Use apenas letras, números, _ e -./i)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("submits valid data", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);

    render(<NewLinkForm onCreate={onCreate} isSubmitting={false} />);

    const form = screen.getByRole("button", { name: /salvar link/i }).closest("form");
    expect(form).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("https://www.exemplo.com"), {
      target: { value: "https://example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("meu-link"), {
      target: { value: "my-slug" },
    });

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        originalUrl: "https://example.com",
        slug: "my-slug",
      });
    });
  });
});
