import "@testing-library/jest-dom/vitest";
import ReactModule from "react";
import TestUtils from "react-dom/test-utils";

// Silence Next.js server-only and client-only module warnings during tests
process.env.NEXT_TELEMETRY_DISABLED = "1";
try {
  const desc = Object.getOwnPropertyDescriptor(ReactModule, "act");
  if (!desc || typeof ReactModule.act !== "function") {
    Object.defineProperty(ReactModule, "act", {
      value: TestUtils.act,
      writable: true,
      enumerable: true,
      configurable: false,
    });
  }
} catch {}
