import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background-color)] text-[var(--text-color)] selection:bg-indigo-500/30 font-sans p-4 sm:p-6 lg:p-8">
      <section className="cms-section cms-container max-w-3xl w-full mx-auto text-center flex flex-col items-center">
        
        {/* Artistic 404 Display */}
        <div className="relative mb-8 sm:mb-12 w-full flex items-center justify-center">
          {/* Background large text */}
          <h1 
            className="text-[8rem] sm:text-[12rem] lg:text-[15rem] font-black leading-none text-indigo-900/5 dark:text-indigo-100/5 select-none pointer-events-none"
            aria-hidden="true"
          >
            404
          </h1>
          
          {/* Foreground Title */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="cms-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-[var(--background-color)]/60 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-[var(--border-color)]">
              Page Not Found
            </h2>
          </div>
        </div>

        {/* User-friendly Message */}
        <p className="text-lg sm:text-xl opacity-70 max-w-xl mx-auto mb-10 leading-relaxed">
          We couldn't find the page you are looking for. It might have been moved, renamed, or is temporarily unavailable within our institutional portal.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/"
            className="cms-button w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
          >
            <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Return to Homepage
          </Link>
          
          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-[var(--text-color)] bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
          >
            Contact Support
          </Link>
        </div>

        {/* Quick Navigation Suggestions */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-[var(--border-color)] w-full max-w-lg mx-auto">
          <h3 className="text-xs font-bold tracking-widest uppercase opacity-50 mb-5">
            Helpful Quick Links
          </h3>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3" aria-label="Quick Links">
            <Link 
              href="/admissions" 
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors"
            >
              Admissions
            </Link>
            <Link 
              href="/departments" 
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors"
            >
              Academic Departments
            </Link>
            <Link 
              href="/faculty" 
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors"
            >
              Faculty Directory
            </Link>
            <Link 
              href="/notices" 
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors"
            >
              Public Notices
            </Link>
          </nav>
        </div>

      </section>
    </main>
  );
}
