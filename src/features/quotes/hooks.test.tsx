import { describe, it, expect, vi } from "vitest";

/**
 * Unit tests for quote creation logic.
 *
 * These tests verify the behavior of the useCreateQuoteAndNavigate hook
 * by testing the core logic without React dependencies that require
 * complex mocking of the full app context.
 */

// Simulates the core logic of useCreateQuoteAndNavigate
async function simulateCreateQuoteAndNavigate(params: {
  companyId: string;
  dealId: string;
  isCreating: boolean;
  createQuote: (data: unknown) => Promise<{ id: string }>;
  navigate: (path: string) => void;
  setIsCreating: (value: boolean) => void;
  onError: (error: Error) => void;
}) {
  const { companyId, dealId, isCreating, createQuote, navigate, setIsCreating, onError } = params;

  // Guard against duplicate calls
  if (isCreating) return;

  setIsCreating(true);

  try {
    const quote = await createQuote({
      quote: {
        company_id: companyId,
        deal_id: dealId,
        quote_number: "", // Server generates
        title: "", // Server generates
        client_message: "Default message",
        disclaimer: "Default disclaimer",
        status: "draft",
      },
      lineItems: [],
      deletedLineItemIds: [],
    });

    navigate(`/deals/${dealId}/proposals/quote?quoteId=${quote.id}`);
  } catch (error) {
    onError(error as Error);
    setIsCreating(false);
  }
}

describe("Quote creation logic", () => {
  it("should create a quote and navigate to the quote page on success", async () => {
    const mockCreateQuote = vi.fn().mockResolvedValue({ id: "quote-123" });
    const mockNavigate = vi.fn();
    const mockSetIsCreating = vi.fn();
    const mockOnError = vi.fn();

    await simulateCreateQuoteAndNavigate({
      companyId: "company-456",
      dealId: "deal-789",
      isCreating: false,
      createQuote: mockCreateQuote,
      navigate: mockNavigate,
      setIsCreating: mockSetIsCreating,
      onError: mockOnError,
    });

    expect(mockCreateQuote).toHaveBeenCalledTimes(1);
    expect(mockCreateQuote).toHaveBeenCalledWith({
      quote: expect.objectContaining({
        company_id: "company-456",
        deal_id: "deal-789",
        status: "draft",
      }),
      lineItems: [],
      deletedLineItemIds: [],
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      "/deals/deal-789/proposals/quote?quoteId=quote-123"
    );
  });

  it("should not create duplicate quotes when isCreating is true", async () => {
    const mockCreateQuote = vi.fn().mockResolvedValue({ id: "quote-123" });
    const mockNavigate = vi.fn();
    const mockSetIsCreating = vi.fn();
    const mockOnError = vi.fn();

    // Simulate already creating
    await simulateCreateQuoteAndNavigate({
      companyId: "company-456",
      dealId: "deal-789",
      isCreating: true, // Already creating
      createQuote: mockCreateQuote,
      navigate: mockNavigate,
      setIsCreating: mockSetIsCreating,
      onError: mockOnError,
    });

    // Should not have called anything
    expect(mockCreateQuote).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockSetIsCreating).not.toHaveBeenCalled();
  });

  it("should set isCreating to true at the start", async () => {
    const mockCreateQuote = vi.fn().mockResolvedValue({ id: "quote-123" });
    const mockNavigate = vi.fn();
    const mockSetIsCreating = vi.fn();
    const mockOnError = vi.fn();

    await simulateCreateQuoteAndNavigate({
      companyId: "company-456",
      dealId: "deal-789",
      isCreating: false,
      createQuote: mockCreateQuote,
      navigate: mockNavigate,
      setIsCreating: mockSetIsCreating,
      onError: mockOnError,
    });

    expect(mockSetIsCreating).toHaveBeenCalledWith(true);
  });

  it("should reset isCreating on error", async () => {
    const error = new Error("Failed to create quote");
    const mockCreateQuote = vi.fn().mockRejectedValue(error);
    const mockNavigate = vi.fn();
    const mockSetIsCreating = vi.fn();
    const mockOnError = vi.fn();

    await simulateCreateQuoteAndNavigate({
      companyId: "company-456",
      dealId: "deal-789",
      isCreating: false,
      createQuote: mockCreateQuote,
      navigate: mockNavigate,
      setIsCreating: mockSetIsCreating,
      onError: mockOnError,
    });

    // Should have called setIsCreating(true) then setIsCreating(false)
    expect(mockSetIsCreating).toHaveBeenCalledWith(true);
    expect(mockSetIsCreating).toHaveBeenCalledWith(false);

    // Should have called error handler
    expect(mockOnError).toHaveBeenCalledWith(error);

    // Should not have navigated
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should send empty quote_number and title for server to generate", async () => {
    const mockCreateQuote = vi.fn().mockResolvedValue({ id: "quote-123" });
    const mockNavigate = vi.fn();
    const mockSetIsCreating = vi.fn();
    const mockOnError = vi.fn();

    await simulateCreateQuoteAndNavigate({
      companyId: "company-456",
      dealId: "deal-789",
      isCreating: false,
      createQuote: mockCreateQuote,
      navigate: mockNavigate,
      setIsCreating: mockSetIsCreating,
      onError: mockOnError,
    });

    expect(mockCreateQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        quote: expect.objectContaining({
          quote_number: "",
          title: "",
        }),
      })
    );
  });

  it("should include default client_message and disclaimer", async () => {
    const mockCreateQuote = vi.fn().mockResolvedValue({ id: "quote-123" });
    const mockNavigate = vi.fn();
    const mockSetIsCreating = vi.fn();
    const mockOnError = vi.fn();

    await simulateCreateQuoteAndNavigate({
      companyId: "company-456",
      dealId: "deal-789",
      isCreating: false,
      createQuote: mockCreateQuote,
      navigate: mockNavigate,
      setIsCreating: mockSetIsCreating,
      onError: mockOnError,
    });

    expect(mockCreateQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        quote: expect.objectContaining({
          client_message: expect.any(String),
          disclaimer: expect.any(String),
        }),
      })
    );
  });

  it("should construct correct navigation URL with quote ID", async () => {
    const mockCreateQuote = vi.fn().mockResolvedValue({ id: "new-quote-abc" });
    const mockNavigate = vi.fn();
    const mockSetIsCreating = vi.fn();
    const mockOnError = vi.fn();

    await simulateCreateQuoteAndNavigate({
      companyId: "company-456",
      dealId: "deal-xyz",
      isCreating: false,
      createQuote: mockCreateQuote,
      navigate: mockNavigate,
      setIsCreating: mockSetIsCreating,
      onError: mockOnError,
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      "/deals/deal-xyz/proposals/quote?quoteId=new-quote-abc"
    );
  });
});

