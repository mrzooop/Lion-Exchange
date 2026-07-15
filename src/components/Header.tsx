import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <Link href="/" className="text-lg font-semibold">
        Lion Exchange
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/my-listings"
          className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
        >
          My listings
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
          >
            Sign out
          </button>
        </form>
      </nav>
    </header>
  );
}
