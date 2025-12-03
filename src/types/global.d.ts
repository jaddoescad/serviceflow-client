/* eslint-disable @typescript-eslint/no-explicit-any */
declare type GenericStringError = any;

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

declare module "npm:@supabase/supabase-js" {
  export * from "@supabase/supabase-js";
}

/**
 * Extend React Query mutation meta with custom error handling options
 */
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Custom title for error toast (overrides default) */
      errorTitle?: string;
      /** Skip the global error handler - use when mutation has custom error handling */
      skipGlobalErrorHandler?: boolean;
      /** Custom success message */
      successMessage?: string;
      /** Custom success title */
      successTitle?: string;
    };
  }
}
