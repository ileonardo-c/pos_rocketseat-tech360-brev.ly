import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NewLinkForm } from "@/components/NewLinkForm";

describe("NewLinkForm", () => {
  it("validates slug format", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);

    render(<NewLinkForm onCreate={onCreate} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText(/link original/i), {
      target: { value: "https://example.com" },
    });
    fireEvent.change(screen.getByLabelText(/link encurtado/i), {
      target: { value: "bad slug" },
    });

    fireEvent.click(screen.getByRole("button", { name: /salvar link/i }));

    expect(await screen.findByText(/Use apenas letras/i)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("submits valid data", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);

    render(<NewLinkForm onCreate={onCreate} isSubmitting={false} />);

    const form = screen.getByRole("button", { name: /salvar link/i }).closest("form");
    expect(form).toBeInTheDocument();
    if (!form) {
      throw new Error("Expected form to exist");
    }

    fireEvent.change(screen.getByLabelText(/link original/i), {
      target: { value: "https://example.com" },
    });
    fireEvent.change(screen.getByLabelText(/link encurtado/i), {
      target: { value: "my-slug" },
    });

    fireEvent.submit(form);

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        originalUrl: "https://example.com",
        slug: "my-slug",
      });
    });
  });
});
