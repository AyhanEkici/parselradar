import PageStatePanel from "../components/ui/PageStatePanel";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12">
      <PageStatePanel
        variant="empty"
        title="Page not found"
        message="The page you requested does not exist or is no longer available. You can return to the public homepage or continue from your dashboard."
        actionHref="/"
        actionLabel="Back to home"
        secondaryHref="/dashboard"
        secondaryLabel="Open dashboard"
      />
    </main>
  );
}
