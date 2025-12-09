export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 md:text-left">
            &copy; {new Date().getFullYear()} Frontend Weekly Digest CN. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>Designed for Developers</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
