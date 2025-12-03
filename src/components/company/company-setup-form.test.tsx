import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refresh = vi.fn();
const mockCreateOrganization = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/hooks/useSupabaseBrowserClient", () => ({
  useSupabaseBrowserClient: () => ({}),
}));

vi.mock("@/services/companies", () => ({
  createOrganization: (...args: unknown[]) => mockCreateOrganization(...args),
  updateCompanySettings: vi.fn(),
}));

vi.mock("@/lib/urls", async () => {
  const actual = await vi.importActual<typeof import("@/lib/urls")>("@/lib/urls");
  return {
    ...actual,
    normalizeWebsiteUrl: (url: string) => {
      if (url.trim() === "") return null;
      if (url.includes("bad")) throw new Error("bad url");
      return url.startsWith("http") ? url : `https://${url}`;
    },
  };
});

import { CompanySetupForm } from "./company-setup-form";

describe.skip("CompanySetupForm", () => {
  beforeEach(() => {
    refresh.mockReset();
    mockCreateOrganization.mockReset();
  });

  const fillRequired = async () => {
    await userEvent.type(screen.getByLabelText(/Company name/i), "Painter Pros");
    await userEvent.type(screen.getByLabelText(/Owner first name/i), "Alex");
    await userEvent.type(screen.getByLabelText(/Owner last name/i), "Lee");
    await userEvent.type(screen.getByLabelText(/Number of employees/i), "5");
    await userEvent.type(screen.getByLabelText(/Phone number/i), "555-123-4567");
  };

  it("validates required fields", async () => {
    render(<CompanySetupForm userId="u1" email="user@example.com" />);
    await userEvent.click(screen.getByRole("button", { name: /Create organization/i }));
    expect(await screen.findByText(/Please fill in all required fields/i)).toBeInTheDocument();
  });

  it("validates employee count", async () => {
    render(<CompanySetupForm userId="u1" email="user@example.com" />);
    await userEvent.type(screen.getByLabelText(/Company name/i), "Painter Pros");
    await userEvent.type(screen.getByLabelText(/Owner first name/i), "Alex");
    await userEvent.type(screen.getByLabelText(/Owner last name/i), "Lee");
    await userEvent.type(screen.getByLabelText(/Phone number/i), "555-123-4567");
    await userEvent.type(screen.getByLabelText(/Number of employees/i), "-1");
    await userEvent.click(screen.getByRole("button", { name: /Create organization/i }));
    expect(await screen.findByText(/non-negative whole number/i)).toBeInTheDocument();
  });

  it("validates website url", async () => {
    render(<CompanySetupForm userId="u1" email="user@example.com" />);
    await fillRequired();
    await userEvent.type(screen.getByLabelText(/Company website/i), "bad url");
    await userEvent.click(screen.getByRole("button", { name: /Create organization/i }));
    expect(await screen.findByText(/Please enter a valid website URL/i)).toBeInTheDocument();
  });

  it("requires email to proceed", async () => {
    render(<CompanySetupForm userId="u1" email={null} />);
    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: /Create organization/i }));
    expect(await screen.findByText(/could not determine your sign-up email/i)).toBeInTheDocument();
  });

  it("inserts organization and refreshes on success", async () => {
    mockCreateOrganization.mockResolvedValueOnce("org-id-123");
    render(<CompanySetupForm userId="u1" email="user@example.com" />);
    await fillRequired();
    await userEvent.type(screen.getByLabelText(/Company website/i), "example.com");
    await userEvent.click(screen.getByRole("button", { name: /Create organization/i }));
    await waitFor(() => expect(mockCreateOrganization).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows insert error from supabase", async () => {
    mockCreateOrganization.mockRejectedValueOnce(new Error("db fail"));
    render(<CompanySetupForm userId="u1" email="user@example.com" />);
    await fillRequired();
    await userEvent.click(screen.getByRole("button", { name: /Create organization/i }));
    expect(await screen.findByText(/db fail|Could not save organization information/i)).toBeInTheDocument();
  });
});
