import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders with default title", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("ServiceFlow")).toBeInTheDocument();
  });

  it("renders with custom title", () => {
    render(<SiteHeader title="Custom Title" />);

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(<SiteHeader actions={<button type="button">Action</button>} />);

    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("renders mobile menu button when provided", () => {
    render(<SiteHeader mobileMenuButton={<button type="button">Menu</button>} />);

    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
  });
});
