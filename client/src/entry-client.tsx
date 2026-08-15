import { trpc } from "@/lib/trpc";
import { COOKIE_NAME, UNAUTHED_ERR_MSG } from "@shared/const";
import { HydrationBoundary, QueryClient, QueryClientProvider, type DehydratedState } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot, hydrateRoot } from "react-dom/client";
import superjson from "superjson";
import { Router } from "wouter";
import App from "./App";
import { startLogin } from "./const";
import "./index.css";

declare global { interface Window { __RQ_STATE__?: unknown; __SSR_SHELL__?: boolean; } }
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
const redirectToLoginIfUnauthorized = (error: unknown) => { if (error instanceof TRPCClientError && typeof window !== "undefined" && error.message === UNAUTHED_ERR_MSG) startLogin(); };
queryClient.getQueryCache().subscribe(event => { if (event.type === "updated" && event.action.type === "error") redirectToLoginIfUnauthorized(event.query.state.error); });
queryClient.getMutationCache().subscribe(event => { if (event.type === "updated" && event.action.type === "error") redirectToLoginIfUnauthorized(event.mutation.state.error); });
const trpcClient = trpc.createClient({ links: [httpBatchLink({ url: "/api/trpc", transformer: superjson, headers() { try { const raw = sessionStorage.getItem("manus-cookie"); const pair = raw?.split(";").find(value => value.trim().startsWith(`${COOKIE_NAME}=`)); const token = pair?.trim().slice(`${COOKIE_NAME}=`.length); return token ? { Authorization: `Bearer ${token}` } : {}; } catch { return {}; } }, fetch(input, init) { return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" }); } })] });
const state = (window.__RQ_STATE__ ? superjson.deserialize(window.__RQ_STATE__ as any) : undefined) as DehydratedState | undefined;
const tree = <trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><HydrationBoundary state={state}><Router><App /></Router></HydrationBoundary></QueryClientProvider></trpc.Provider>;
const root = document.getElementById("root")!;
if (window.__SSR_SHELL__ || !root.firstChild) createRoot(root).render(tree); else hydrateRoot(root, tree);
