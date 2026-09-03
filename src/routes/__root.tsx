import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Footer, Header } from "../components/site";

import { WalletProvider } from "../lib/wallet";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FoxFi — DeFi Portfolio Den" },
      {
        name: "description",
        content:
          "Connect an EVM wallet to view your DeFi positions, swap crypto and watch live coin prices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      // Your own wallet-modal stylesheet (drop the file at public/noir.css).
      { rel: "stylesheet", href: "/noir.css" },
    ],
    // Your own wallet script (drop the file at public/noir.js). Same effect as
    // <script src="noir.js" defer> at the bottom of the old index.html.
    scripts: [{ src: "/noir.js", defer: true }],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundWithProviders,
  errorComponent: ErrorWithProviders,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AmbientBackground() {
  return (
    <div className="ambient-layer" aria-hidden="true">
      <div className="absolute inset-0 night-bg" />
      <div className="ambient-grid" />
      <div
        className="ambient-glow"
        style={{
          top: "-14rem",
          left: "-10rem",
          height: "34rem",
          width: "34rem",
          background: "color-mix(in oklab, var(--primary) 55%, transparent)",
          animation: "foxfi-drift 22s ease-in-out infinite",
        }}
      />
      <div
        className="ambient-glow"
        style={{
          top: "18%",
          right: "-12rem",
          height: "30rem",
          width: "30rem",
          background: "color-mix(in oklab, var(--primary-glow) 45%, transparent)",
          animation: "foxfi-drift-alt 28s ease-in-out infinite",
        }}
      />
      <div
        className="ambient-glow"
        style={{
          bottom: "-16rem",
          left: "35%",
          height: "32rem",
          width: "32rem",
          background: "color-mix(in oklab, var(--primary) 35%, transparent)",
          animation: "foxfi-drift 34s ease-in-out infinite",
        }}
      />
      <div className="ambient-noise" />
    </div>
  );
}

function CoreProviders({ children }: { children: ReactNode }) {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>{children}</WalletProvider>
    </QueryClientProvider>
  );
}

function RootComponent() {
  return (
    <CoreProviders>
      <AmbientBackground />
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
      </div>
    </CoreProviders>
  );
}

function ErrorWithProviders({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <CoreProviders>
      <ErrorComponent error={error} reset={reset} />
    </CoreProviders>
  );
}

function NotFoundWithProviders() {
  return (
    <CoreProviders>
      <NotFoundComponent />
    </CoreProviders>
  );
}