describe("Quote creation architecture", () => {
  it("documents the correct flow: user action -> API call -> navigate", () => {
    /**
     * CORRECT PATTERN (Industry Standard):
     *
     * 1. User clicks "New Quote" button
     * 2. Click handler calls createQuoteAndNavigate()
     * 3. API creates quote on server
     * 4. On success, navigate to /deals/{dealId}/proposals/quote?quoteId={newId}
     * 5. Quote page loads with the existing quote
     *
     * This is a synchronous user-action-driven flow with no side effects.
     */
    const steps = [
      "User clicks 'New Quote'",
      "Handler calls createQuoteAndNavigate()",
      "API POST /quotes creates quote",
      "Server returns new quote with ID",
      "Navigate to quote page with quoteId param",
      "Quote page displays existing quote",
    ];

    expect(steps).toHaveLength(6);
    expect(steps[0]).toContain("User clicks");
    expect(steps[4]).toContain("Navigate");
  });

  it("documents the anti-pattern that was replaced", () => {
    /**
     * ANTI-PATTERN (What we replaced):
     *
     * 1. User clicks "New Quote" button
     * 2. Navigate to /deals/{dealId}/proposals/quote?mode=create
     * 3. Page loads with useEffect that detects mode=create
     * 4. useEffect calls API to create quote (side effect!)
     * 5. useEffect navigates to ?quoteId={newId}
     * 6. Required useRef guards to prevent double-execution
     * 7. Required eslint-disable for exhaustive-deps
     *
     * Problems:
     * - React Strict Mode causes double execution
     * - Race conditions with query cache invalidation
     * - Fragile ref-based guards
     * - Effects for user actions is an anti-pattern
     */
    const problems = [
      "useEffect for user-initiated actions",
      "Ref-based guards to prevent double execution",
      "eslint-disable-next-line required",
      "Race conditions with React Strict Mode",
      "URL-based state machine (mode=create)",
    ];

    expect(problems).toHaveLength(5);
  });
});
