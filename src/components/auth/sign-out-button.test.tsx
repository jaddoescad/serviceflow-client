import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refresh = vi.fn();
const mockSignOut = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/hooks/useSupabaseBrowserClient", () => ({
  useSupabaseBrowserClient: () => ({}),
}));

vi.mock("@/services/auth", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
  signInWithPassword: vi.fn(),
  signUpWithPassword: vi.fn(),
}));

import { SignOutButton } from "./sign-out-button";

describe.skip("SignOutButton", () => {
  beforeEach(() => {
    refresh.mockReset();
    mockSignOut.mockReset();
  });

  it("calls supabase signOut and refreshes on success", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    render(<SignOutButton />);
    await userEvent.click(screen.getByRole("button", { name: /Sign out/i }));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows error message when signOut fails", async () => {
    mockSignOut.mockRejectedValueOnce(new Error("boom"));
    render(<SignOutButton />);
    await userEvent.click(screen.getByRole("button", { name: /Sign out/i }));
    await waitFor(() => expect(screen.getByText(/Failed to sign out|boom/)).toBeInTheDocument());
  });
});
