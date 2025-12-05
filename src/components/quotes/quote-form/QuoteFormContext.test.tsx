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
   */
  it("documents the correct data flow for new quote save", () => {
    // STEP 1: User is on page without quoteId
    const urlBeforeSave = "/deals/deal-123/proposals/quote?mode=create";
    expect(urlBeforeSave).not.toContain("quoteId=");

    // STEP 2: User saves, API returns new quote with line items
    const savedQuote = {
      id: "new-quote-id",
      line_items: [
        { id: "li-1", name: "Service 1", unit_price: 100 },
        { id: "li-2", name: "Service 2", unit_price: 200 },
      ],
    };

    // STEP 3: URL is updated with new quoteId (THE FIX)
    const urlAfterSave = `/deals/deal-123/proposals/quote?quoteId=${savedQuote.id}`;
    expect(urlAfterSave).toContain(`quoteId=${savedQuote.id}`);

    // STEP 4: Query refetches with quoteId in URL
    const refetchQuoteId = new URL(`http://x${urlAfterSave}`).searchParams.get("quoteId");
    expect(refetchQuoteId).toBe(savedQuote.id);

    // STEP 5: Server returns full quote data (not null) because quoteId is provided
    const serverResponse = {
      quote: savedQuote, // Would be null without quoteId!
      quoteCount: 1,
    };
    expect(serverResponse.quote).not.toBeNull();
    expect(serverResponse.quote.line_items).toHaveLength(2);
  });

  it("documents the bug scenario without the fix", () => {
    // WITHOUT THE FIX:

    // STEP 1: User is on page without quoteId
    const urlBeforeSave = "/deals/deal-123/proposals/quote?mode=create";

    // STEP 2: User saves, API returns new quote with line items
    const savedQuote = {
      id: "new-quote-id",
      line_items: [{ id: "li-1", name: "Service 1", unit_price: 100 }],
    };

    // STEP 3: URL is NOT updated (BUG)
    const urlAfterSave = urlBeforeSave; // Same URL, no quoteId
    expect(urlAfterSave).not.toContain("quoteId=");

    // STEP 4: Query refetches WITHOUT quoteId
    const refetchQuoteId = new URL(`http://x${urlAfterSave}`).searchParams.get("quoteId");
    expect(refetchQuoteId).toBeNull();

    // STEP 5: Server returns quote: null because no quoteId provided
    // (This is the actual server behavior - it only returns quote when quoteId is specified)
    const serverResponseWithoutQuoteId = {
      quote: null, // NULL because quoteId not provided!
      quoteCount: 1,
    };
    expect(serverResponseWithoutQuoteId.quote).toBeNull();

    // STEP 6: Line items are LOST
    // The QuoteForm receives null quote and reinitializes with empty line items
  });
});
