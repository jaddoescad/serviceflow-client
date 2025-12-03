import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const refresh = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignUpWithPassword = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/hooks/useSupabaseBrowserClient", () => ({
  useSupabaseBrowserClient: () => ({}),
}));

vi.mock("@/services/auth", () => ({
  signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
  signUpWithPassword: (...args: unknown[]) => mockSignUpWithPassword(...args),
  signOut: vi.fn(),
}));

import { AuthForm } from "./auth-form";

describe.skip("AuthForm", () => {
  beforeEach(() => {
    refresh.mockReset();
    mockSignInWithPassword.mockReset();
    mockSignUpWithPassword.mockReset();
  });

  it("shows validation message when fields are empty", async () => {
    render(<AuthForm />);
    await userEvent.click(screen.getByRole("button", { name: /Sign in/i }));
    expect(await screen.findByText(/Please enter both an email and password/i)).toBeInTheDocument();
  });

  it("signs in successfully and refreshes", async () => {
    mockSignInWithPassword.mockResolvedValueOnce(undefined);
    render(<AuthForm />);
    await userEvent.type(screen.getByLabelText(/Email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /Sign in/i }));
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/Signed in successfully/i)).toBeInTheDocument();
  });

  it("handles sign-in error", async () => {
    mockSignInWithPassword.mockRejectedValueOnce(new Error("invalid"));
    render(<AuthForm />);
    await userEvent.type(screen.getByLabelText(/Email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /Sign in/i }));
    expect(await screen.findByText(/invalid|Something went wrong/i)).toBeInTheDocument();
  });

  it("signs up and prompts email confirmation (no session)", async () => {
    mockSignUpWithPassword.mockResolvedValueOnce({ hasSession: false });
    render(<AuthForm />);
    await userEvent.click(screen.getByRole("button", { name: /Need an account\? Sign up/i }));
    await userEvent.type(screen.getByLabelText(/Email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /Sign up/i }));
    expect(await screen.findByText(/Account created\. Sign in after confirming your email\./i)).toBeInTheDocument();
  });

  it("signs up with session and refreshes", async () => {
    mockSignUpWithPassword.mockResolvedValueOnce({ hasSession: true });
    render(<AuthForm />);
    await userEvent.click(screen.getByRole("button", { name: /Need an account\? Sign up/i }));
    await userEvent.type(screen.getByLabelText(/Email/i), "user@example.com");
    await userEvent.type(screen.getByLabelText(/Password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /Sign up/i }));
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/Account created\. You're signed in\./i)).toBeInTheDocument();
  });
});
