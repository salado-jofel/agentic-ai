import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen
      bg-gray-50 text-center px-4"
    >
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold text-gray-800">Page Not Found</h1>
      <p className="text-gray-500 mt-2 text-sm">
        The report or page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white
          px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
