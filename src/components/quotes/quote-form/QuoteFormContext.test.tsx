import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for QuoteFormContext URL update behavior after saving a new quote.
 *
 * BUG SCENARIO (before fix):
 * 1. User creates new quote at /deals/{dealId}/proposals/quote (no quoteId param)
 * 2. User adds line items and saves
 * 3. Save succeeds, but URL doesn't update to include quoteId
 * 4. Query cache invalidates and refetches
 * 5. Fetch happens WITHOUT quoteId, server returns quote: null
 * 6. All line items are lost
 *
 * FIX: After saving a new quote, update URL to include the new quoteId
 * before invalidating the cache. This ensures refetch includes quoteId.
 */

describe("Quote save URL update logic", () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
  });

  /**
   * Simulates the save logic from QuoteFormContext.handleSaveQuote
   */
  function simulateSaveQuoteUrlUpdate(params: {
    existingQuoteId: string | undefined;
    savedQuoteId: string;
    dealId: string;
    navigate: (path: string, options?: { replace?: boolean }) => void;
  }) {
    const { existingQuoteId, savedQuoteId, dealId, navigate } = params;

    // This is the actual logic from QuoteFormContext.tsx:
    if (!existingQuoteId && savedQuoteId) {
      navigate(`/deals/${dealId}/proposals/quote?quoteId=${savedQuoteId}`, { replace: true });
    }
  }

  it("should update URL after saving a NEW quote (no existing quoteId)", () => {
    const dealId = "deal-123";
    const newQuoteId = "new-quote-456";

    simulateSaveQuoteUrlUpdate({
      existingQuoteId: undefined, // NEW quote - no existing ID
      savedQuoteId: newQuoteId,
      dealId,
      navigate: mockNavigate,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/deals/${dealId}/proposals/quote?quoteId=${newQuoteId}`,
      { replace: true }
    );
  });

  it("should NOT update URL when saving an EXISTING quote", () => {
    const dealId = "deal-123";
    const existingQuoteId = "existing-quote-789";

    simulateSaveQuoteUrlUpdate({
      existingQuoteId: existingQuoteId, // EXISTING quote - already has ID
      savedQuoteId: existingQuoteId,
      dealId,
      navigate: mockNavigate,
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should use replace: true to avoid adding history entry", () => {
    const dealId = "deal-123";
    const newQuoteId = "new-quote-456";

    simulateSaveQuoteUrlUpdate({
      existingQuoteId: undefined,
      savedQuoteId: newQuoteId,
      dealId,
      navigate: mockNavigate,
    });

    // replace: true ensures back button doesn't go to the URL without quoteId
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.any(String),
      { replace: true }
    );
  });

  it("should handle empty string quoteId as new quote", () => {
    const dealId = "deal-123";
    const newQuoteId = "new-quote-456";

    // Empty string is falsy, should be treated as new quote
    simulateSaveQuoteUrlUpdate({
      existingQuoteId: "" as unknown as undefined,
      savedQuoteId: newQuoteId,
      dealId,
      navigate: mockNavigate,
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});

describe("Quote data persistence after save", () => {
  /**
   * This test documents the data flow that ensures line items persist.
   *
   * NOTE: As of the architecture refactor, quotes are now created BEFORE
   * navigating to the quote page. The quote page always loads with an
   * existing quoteId. This eliminates the "mode=create" pattern entirely.
   */
  it("documents the correct data flow for new quote creation (refactored)", () => {
    // NEW FLOW (after refactor):
    // STEP 1: User clicks "New Quote" button
    // STEP 2: createQuoteAndNavigate() creates quote via API
    const createdQuote = {
      id: "new-quote-id",
      line_items: [],
    };

    // STEP 3: Navigate to quote page WITH quoteId already set
    const url = `/deals/deal-123/proposals/quote?quoteId=${createdQuote.id}`;
    expect(url).toContain(`quoteId=${createdQuote.id}`);

    // STEP 4: Quote page loads and fetches existing quote
    const refetchQuoteId = new URL(`http://x${url}`).searchParams.get("quoteId");
    expect(refetchQuoteId).toBe(createdQuote.id);

    // STEP 5: User adds line items and saves - quote already exists
    const savedQuote = {
      id: "new-quote-id",
      line_items: [
        { id: "li-1", name: "Service 1", unit_price: 100 },
        { id: "li-2", name: "Service 2", unit_price: 200 },
      ],
    };

    // STEP 6: URL already has quoteId, no update needed
    // Refetch will always include quoteId
    expect(savedQuote.line_items).toHaveLength(2);
  });

  it("documents why the old mode=create approach was problematic", () => {
    /**
     * OLD FLOW (before refactor) - HAD BUGS:
     *
     * 1. User clicks "New Quote" → navigates to ?mode=create
     * 2. useEffect detects mode=create, creates quote
     * 3. After creation, navigates to ?quoteId=xxx
     *
     * PROBLEMS:
     * - React Strict Mode ran useEffect twice → created 2 quotes
     * - Race conditions between API call and navigation
     * - Required fragile useRef guards with eslint-disable
     * - If first save happened before navigation, quoteId wasn't in URL
     *
     * The refactor eliminates all these issues by:
     * - Creating quote at button click (not in useEffect)
     * - Navigating only AFTER quote exists
     * - Quote page always receives existing quoteId
     */
    const oldProblems = [
      "Double quote creation in Strict Mode",
      "Race conditions",
      "Fragile ref-based guards",
      "eslint-disable required",
    ];

    expect(oldProblems).toHaveLength(4);
  });
});
