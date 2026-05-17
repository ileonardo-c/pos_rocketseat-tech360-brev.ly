import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { createQueryClient } from "@/lib/query-client";

export function createTestQueryClient() {
  const queryClient = createQueryClient();
  const currentDefaultOptions = queryClient.getDefaultOptions();

  queryClient.setDefaultOptions({
    ...currentDefaultOptions,
    queries: {
      ...currentDefaultOptions.queries,
      retry: false,
    },
    mutations: {
      ...currentDefaultOptions.mutations,
      retry: false,
    },
  });

  return queryClient;
}

export function createQueryWrapper(queryClient = createTestQueryClient()) {
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { Wrapper, queryClient };
}
