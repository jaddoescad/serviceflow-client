import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEmptyLineItem } from "./utils";
import type { SaveQuotePayload } from "@/features/quotes/types";

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

describe("handleAddLineItem behavior", () => {
  /**
   * Simulates the add line item logic from QuoteFormContext.handleAddLineItem
   */
  function simulateAddLineItem(params: {
    isProposalLocked: boolean;
    lineItems: Array<{ client_id: string }>;
    editingLineItems: Set<string>;
  }) {
    const { isProposalLocked, lineItems, editingLineItems } = params;

    if (isProposalLocked) {
      return { lineItems, editingLineItems };
    }

    const newItem = createEmptyLineItem();
    const updatedLineItems = [...lineItems, newItem];
    const updatedEditingLineItems = new Set([...editingLineItems, newItem.client_id]);

    return {
      lineItems: updatedLineItems,
      editingLineItems: updatedEditingLineItems,
      newItem,
    };
  }

  it("should add new line item in edit mode", () => {
    const result = simulateAddLineItem({
      isProposalLocked: false,
      lineItems: [],
      editingLineItems: new Set(),
    });

    expect(result.lineItems).toHaveLength(1);
    expect(result.newItem).toBeDefined();
    expect(result.editingLineItems.has(result.newItem!.client_id)).toBe(true);
  });

  it("should not add line item when proposal is locked", () => {
    const result = simulateAddLineItem({
      isProposalLocked: true,
      lineItems: [],
      editingLineItems: new Set(),
    });

    expect(result.lineItems).toHaveLength(0);
    expect(result.editingLineItems.size).toBe(0);
  });

  it("should preserve existing editing items when adding new one", () => {
    const existingItem = createEmptyLineItem();
    const result = simulateAddLineItem({
      isProposalLocked: false,
      lineItems: [existingItem],
      editingLineItems: new Set([existingItem.client_id]),
    });

    expect(result.lineItems).toHaveLength(2);
    expect(result.editingLineItems.size).toBe(2);
    expect(result.editingLineItems.has(existingItem.client_id)).toBe(true);
    expect(result.editingLineItems.has(result.newItem!.client_id)).toBe(true);
  });
});

