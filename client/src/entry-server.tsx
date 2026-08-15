import { QueryClient, QueryClientProvider, dehydrate } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React from "react";
import { renderToString } from "react-dom/server";
import superjson from "superjson";
import { Router } from "wouter";
import { trpc } from "@/lib/trpc";
import { getSeoMeta, type SeoMeta } from "@shared/seo-content";
import PublicApp from "./PublicApp";

export type RenderResult = { html: string; dehydratedState: unknown; head: SeoMeta; shell: boolean };
export async function render(url: string): Promise<RenderResult> {
  const head = getSeoMeta(url);
  if (head.noindex) return { html: "", dehydratedState: {}, head, shell: true };
  const pathIndex = url.indexOf("?"); const ssrPath = pathIndex === -1 ? url : url.slice(0, pathIndex); const ssrSearch = pathIndex === -1 ? "" : url.slice(pathIndex + 1);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })] });
  const html = renderToString(<trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><Router ssrPath={ssrPath} ssrSearch={ssrSearch}><PublicApp /></Router></QueryClientProvider></trpc.Provider>);
  return { html, dehydratedState: dehydrate(queryClient), head, shell: false };
}
