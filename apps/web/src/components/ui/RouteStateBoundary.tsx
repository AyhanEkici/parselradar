import { Component, type ErrorInfo, type ReactNode } from "react";
import PageStatePanel from "./PageStatePanel";

interface RouteStateBoundaryProps {
  children: ReactNode;
}

interface RouteStateBoundaryState {
  hasError: boolean;
  message: string;
}

export class RouteStateBoundary extends Component<RouteStateBoundaryProps, RouteStateBoundaryState> {
  state: RouteStateBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): RouteStateBoundaryState {
    return {
      hasError: true,
      message: error.message || "The page could not be loaded.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("RouteStateBoundary caught a page error", { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12">
          <PageStatePanel
            variant="error"
            title="This page could not be loaded"
            message="A user-visible fallback prevented a blank screen. Try again from the dashboard, or reopen this page after refreshing."
            actionHref="/dashboard"
            actionLabel="Open dashboard"
            secondaryHref="/"
            secondaryLabel="Back to home"
          />
        </main>
      );
    }

    return this.props.children;
  }
}

export function RouteLoadingFallback() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12">
      <PageStatePanel
        variant="loading"
        title="Loading workspace"
        message="We are preparing this page and checking your current workspace context. This prevents a blank route while the app is loading."
      />
    </main>
  );
}

export function WorkflowRecoveryPanel() {
  return (
    <PageStatePanel
      variant="empty"
      title="Continue from a safe workspace action"
      message="Use the dashboard, properties, documents, or reports area to continue without losing your current operational context."
      actionHref="/dashboard"
      actionLabel="Open dashboard"
      secondaryHref="/properties"
      secondaryLabel="Open properties"
    />
  );
}
