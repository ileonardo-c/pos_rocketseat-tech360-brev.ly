import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App routes", () => {
  it("renders not-found page for unknown route shape", () => {
    render(
      <MemoryRouter initialEntries={["/deep/unknown/path"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Link não encontrado/i)).toBeInTheDocument();
  });
});
