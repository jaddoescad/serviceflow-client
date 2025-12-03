import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "./sidebar";

describe.skip("Sidebar", () => {
  it("renders sidebar navigation and static items", () => {
    render(<Sidebar />);
    expect(screen.getByLabelText("Sidebar navigation")).toBeInTheDocument();
    expect(screen.getByText("ServiceFlow")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Company Settings/i })).toBeDisabled();
    expect(screen.getByText(/Sales Pipeline/i)).toBeInTheDocument();
  });
});
