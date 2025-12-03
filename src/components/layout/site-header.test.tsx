import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/auth/sign-out-button", () => ({
  SignOutButton: () => <button type="button">Sign out</button>,
}));

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders the app branding", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("ServiceFlow")).toBeInTheDocument();
    expect(screen.getByText("Supabase Auth Starter")).toBeInTheDocument();
  });

  it("shows the sign out button without the test action", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Test" })).not.toBeInTheDocument();
  });
});
