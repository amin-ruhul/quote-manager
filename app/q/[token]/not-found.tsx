export default function QuoteLinkNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12 text-center">
      <h1 className="text-2xl font-semibold">This link isn&apos;t valid</h1>
      <p className="mt-3 text-body">
        The quote may have been removed, or the link was copied incorrectly.
        Check with the business that sent it to you.
      </p>
    </main>
  );
}
