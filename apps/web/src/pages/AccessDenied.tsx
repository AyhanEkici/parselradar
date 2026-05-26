import PageStatePanel from "../components/ui/PageStatePanel";

export default function AccessDenied() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12">
      <PageStatePanel
        variant="locked"
        title="Access denied"
        message="Your account is signed in, but this page needs a different role or workspace permission. Use the dashboard to continue, or contact an admin if you believe this access should be enabled. This is a guarded recovery path: use dashboard recovery or switch account without losing application context."
        actionHref="/dashboard"
        actionLabel="Open dashboard"
        secondaryHref="/login"
        secondaryLabel="Switch account"
      />
    </main>
  );
}