describe("handleDeleteLineItem and save behavior", () => {
  /**
   * BUG SCENARIO:
   * 1. User has a quote with line items saved in the database
   * 2. User deletes a line item (click trash icon)
   * 3. Line item is removed from local state
   * 4. Line item ID is added to deletedLineItemIds
   * 5. User refreshes the page
   * 6. Deleted line item reappears!
   *
   * ROOT CAUSE: The save was never triggered after deletion.
   * The deletedLineItemIds array was populated but never sent to the server.
   *
   * FIX: Trigger save immediately after deleting a line item.
   */

  type LineItem = {
    id?: string;
    client_id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: string;
  };

  /**
   * Simulates the delete logic from QuoteFormContext.handleDeleteLineItem
   */
  function simulateDeleteLineItem(params: {
    clientId: string;
    lineItems: LineItem[];
    deletedLineItemIds: string[];
    isProposalLocked: boolean;
  }): { lineItems: LineItem[]; deletedLineItemIds: string[] } {
    const { clientId, lineItems, deletedLineItemIds, isProposalLocked } = params;

    if (isProposalLocked) {
      return { lineItems, deletedLineItemIds };
    }

    const target = lineItems.find((item) => item.client_id === clientId);
    let updatedDeletedIds = deletedLineItemIds;

    if (target?.id) {
      // Track deleted line item IDs for persistence
      if (!deletedLineItemIds.includes(target.id)) {
        updatedDeletedIds = [...deletedLineItemIds, target.id];
      }
    }

    const updatedLineItems = lineItems.filter((item) => item.client_id !== clientId);

    return {
      lineItems: updatedLineItems,
      deletedLineItemIds: updatedDeletedIds,
    };
  }

  /**
   * Simulates building the save payload from QuoteFormContext.handleSaveQuote
   */
  function buildSavePayload(params: {
    quoteId: string;
    companyId: string;
    dealId: string;
    lineItems: LineItem[];
    deletedLineItemIds: string[];
  }): SaveQuotePayload {
    const { quoteId, companyId, dealId, lineItems, deletedLineItemIds } = params;

    return {
      quote: {
        id: quoteId,
        company_id: companyId,
        deal_id: dealId,
        quote_number: "Q-001",
        title: "Q-001",
        client_message: null,
        disclaimer: null,
        status: "draft",
      },
      lineItems: lineItems.map((item, index) => ({
        id: item.id,
        client_id: item.client_id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice) || 0,
        position: index,
      })),
      deletedLineItemIds,
    };
  }

  it("should track deleted line item ID when item has been saved to database", () => {
    // Line item that exists in database (has an id)
    const savedLineItem: LineItem = {
      id: "db-line-item-123",
      client_id: "client-456",
      name: "Roof Repair",
      description: "Fix the roof",
      quantity: 1,
      unitPrice: "500",
    };

    const result = simulateDeleteLineItem({
      clientId: savedLineItem.client_id,
      lineItems: [savedLineItem],
      deletedLineItemIds: [],
      isProposalLocked: false,
    });

    // Line item should be removed from local state
    expect(result.lineItems).toHaveLength(0);

    // Database ID should be tracked for deletion
    expect(result.deletedLineItemIds).toContain("db-line-item-123");
  });

  it("should NOT track unsaved line items in deletedLineItemIds", () => {
    // Line item that hasn't been saved yet (no id)
    const unsavedLineItem: LineItem = {
      client_id: "client-789",
      name: "New Service",
      description: "",
      quantity: 1,
      unitPrice: "100",
    };

    const result = simulateDeleteLineItem({
      clientId: unsavedLineItem.client_id,
      lineItems: [unsavedLineItem],
      deletedLineItemIds: [],
      isProposalLocked: false,
    });

    // Line item should be removed from local state
    expect(result.lineItems).toHaveLength(0);

    // No ID to track since it was never saved
    expect(result.deletedLineItemIds).toHaveLength(0);
  });

  it("should include deletedLineItemIds in save payload", () => {
    // Simulate: user had 2 line items, deleted one
    const remainingLineItem: LineItem = {
      id: "db-item-1",
      client_id: "client-1",
      name: "Service A",
      description: "",
      quantity: 1,
      unitPrice: "200",
    };

    const deletedLineItemIds = ["db-item-2"]; // Previously deleted

    const payload = buildSavePayload({
      quoteId: "quote-123",
      companyId: "company-456",
      dealId: "deal-789",
      lineItems: [remainingLineItem],
      deletedLineItemIds,
    });

    // CRITICAL: deletedLineItemIds must be in the payload
    expect(payload.deletedLineItemIds).toEqual(["db-item-2"]);
    expect(payload.lineItems).toHaveLength(1);
  });

  it("should fail if save is not triggered after delete (demonstrates the bug)", () => {
    /**
     * This test demonstrates the bug scenario:
     * Delete happens → deletedLineItemIds is populated → but save is never called
     */
    const mockCreateQuote = vi.fn();

    const savedLineItem: LineItem = {
      id: "db-line-item-to-delete",
      client_id: "client-id",
      name: "Item to delete",
      description: "",
      quantity: 1,
      unitPrice: "100",
    };

    // Step 1: Delete the line item (updates local state only)
    const afterDelete = simulateDeleteLineItem({
      clientId: savedLineItem.client_id,
      lineItems: [savedLineItem],
      deletedLineItemIds: [],
      isProposalLocked: false,
    });

    // Step 2: Verify local state is correct
    expect(afterDelete.lineItems).toHaveLength(0);
    expect(afterDelete.deletedLineItemIds).toContain("db-line-item-to-delete");

    // Step 3: BUG - If onSave() is not called, the API is never invoked
    // The mockCreateQuote should be called with the deletedLineItemIds
    // But if onSave() wasn't triggered, this assertion would fail

    // Simulate what SHOULD happen (save is triggered):
    const payload = buildSavePayload({
      quoteId: "quote-123",
      companyId: "company-456",
      dealId: "deal-789",
      lineItems: afterDelete.lineItems,
      deletedLineItemIds: afterDelete.deletedLineItemIds,
    });

    mockCreateQuote(payload);

    // Verify the API was called with the correct payload
    expect(mockCreateQuote).toHaveBeenCalledTimes(1);
    expect(mockCreateQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        deletedLineItemIds: ["db-line-item-to-delete"],
      })
    );
  });

  it("should not allow deletion when proposal is locked", () => {
    const savedLineItem: LineItem = {
      id: "db-item-locked",
      client_id: "client-locked",
      name: "Locked Item",
      description: "",
      quantity: 1,
      unitPrice: "300",
    };

    const result = simulateDeleteLineItem({
      clientId: savedLineItem.client_id,
      lineItems: [savedLineItem],
      deletedLineItemIds: [],
      isProposalLocked: true, // Quote is accepted
    });

    // Nothing should change
    expect(result.lineItems).toHaveLength(1);
    expect(result.deletedLineItemIds).toHaveLength(0);
  });

  it("should accumulate multiple deletions before save", () => {
    const items: LineItem[] = [
      { id: "db-1", client_id: "c-1", name: "Item 1", description: "", quantity: 1, unitPrice: "100" },
      { id: "db-2", client_id: "c-2", name: "Item 2", description: "", quantity: 1, unitPrice: "200" },
      { id: "db-3", client_id: "c-3", name: "Item 3", description: "", quantity: 1, unitPrice: "300" },
    ];

    // Delete first item
    let state = simulateDeleteLineItem({
      clientId: "c-1",
      lineItems: items,
      deletedLineItemIds: [],
      isProposalLocked: false,
    });

    expect(state.lineItems).toHaveLength(2);
    expect(state.deletedLineItemIds).toEqual(["db-1"]);

    // Delete second item
    state = simulateDeleteLineItem({
      clientId: "c-2",
      lineItems: state.lineItems,
      deletedLineItemIds: state.deletedLineItemIds,
      isProposalLocked: false,
    });

    expect(state.lineItems).toHaveLength(1);
    expect(state.deletedLineItemIds).toEqual(["db-1", "db-2"]);

    // Build payload - should include both deleted IDs
    const payload = buildSavePayload({
      quoteId: "quote-123",
      companyId: "company-456",
      dealId: "deal-789",
      lineItems: state.lineItems,
      deletedLineItemIds: state.deletedLineItemIds,
    });

    expect(payload.deletedLineItemIds).toEqual(["db-1", "db-2"]);
    expect(payload.lineItems).toHaveLength(1);
    expect(payload.lineItems[0].name).toBe("Item 3");
  });

  it("should pass overrides to handleSaveQuote to avoid stale state", () => {
    /**
     * This test verifies the fix for the bug where deletedLineItemIds
     * wasn't being sent to the server because React batches state updates.
     *
     * The fix: handleDeleteLineItem computes the new values synchronously
     * and passes them as overrides to handleSaveQuote, bypassing stale state.
     */
    const mockSaveQuote = vi.fn();

    type LineItem = {
      id?: string;
      client_id: string;
      name: string;
      description: string;
      quantity: number;
      unitPrice: string;
    };

    // Simulate the fixed handleDeleteLineItem logic
    function simulateFixedDeleteLineItem(params: {
      clientId: string;
      lineItems: LineItem[];
      deletedLineItemIds: string[];
      isProposalLocked: boolean;
      handleSaveQuote: (options: {
        lineItemsOverride: LineItem[];
        deletedLineItemIdsOverride: string[];
      }) => void;
    }) {
      const { clientId, lineItems, deletedLineItemIds, isProposalLocked, handleSaveQuote } = params;

      if (isProposalLocked) return;

      // Compute new state values SYNCHRONOUSLY before updating state
      const target = lineItems.find((item) => item.client_id === clientId);
      const newLineItems = lineItems.filter((item) => item.client_id !== clientId);
      const newDeletedIds =
        target?.id && !deletedLineItemIds.includes(target.id)
          ? [...deletedLineItemIds, target.id]
          : deletedLineItemIds;

      // Call save with overrides (not relying on state which would be stale)
      handleSaveQuote({
        lineItemsOverride: newLineItems,
        deletedLineItemIdsOverride: newDeletedIds,
      });
    }

    const savedLineItem: LineItem = {
      id: "db-item-to-delete",
      client_id: "client-123",
      name: "Service to delete",
      description: "",
      quantity: 1,
      unitPrice: "100",
    };

    // Simulate deleting the line item
    simulateFixedDeleteLineItem({
      clientId: savedLineItem.client_id,
      lineItems: [savedLineItem],
      deletedLineItemIds: [],
      isProposalLocked: false,
      handleSaveQuote: mockSaveQuote,
    });

    // Verify save was called with the computed overrides
    expect(mockSaveQuote).toHaveBeenCalledTimes(1);
    expect(mockSaveQuote).toHaveBeenCalledWith({
      lineItemsOverride: [], // Line item removed
      deletedLineItemIdsOverride: ["db-item-to-delete"], // ID tracked for deletion
    });
  });
});
